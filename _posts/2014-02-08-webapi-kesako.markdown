---
layout: post
title: "ASP.NET Web API, kesako ?"
date: 2014-02-03 -0800
categories: [code, ASP.NET Web API]
comments: true
---

# Un petit peu d'archéologie

- 1996 : ASP
- 2002 : ASP.NET (Visual Studio 2003)
- 2005 : ASP.NET 2.0 (Visual Studio 2005
- 2007 : ASP.NET 3.5 (Visual Studio 2008)
- 2009 : ASP.NET MVC 1
- 2010 : ASP.NET MVC 2
- 2011 : ASP.NET MVC 3
- 2012 : ASP.NET 4.5 (Visual Studio 2012)
- 2012 : ASP.NET MVC 4 + Web API 1
- 2013 : ASP.NET MVC 5 + Web API 2

Le point interessant a noter, est que depuis 1996, le nombre d'utilisateurs d'internet a radicalement augmenté :

![Croissance des utilisateurs d'internet, par 100 habitants](/img/2014-02-08-webapi-kesako.png) 
Source : [Wikipedia](http://en.wikipedia.org/wiki/Internet#Users)

De ce fait, les frameworks permettant de développer les applications ont donc du suivre un rythme soutenu. Jusqu'en 2009, Microsoft mettait a jour son framework ASP.NET en même temps que Visual Studio, l'outil de développement. 
ASP.NET MVC change la donne, car il est distribué en tant que complément, et du coup ne subit par les contraintes temporelles de Visual Studio. Depuis sa sortie, le framework a été mis à jour à raison de une fois par an.

En meme temps que le nombre d'utilisateurs d'application web augmente, leurs attentes envers ses applications augmentent également : interfaces plus riches, plus de réactivité...

# Oui, et ?

L'avènement des framework tels ASP.NET ont permi de simplifier une bonne partie du code pour développer des applications de plus en plus dynamiques, mais dans une certaine limite, tant d'un point de vue de maintenabilité que de performance.

Traditionnelement, les interactions navigateur serveur suivent deux "canaux" :

- un flux html a chaque changement de page
- un ou plusieurs flux AJAX.

Avec ASP.NET, les services fournissant les données a des appels ajax peuvent être implémentés de différentes manières :

- services asmx / webmethods : obsolete
- IHttpHandlers : implémentation "manuelle" fastidieuse
- Services WCF : implémentation complexe dans le cas de services non SOA

ASP.NET MVC a apporté deux élements clés pour simplifier ce probleme

- le routing, pour découpler facilement la localisation du fichier source représentant le service, et sont adresse http
- le ModelbBinding, pour simplifier la sérialisation/désérialisation des données dans le flux HTTP

# Et Web API dans tout ca ?

Pendant ce temps la, d'autres patterns et habitudes commencaient a prendre de l'ampleur...

L'ouverture des données et des API des applications web, donnant naissance aux premiers [mashups](http://en.wikipedia.org/wiki/Mashup_%26web_application_hybrid%27) : mix de données issues de différents services pour en fournir un nouveau, comme par exemple http://www.housingmaps.com/, qui reprend les annonces immobilieres de Craigslist, et les places sur une carte Google maps. Et c'etait en 2005 ! 
REpresentational State Transfer (ou [REST](http://en.wikipedia.org/wiki/Representational_state_transfer)), définit une sémantique pour exposer des services sur le protocole HTTP.
Enfin, le templating client a également pris de l'essor, toujours pour améliorer la réactivité de nos chères applications.

Du coup, certains utilisateurs de ASP.NET MVC ont souhaité pour disposer des capacités de Routing, ModelBinding, etc, de ASP NET MVC, sans utiliser la partie templating. D'où la naissance de ASP.NET Web API.

# Et concrètement, ca fait quoi ?

La suite, au prochain épisode !