---
layout: post
title: "Implémentation naïve d'un Serializer en C# - Partie 5"
date: 2013-04-06 -0800
categories: [c#, code]
comments: true
---

Après avoir refactorisé le code du Serializer, j'ai choisi d'implémenter la sérialisation des implémentations d'interfaces. En effet, si un objet possède des propriétés de type interface (IList<T> par exemple), ce n'est pas pour autant qu'il ne doit pas pouvoir être sérialisable.

L'implémentation de la classe InterfaceSerializer s'est avérée plus simple que prévue : dans le principe, si un type de propriété est une interface, et que la valeur de cette propriété est non nulle, le type de la valeur (via GetType()) est sérialisé.

Ensuite, on appelle simplement le sérializer racine, en lui substituant le type de l'interface par le type de l'instance qui l'implémente.

```` csharp
public override void Serialize(ExtendedBinaryWriter writer, object source, Type sourceType)
{
    var st = source.GetType();
 
    // write implemented type
    writer.Write(st);
 
    // continue with implemented type and not interface
    base.Serialize(writer, source, st);
}
````