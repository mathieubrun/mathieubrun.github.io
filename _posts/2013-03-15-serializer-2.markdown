---
layout: post
title: "Implémentation naïve d'un Serializer en C# - Partie 2"
date: 2013-03-29 -0800
categories: [c#, code]
comments: true
---

Pour la suite de cette série, je vais vous présenter le fonctionnement de la 1ere itération du serializer. Cette version supporte les types de base, nullables ou non, ainsi que les graphes d'objets simples (pas de cycles, pas de tableaux).

Dans un premier temps, le serializer va détecter le type de l'objet passé en paramètre. Si il s'agit d'un type valeur standard, celui ci est écrit dans le flux.

Si il s'agit d'un objet, celui ci sera inspecté. Cette inspection servira a déterminer si il s'agit d'un Nullable, ou d'un autre type d'objet. Dans les deux cas, on écrira dans le flux un booléen indiquant si l'objet est null.

L'écriture dans le flux se fait au travers de la classe BinaryWriter, étendue pour gérer les cas spécifiques. La classe BinaryWriter de base ne supportant les chaines nulles, la méthode Write(string) est surchargée pour gérer ce cas.

La désérialisation suit le même principe, le flux d'octets est lu à l'aide d'une implémentation spécifique de la classe BinaryReader, et l'objet est reconstitué.

Le code source est disponible sur GitHub : https://github.com/mathieubrun/Cogimator.Serialization/blob/master/Cogimator.Serialization/ReflectionSerializer.cs