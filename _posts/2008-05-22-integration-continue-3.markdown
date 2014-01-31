---
layout: post
title: "Integration continue : Partie 3, Arborescence Projet"
date: 2008-05-22 -0800
categories: [integration continue]
comments: true
---

Avant d'aller plus loin, je vais rapidement décrire l'arborescence projet que je vais utiliser pour les billets à venir (cf image):

![Arborescence projet](/img/2008-05-22-integration-continue-3.png)

- **Apps** : applications Winforms, Console, WebForms, tout ce qui est exécutable
- **Libs** : toutes les bibliothèques de classes, ou tout ce qui n'est pas exécutable
- **References** : toutes les librairies externes référencéés dans votre solution (NHibernate, Castle Project, etc)(non présent dans la solution visual studio, uniquement dans l'arborescence "physique")
- **Scripts** : scripts de compilation, de création de base de données
- **Tests** : tests unitaires

Important : si vous créez des dossiers de solution dans Visual Studio, attention lors de la création d'un nouveau projet : par défaut, celui-ci est placé à la racine de votre dossier de solution. Il en est de même pour les éléments de solution (par ex : Demo.config et Demo.nunit), il est préférable de les créer physiquement dans le dossier voulu, et de les ajouter à la solution dans un deuxième temps (via "Ajouter un élément existant").

Cette arborescence n'est évidemment pas figée dans ses termes, il s'agit juste de "classer" un peu notre solution. Il est également possible de créer des sous dossiers, comme par exemple "Console" ou "WebApps" dans "Apps".

Concernant les librairies externes, j'ai pris le parti de les lier à chaque solution : cela permet d'éviter les problèmes lors d'une mise à niveau de librairie. Si tous vos projets référencent la meme librairie (NHibernate par exemple), qu'une mise à jour avec un changement d'API de leur part est effectuée, tous vos projets sont impactés. En liant les librairies par projet, vous pouvez effectuer les mises à jour dans chaque projet, si le besoin s'en fait ressentir.