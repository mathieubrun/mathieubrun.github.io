---
layout: post
title: "Utilisation mémoire d'un processus .NET"
date: 2013-04-19 -0800
categories: [c#, performance]
comments: true
---

Lorsque l'on ouvre le gestionnaire des taches Windows, on peut y voir un onglet "Mémoire (jeu de travail privé)" pour chaque processus. Mais que ce cache derrière ce chiffre ? Afin de le savoir, je vais vous présenter l'outil VMMap, de Sysinternals, disponible au téléchargement sur [Technet](http://technet.microsoft.com/en-us/sysinternals/dd535533.aspx).

Cet outil va vous présenter trois graphes de mémoires :

- **Commited** : représente la quantité qu'occuperaient tout le code et données de l'application, ainsi que les fichiers mappés par celle ci.
- **Private Bytes** : représente la quantité de mémoire demandée par le processus, et ne pouvant être partagée avec d'autres processus. Cette mémoire peut se trouver sur un fichier d'échange.
- **Working Set** : représente la mémoire physique utilisée par le processus, c'est à dire qu'aucun accès au fichier d'echange ne sera fait lors d'un accès à cette mémoire.

Ces trois graphes sont subdivisés en différentes catégories. Typiquement, les catégories sur lesquelles le développeur pourra avoir un impact sont :

- **Image** : représente les librairies chargées par l'application.
- **Managed Heap** : représente les tas alloués par la CLR .Net. Une augmentation incontrôlée de cette valeur peut indiquer une fuite mémoire.
- **Private** : représente la mémoire non allouée par la CLR .Net. Par exemple,  les données d'une image chargée au travers de [Bitmap.FromFile](http://msdn.microsoft.com/en-us/library/4sahykhd.aspx) seront dans cette zone mémoire.

Voici quatre captures d'écran de l'outil VMMap,  représentant quatre états de la mémoire pour une application simple.

Après le chargement de l'application :

![Utilisation mémoire initiale](/img/2013-04-19-utilisation-memoire.png)

On peut constater que la mémoire "Managed Heap" ainsi que "Private Data" sont respectivement de 2.3 et 25 Mo.

Après création de 10 tableaux de 1000000 bytes (non initialisés) :

![Aprsè allocation de mémoire managée](/img/2013-04-19-utilisation-memoire1.png)

La partie "Managed Heap" dans "Private Bytes" est maintenant de 109 Mo. Il s'agit uniquement de mémoire réservée, et non de mémoire utilisée ! C'est bien pour cela que le "Managed Heap" dans le "Working Set" est toujours de 2.5Mo.

Après l'initialisation de ces tableaux :

![Après initialisation de ces tableaux](/img/2013-04-19-utilisation-memoire2.png)

Cette fois ci, la taille du "Managed Heap" dans le "Working Set" a augmenté de manière significative : 108 Mo.

Après chargement de 300 images png de 40Ko.

![Après chargement de fichiers PNG](/img/2013-04-19-utilisation-memoire3.png)

Les données des images ont été allouées dans "Private data", car System.Drawing.Bitmap utilise du code non managé.

Enfin, pour suivre la consommation mémoire d'une application, on pourra se baser sur les compteurs de performance suivants :

![Compteurs de performance](/img/2013-04-19-utilisation-memoire4.png)