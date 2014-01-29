---
layout: post
title: "Imprimante 3D, les premiers pas"
date: 2013-06-14 -0800
categories: [3d printing]
comments: true
---

Le montage
-

Une Printrbot LC V2, en kit, vous la recevrez sous cette forme :

![Le kit PrintrBot à l'arrivée](/img/2013-06-14-imprimante-3d-1.jpg)

Un ensemble de sachets, de vis, de pièces en bois découpées au laser. Comptez au moins 6h pour le montage. La documentation indique 4h, mais c'est pour quelqu'un qui conçoit et qui monte des imprimantes 3D toute la journée.

Lors du montage, il s'agira de bien serrer toutes les vis, sans casser le bois, pour qu'il n'y ait aucun jeu entre les pièces fixes. Attention aux axes X, ne pas les verrouiller avant d'avoir bien vérifié que le charriot coulisse bien.

Pour les courroies, il faut les tendre suffisamment pour qu'elles produisent une note grave quand on les pince comme une corde de guitare. Pas trop de tension non plus, sinon vous allez endommager l'axe du moteur ou la courroie !

Premier lancement
-

Avant de brancher la machine, pensez a bien vérifier que les vis des endstop X Y et Z sont bien réglées. Si elles n'activent pas les interrupteurs lorsque le charriot ou le plateau arrive en butée, vous risquez d'endommager la machine.

Le plateau
-

La chose la plus importante pour une impression réussie est un plateau bien plan. Une plaque de verre (0.4mm d'épaisseur) aux bonnes dimensions, et fixé avec des pinces fera l'affaire :

![Le plateau d'impression](/img/2013-06-14-imprimante-3d-11.jpg)

Dans le cas de la PrintrBot LC V2, j'ai du couper les pinces, sinon le charriot butait dedans :

![Détail sur les pinces](/img/2013-06-14-imprimante-3d-12.jpg)

Pour les fixer, des pinces a circlip seront d'une grande aide:

![Deux pinces à circlip](/img/2013-06-14-imprimante-3d-13.jpg)

Maintenant, il va falloir régler la hauteur de chaque coin du plateau pour que la tête d'impression soit toujours a la même hauteur. 

Pour cela, j'utilise des jauges d'épaisseur, et je règle la hauteur sur 0.15mm. Histoire de vous éviter des surprises, il vaut mieux faire ce réglage avec l'extrudeur et le plateau a température : 180° et 60° respectivement, pour du PLA. 

Pourquoi 0.15 ? Parce qu'a cette épaisseur, la jauge est assez souple. Ensuite, dans slic3r, vous avez une option pour "baisser" le z. En effet, slic3r considère le z calibré a 0. Donc  une des premières choses de faites dans le GCode est de placer la buse a la valeur z correspondant au layer height, par défaut 0.30. Donc dans notre cas, le z se trouvera a 0.45 mm du plateau au début de l'impression. Bien trop haut. Je l'ai compensé par un adjust z de -0.15. Donc la tête se trouvera a z = 0.30 mm du plateau.