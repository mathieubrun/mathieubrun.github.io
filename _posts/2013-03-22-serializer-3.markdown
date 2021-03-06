---
layout: post
title: "Implémentation naïve d'un Serializer en C# - Partie 3"
date: 2013-03-29 -0800
tags: [c#]
comments: true
github: "https://github.com/mathieubrun/Samples.SerializerFun"
---

Cette semaine, l'itération suivante de notre serializer supporte les tableaux d'objets.

Avec la propriété Array.Rank ainsi que la méthode Array.GetLength(int), je peux déterminer le nombre de dimensions du tableau, ainsi que la taille de celles-ci. Ces valeurs seront sérialisées dans le flux binaire pour reconstruire le tableau lors de la désérialisation.

La méthode Array.GetValue(int[]) permet de récupérer la valeur dans le tableau en fonction des indices passés en paramètre. Le calcul de tous les indices se fait en deux étapes. Dans un premier temps, il faut déterminer les indices possibles pour chaque dimension du tableau, en fonction de sa longueur. Ensuite, il reste à calculer le produit cartésien de tous ces indices. Cet ensemble servira à sérialiser l'ensemble des valeurs du tableau.

```` csharp
if (type.IsArray)
{
	var arr = source as Array;
	var dims = new int[arr.Rank];

	writer.Write(arr.Rank);

	for (int i = 0; i < dims.Length; i++)
	{
		dims[i] = arr.GetLength(i);
		writer.Write(dims[i]);
	}

	foreach (var indice in CartesianProduct(GetDimensionsAndLengths(dims)))
	{
		SerializeBase(type.GetElementType(), arr.GetValue(indice.ToArray()), writer);
	}

	return;
}
````

La désérialisation est simplement le procédé inverse.