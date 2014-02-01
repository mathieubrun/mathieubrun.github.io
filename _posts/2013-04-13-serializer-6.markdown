---
layout: post
title: "Implémentation naïve d'un Serializer en C# - Partie 6"
date: 2013-04-13 -0800
categories: [c#, code]
comments: true
---

Une des dernières parties de cette série d'article concerne la sérialisation correcte des graphes d'objets, et surtout de leurs références. En effet, le tableau déclaré dé la manière suivante :

```` csharp
var instance = new TestReference() { Str = "3" };
var array = new TestReference[] { instance, instance, instance, instance };
````

Ne doit pas sérialiser l'objet "Instance" quatre fois, mais une seule. La résolution de ce problème permettra également d'aborder les références cycliques :

```` csharp
var t1 = new TestReference() { Str = "1" };
var t2 = new TestReference() { Str = "2" };
 
t1.Reference = t2;
t2.Reference = t1;
````

Dans un premier temps, il faut pouvoir identifier les objets de manière unique. Dans un premier temps, j'ai régardé du coté de la classe GCHandlepour obtenir l'adresse mémoire des objets. Cette méthode ne s'est pas avérée adaptée : le Garbage Collector pouvant déplacer les objets et donc changer leur adresse mémoire.

En fait, le framework offre une classe toute faite pour identifier les objets : ObjectIDGenerator, qui permet d'obtenir un identifiant unique pour chaque objet passé en paramètre à la méthode GetId. Et en bonus, cette méthode indique même si il s'agit d'une instance déjà identifiée.

La modification de la classe DefaultObjectSerializer s'avère donc simple :

```` csharp
public override void Serialize(ExtendedBinaryWriter writer, object source, Type sourceType)
{
    bool firstTime;
 
    // generate unique id for object, in order not to save same object multiple times
    var key = idGenerator.GetId(source, out firstTime);
 
    writer.Write(firstTime);
    writer.Write(key);
 
    if (firstTime)
    {
        // inspect object
        foreach (var prop in sourceType.GetFields(BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Public).OrderBy(x => x.Name))
        {
            this.SerializeBase(prop.FieldType, prop.GetValue(source), writer);
        }
    }
}
 
public override object Deserialize(ExtendedBinaryReader source, object target, Type type)
{
    var firstTime = source.ReadBoolean();
    var key = source.ReadInt64();
 
    if (!firstTime)
    {
        return cache[key];
    }
    else
    {
        var destination = Activator.CreateInstance(type);
 
        // add instance to cache before deserializing properties, to untangle eventual cyclic dependencies
        cache.Add(key, destination);
 
        // inspect object
        foreach (var prop in type.GetFields(BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Public).OrderBy(x => x.Name))
        {
            var v = this.DeserializeBase(prop.FieldType, destination, source);
            prop.SetValue(destination, v);
        }
 
        return destination;
    }
}
````

En résumé, pour la sérialisation, on identifie chaque objet sérialisé, et si il est connu, on ne sérialise que son identifiant. Pour la désérialisation, on place les objets et leur identifiant dans un dictionnaire faisant office de cache.

La subtilité concerne les références cycliques : il faut placer l'objet dans le cache juste après sa création, car lorsque l'on va désérialiser les propriétés de l'objet, on pourrait rencontrer une référence vers un objet que l'on n'aurait pas encore désérialisé.

Comme toujours, les tests unitaires permettent de valider que les modifications n'entrainent pas de régressions.

Le code source de cet article est disponible sur [GitHub](https://github.com/mathieubrun/Cogimator.Serialization/tree/5bb1ee0197580c26809da0a570f78d62897f84e0), ainsi que la [dernière version](https://github.com/mathieubrun/Cogimator.Serialization).