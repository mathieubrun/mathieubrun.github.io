---
layout: post
title: "Implémentation naïve d'un Serializer en C# - Partie 4"
date: 2013-03-29 -0800
categories: [c#, code]
comments: true
---

Après avoir implémenté le support de la sérialisation des tableaux,  le code est devenu moins lisible. En effet, toute la logique pour le choix du type d'objet à sérialiser se faisait dans une seule méthode,  bardée de ifs. Le but de cette implémentation étant de m'amuser, je ne pouvais laisser cette situation perdurer.

Pour simplifier le code, j'ai choisi d'implémenter une interface [ISubSerializer](https://github.com/mathieubrun/Samples.SerializerFun/blob/master/Samples.SerializerFun/ReflectionBased/ISubSerializer.cs) plus spécialisée. Le principe est simple, chaque implémentation de ISubSerializer est applicable pour un type d'objet donné, et sait comment le sérialiser/déserialiser. Ces instances sont organisées de manière hiérarchique, chacune pouvant avoir des ISubSerializer enfant.

```` csharp
interface ISubSerializer
{
    bool CanApply(Type type);
    void Serialize(ExtendedBinaryWriter writer, object source, Type sourceType);
    object Deserialize(ExtendedBinaryReader source, object target, Type type);
}
````

Le serializer racine, quant à lui, se charge d'appeler l'implémentation ISubSerializer adéquate, en fonction du type d'objet à sérialiser.

```` csharp
public void SerializeBase(Type sourceType, object source, ExtendedBinaryWriter writer)
{
    var serializers = this.SubSerializers ?? this.Root.SubSerializers;
 
    foreach (var s in serializers)
    {
        if (s.CanApply(sourceType))
        {
            s.Serialize(writer, source, sourceType);
            return;
        }
    }
}
````

Par exemple, dans le cas des types nullables, la class ObjectSerializer se charge uniquement de sérialiser un boolean indiquant si l'objet est null ou non.

```` csharp
public override void Serialize(ExtendedBinaryWriter writer, object source, Type sourceType)
{
    // always write a boolean indicating if object is null or not
    var hasValue = source != null;
    writer.Write(hasValue);
 
    if (hasValue)
    {
        this.SerializeBase(sourceType, source, writer);
    }
}
````

Ensuite, la classe NullableSerializer va appeler le serializer racine pour sérialiser le type valeur sous-jacent.

```` csharp
public override void Serialize(ExtendedBinaryWriter writer, object source, Type sourceType)
{
    this.SerializeBase(sourceType.GetGenericArguments().First(), source, writer);
}
````

De cette manière,  ajouter le support pour de nouveaux types devient l'affaire d'implémenter un nouveau ISubSerializer et de le déclarer dans le serializer racine.

Le code source de cet article est disponible sur [GitHub](https://github.com/mathieubrun/Samples.SerializerFun).