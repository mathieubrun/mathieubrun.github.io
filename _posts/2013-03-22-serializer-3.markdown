---
layout: post
title: "Implémentation naïve d'un Serializer en C# - Partie 3"
date: 2013-03-29 -0800
categories: [c#, code]
comments: true
---

Cette semaine, l'itération suivante de notre serializer supporte les tableaux d'objets.

Avec la propriété Array.Rank ainsi que la méthode Array.GetLength(int), je peux déterminer le nombre de dimensions du tableau, ainsi que la taille de celles-ci. Ces valeurs seront sérialisées dans le flux binaire pour reconstruire le tableau lors de la désérialisation.

La méthode Array.GetValue(int[]) permet de récupérer la valeur dans le tableau en fonction des indices passés en paramètre. Le calcul de tous les indices se fait en deux étapes. Dans un premier temps, il faut déterminer les indices possibles pour chaque dimension du tableau, en fonction de sa longueur. Ensuite, il reste à calculer le produit cartésien de tous ces indices. Cet ensemble servira à sérialiser l'ensemble des valeurs du tableau.

La désérialisation est simplement le procédé inverse.

Le code source est disponible sur GitHub : https://github.com/mathieubrun/Cogimator.Serialization/blob/master/Cogimator.Serialization/ReflectionSerializer.cs