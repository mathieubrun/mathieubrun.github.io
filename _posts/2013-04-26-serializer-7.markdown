---
layout: post
title: "Implémentation naïve d'un Serializer en C# - Partie 7"
date: 2013-04-26 -0800
tags: [c#]
comments: true
---

La dernière ligne droite dans l'implémentation de ce Serializer était d'avoir des performances similaires (ou meilleures!) à celles du [BinaryFormatter](http://msdn.microsoft.com/en-us/library/system.runtime.serialization.formatters.binary.binaryformatter.aspx) du Framework .Net. En utilisant uniquement la reflection, ce n'était pas gagné d'avance.

```` csharp
foreach (var prop in type.GetFields(BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Public).OrderBy(x => x.Name))
{
    var v = this.DeserializeBase(prop.FieldType, destination, source);
 
    prop.SetValue(destination, v);
}
```` 

En effet, a chaque serialisation de la meme classe, ce code va récupérer les champs, encore et encore, ce qui n'est de loin pas efficace.

L'optimisation que j'ai choisi a été de remplacer l'utilisation de la reflection par la création de [LambdaExpression](http://msdn.microsoft.com/en-us/library/system.linq.expressions.lambdaexpression.aspx) basées sur les champs des objets a sérialiser.

```` csharp
gettersForType = new List<Tuple<Type, Func<object, object>>>();
 
// create getter list from fields
foreach (var prop in sourceType.GetFields(BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Public))
{
    var getters = CreateGetter(prop);
 
    gettersForType.Add(Tuple.Create(prop.FieldType, getters));
}
````

Ici, la reflection sera utilisée une fois pour obtenir la liste des champs, et générer les Getters qui permettront d'en lire les valeurs.

La méthode CreateGetter va retourner un Func<object, object> après avoir crée et compilé une LambdaExpression.

```` csharp
private static Func<object, object> CreateGetter(FieldInfo field)
{
    var fieldType = field.DeclaringType;
 
    // the input parameter for the lambda
    var sourceParameter = Expression.Parameter(typeof(object), "source");
 
    // as the parameter is of object type, a cast or conversion may be required
    var castedSource = GetExpressionAsTypeIfNeeded(sourceParameter, fieldType);
 
    // get field value
    var fieldExpression = Expression.Field(castedSource, field);
 
    // as the return parameter is of type object, a cast or conversion may be required
    var castedField = Expression.TypeAs(fieldExpression, typeof(object));
 
    // the lambda expression for accessing a field on an object
    var expr = Expression.Lambda<Func<object, object>>(castedField, sourceParameter);
    return expr.Compile();
}
````

Les éléments clés dans cette méthode sont :

- La déclaration d'un paramètre pour la LambdaExpression, de type object, qui sera casté ou converti dans le bon type. En effet, comme on ne connait pas en avance le type de l'objet que l'on va désérialiser, la signature de la lambda expression est Func<object,object>.
- La récupération d'une expression renvoyant la valeur du champ
- Le cast de cette valeur en object pour la renvoyer.

De la même manière, j'avais implémenté une méthode CreateSetter, qui elle renvoyait un Action<object, object>. Cette méthode, créée a la volée pour un champ donné, prenait en paramètre l'objet en cours de désérialisation, ainsi que la valeur à assigner au champ.

```` csharp
private static Action<object, object> CreateSetter(FieldInfo field)
{
    var fieldType = field.DeclaringType;
 
    // the input parameter for the lambda
    var destinationParameter = Expression.Parameter(typeof(object), "destination");
    var valueParameter = Expression.Parameter(typeof(object), "fieldValue");
 
    var castedDestination = GetExpressionAsTypeIfNeeded(destinationParameter, fieldType);
    var castedValue = GetExpressionAsTypeIfNeeded(valueParameter, field.FieldType);
 
    // get field value
    var fieldExpression = Expression.Field(castedDestination, field);
 
    // as the return parameter is of type object, a cast or conversion may be required
    var assign = Expression.Assign(fieldExpression, castedValue);
 
    // the lambda expression for accessing a field on an object
    var expr = Expression.Lambda<Action<object, object>>(assign, destinationParameter, valueParameter);
    return expr.Compile();
}
````

Le souci de cette méthode est quelle renvoie un Action<object,object>. Or si les types valeurs "basiques" comme int, long, float, ne posent pas de souci, comme ils sont gérés par un sérializer a part, les structs, qui sont également passés par valeurs, ne sont pas désérialisés !

En effet, la méthode va agir sur une copie de l'instance en cours de désérialisation, dont les champs garderont les valeurs par défaut.

J'ai donc choisi d'implémenter une méthode plus complète, qui va non seulement générer le code pour définir les valeurs des champs, mais également prendre en charge la création de l'instance qui va être désérialisée. Cette méthode renvoie une fonction, qui prend en paramètre le flux dans lequel lire les valeurs a désérialiser, l'instance de l'objet sur laquelle seront définies les champs, et qui retourne l'instance désérialisée.

Dans le cas des types valeurs, la fonction générée se charge de la création de l'instance, et la retourne. De ce fait, on ne souffre plus des problèmes posés par l'implémentation précédente.

```` csharp
private Func<ExtendedBinaryReader, object, object> CreateSetters(Type type)
{
    // the input parameters of the generated lambda : the destination instance on which the setters will be applied
    var destinationParameter = Expression.Parameter(typeof(object), "destination");
 
    // the BinaryReader from which to get the data
    var binaryReaderParameter = Expression.Parameter(typeof(ExtendedBinaryReader), "source");
 
    // a variable to hold the destination instance
    var deserializedType = Expression.Variable(type, "destination");
 
    var expressionBlock = new List<Expression>();
 
    if (!type.IsValueType)
    {
        // if the type is not a value type the instance given as a parameter is used, or a new instance is created
        var coalesce = Expression.Coalesce(GetExpressionAsTypeIfNeeded(destinationParameter, type), Expression.New(type));
 
        // the first "line" of the lambda is to assign the destination variable
        expressionBlock.Add(Expression.Assign(deserializedType, coalesce));
    }
    else
    {
        // for a value type, a "new" instance is created
        expressionBlock.Add(Expression.Assign(deserializedType, Expression.New(type)));
    }
 
    var thisAsMethodTarget = Expression.Constant(this);
 
    var methodToCall = typeof(FastDefaultObjectSerializer).GetMethod("DeserializeBase");
    var deserializedTypeAsObject = Expression.TypeAs(deserializedType, typeof(object));
 
    foreach (var field in type.GetFields(BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Public))
    {
        // access to the field on the instance being deserialized
        var fieldExp = Expression.Field(deserializedType, field);
 
        var fieldType = Expression.Constant(field.FieldType);
 
        // a methood call expression
        var call = Expression.Call(
            thisAsMethodTarget,
            methodToCall,
            fieldType,
            deserializedTypeAsObject,
            binaryReaderParameter);
 
        // the result of the method call is converted to the field type if needed ...
        var callResultAsFieldType = GetExpressionAsTypeIfNeeded(call, field.FieldType);
 
        // ... and is assigned to the field
        var assignToField = Expression.Assign(fieldExp, callResultAsFieldType);
 
        expressionBlock.Add(assignToField);
    }
 
    // the return part of the lambda
    var returnTarget = Expression.Label(typeof(object));
    var returnExpression = Expression.Return(returnTarget, deserializedTypeAsObject, typeof(object));
    var returnLabel = Expression.Label(returnTarget, deserializedTypeAsObject);
 
    expressionBlock.Add(returnExpression);
    expressionBlock.Add(returnLabel);
 
    var block = Expression.Block(new ParameterExpression[] { deserializedType }, expressionBlock);
 
    var lambda = Expression.Lambda<Func<ExtendedBinaryReader, object, object>>(block, binaryReaderParameter, destinationParameter);
 
    return lambda.Compile();
}
````

Dans cette méthode, les points clés sont :

- le test sur le type de l'objet a désérialiser : si il s'agit d'un type valeur, la méthode va le créer, et le retourner. Si non, la méthode utilisera l'instance passée en paramètre.
l'appel a la méthode DeserializeBase, afin de s'appuyer sur les mécanismes implémentés précédemment pour la désérialisation
- la génération d'un bloc de code pour la désérialisation de chaque champ

Cette optimisation a permi de diviser par 3 le temps de serialisation/deserialisation (10000 iterations) d'une classe simple.

Comme toujours, le code est disponible sur [github](https://github.com/mathieubrun/Samples.SerializerFun)
