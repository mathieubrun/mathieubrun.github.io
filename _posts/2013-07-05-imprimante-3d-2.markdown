---
layout: post
title: "Premières calibrations de votre imprimante"
date: 2013-07-05 -0800
categories: [3d printing]
comments: true
---

D'apres le calculateur de Josef Prusa vous pouvez commencer avec les commandes suivantes :

^ M92 X64 ; calibrate X 
^ M92 Y64 ; calibrate Y 
^ M92 Z2267.72; calibrate Z 
^ M92 E533 ; calibrate E

Ces commandes sont a placer dans la section "Start GCode" de slic3r :

![2013-11-30-nuget](/img/2013-07-05-imprimante-3d-2.png)

L'extrudeur
-

La première chose à faire est de bien calibrer votre extrudeur. Sur une extrusion de 10cm, l'erreur doit être en dessous des 0.5 mm !

Dans un premier temps, dans l'onglet "Controle manuel" de Repetier, envoyer la commande "M92 E533" et extruder ensuite 10mm :

![2013-11-30-nuget](/img/2013-07-05-imprimante-3d-21.png)

Ensuite, placer un repère sur le fil a environ 10cm (un bout de scotch fera bien l'affaire), et mesurer. Pour la mesure, j'utilise un pied a coulisse numérique, posé sur le guide fil de l'extrudeur, pour le stabiliser :

![2013-11-30-nuget](/img/2013-07-05-imprimante-3d-22.jpg)

Ensuite, extruder 80mm, soit en une fois, ou bien en demandant plusieurs extrusions de 10mm. Pensez bien a attendre la fin d'une extrusion avant de cliquer a nouveau sur le bouton. Sinon, l'imprimante peut réagir de manière étrange.

Une fois l'extrusion finie, mesurez a nouveau. Si la différence entre la mesure avant extrusion et la mesure après ne correspond pas à 80mm, faites un produit en croix pour obtenir la nouvelle valeur M92 Exxx a envoyer. Envoyer la nouvelle valeur, extrudez 10mm, et recommencez les mesures jusqu'à obtenir un résultat avec moins de 0.5% de marge.

Les axes X et Y
-

Pour calibrer les axes X et Y, j'ai utilisé ce modele thingiverse. Une fois les axes calibrés j'obtiens une précision en dessous du 1/10e de mm!

![2013-11-30-nuget](/img/2013-07-05-imprimante-3d-23.jpg)

L'axe Z
-

Pour l'axe Z, j'ai laissé la valeur par défaut du calculateur.
