---
layout: post
title: "Implémentation naïve d'un Serializer en C# - Partie 1"
date: 2013-03-29 -0800
categories: [c#, code]
comments: true
---

Cet article sera le premier d'une série qui me démangeait depuis quelque temps, sur l'implémentation d'un serializer en C#. Le but de cette implémentation n'est pas de rivaliser avec un protobuf-net, mais plutôt l'occasion d'écrire un peu de code plus bas niveau que d'habitude.

Pour commencer, le but est d'obtenir le même niveau de fonctionnalité que le BinaryFormatter du Framework. Voilà pour nos spécifications fonctionnelles détaillées !

Au niveau de l'implémentation, j'ai choisi de commencer par une approche naïve basée sur la reflection. Cette première étape permettra la mise en place des tests unitaires automatisés servant à vérifier le bon fonctionnement du Serializer.

Ce bon fonctionnement s'appuie sur deux phases : durant la sérialisation, notre objet est transformé en tableau d'octets. Durant la désérialisation, ce même tableau d'octets sert à recomposer notre objet. Il faut dont choisir un format de stockage pour les différentes données présentes. J'ai choisi de rester le plus simple possible : les membres des notre objet sont sérialisés dans l'ordre alphabétique. 

Ceci a pour implication, tout comme le BinaryFormatter, de ne permettre de désérialiser uniquement dans le même objet: si des définitions de champs sont modifiées, le processus ne fonctionnera plus.

Les champs de notre objet étant sérialisés dans l'ordre alphabétiques, dans un premier temps les champs de type valeur sont convertis en tableau d'octets et placés les uns a la suite des autres. Pour les string, les octets représentant la chaîne seront précédés de la longueur de celle ci.

Pour les autres types de champs (object, nullables, ...) ce sera l'objet de l'article suivant.