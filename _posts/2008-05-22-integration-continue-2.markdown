---
layout: post
title: "Integration continue : Partie 2, Controle de code source"
date: 2008-05-22 -0800
categories: [integration continue]
comments: true
---

Pour cette partie sur le contrôle de code source, nous allons mettre en place et utiliser Subversion. Il vous faudra télécharger VisualSVN Server (http://www.visualsvn.com/server/), ainsi que TortoiseSVN (http://tortoisesvn.tigris.org/). Vous pouvez également installer AnkhSVN (http://ankhsvn.open.collab.net/) si vous souhaitez bénéficier de l'intégration dans Visual Studio (attention, pour Visual Studio 2008, prenez bien la version 1.0.3 ou supérieure).

Une fois VisualSVN Server installé sur le serveur, TortoiseSVN et AnkhSVN installés sur les clients, nous allons pouvoir commencer.

Sur le serveur
-

En premier lieu, il va falloir créer un repository. Un repository est un espace où sera stocké le code source. Toute modification de fichier (commit) dans le repository entraînera une incrémentation du numéro de version (revision) global au repository. Le repository sera physiquement stocké à l'endroit spécifié lors de l'installation de VisualSVN Server. C'est ce répertoire que vous devrez sauvegarder régulièrement. Pour aller plus loin : Subversion in action : revisions.

Donnez un nom explicite à votre repository (le nom de la solution Visual Studio, le codename du projet...). Attention à bien laisser cocher la case "Create default structure". Cette structure de répertoire est une convention :

- trunk : code source "actuel" du projet
- tags : versions spécifiques du projet, comme par exemple les différentes livraisons ou versions installées en production
- branches : version en développement : ajout de nouvelles fonctionnalités.
- Tous les détails sont expliqués dans ce post de Bill Simser.

Le repository étant crée, nous allons en autoriser l'accès à nos développeurs. Créez un (ou plusieurs) utilisateurs, via "Create new user" de la page d'accueil.

Il ne reste plus qu'à créer un groupe "developpers", via "Create new group" de la page d'accueil et enfin d'associer notre utilisateur au groupe.

La dernière étape consiste à accorder les droits d'accès à notre groupe sur le repository (ou sur tous les repositories, selon votre goût). Pour cela, clic-droit sur un objet dans l'arborescence, et "Security".

Avant de passer sur le poste de développeur, pensez à note l'url du repository (normalement de la forme http://serveur:8080/svn/NomDuRepository).

Sur le poste de développeur
-

Nous allons créer une copie locale du repository. Toute modification dans cette copie locale est répercutée via un "Commit", et toute modification du repository est repercutée sur la copie locale via un "Update". Pour gérer cette copie locale, nous allons utiliser TortoiseSVN (AnkhSVN reprend les mêmes principes, mais directement dans Visual Studio).

Après avoir installé TortoiseSVN, créez un nouveau dossier (par ex: d:\IntegrationContinue), faites un clic droit sur ce nouveau dossier, et choisissez "SVN Checkout". Renseignez l'url du repository crée plus tot (http://serveur:8080/svn/IntegrationContinue/trunk), et validez. Attention, l'url doit être suivie de "trunk". Votre copie locale est maintenant créée !

Ensuite, toujours dans ce dossier : faites un clic droit -> TortoiseSVN -> Settings. Dans l'entrée "General", "Subversion", "Global ignore patterns", vous pouvez saisir "bin obj *.suo *.user". Ceci indiquera a TortoiseSVN de toujours ignorer ces répertoires et ces fichiers, et évitera de placer les exécutables ainsi que les fichiers temporaires de compilation sous controle de code source. Les paramètres de solution/projet par utilisateur ne seront également pas placés sous contrôle de code source.

![TODO](/img/2008-05-22-integration-continue-2.png)

Il est également possible de définir quels fichiers/répertoires seront ignorés, et ce par projet, dans la fenêtre de commit :

![TODO](/img/2008-05-22-integration-continue-21.png)

Enfin, tant que vous êtes dans les paramètres de TortoiseSVN, vous pouvez également ajouter les valeurs suivantes dans la partie "Icon overlays" :

![TODO](/img/2008-05-22-integration-continue-22.png)

Cela vous évitera des petits soucis de fichiers vérouillés aléatoirement.

Ce qui nous amène à une autre convention : tout ce qui n'est pas nécessaire à la compilation n'est pas nécessaire dans le contrôle de code source. En effet, à quoi bon stocker N versions d'un code source, ainsi que N versions de l'éxecutable produit par ce code source ?

Processus de mise à jour des sources
-

Pour le moment, nous avons :

- un serveur SVN
- un client SVN

Il ne nous reste plus qu'à créer une nouvelle solution Visual Studio : si vous avez crée le dossier "IntegrationContinue" dans d:\, créez la solution également dans d:\, de manière à ce que le fichier IntegrationContinue.sln se trouve dans d:\IntegrationContinue\IntegrationContinue.sln. Ajoutez vos projets à cette solution.

Une fois ceci fait, retournez dans le dossier d:\IntegrationContinue, pour faire un "commit" avec un clic droit -> TortoiseSVN -> Commit, sélectionnez tous les fichiers, et cliquez sur "Commit". Tous vos fichiers se trouvent maintenant sous contrôle de code source!

Ce qui nous amène à une première version du processus de mise à jour du code source sous SVN.

1. Bob (notre développeur) fait un update de sa copie locale pour obtenir la dernière version du code source 
2. Bob fait une modification dans le code 
     2.1 Si le code ne compile pas, retour en 2. 
     2.2 Si le code compile, passer en 3. 
3. Bob fait un update de sa copie locale pour obtenir les modifications qui auraient été effectuées depuis 1. 
     3.1 Si le code ne compile pas, retour en 2. 
     3.2 Si le code compile, passer en 4. 
4. Bob fait un commit pour mettre à jour le code source sur SVN.

Le point 3 est important, il permet de s'assurer que les modifications effectuées en 2 ne sont pas incompatibles avec une éventuelle modification ayant eu lieu entre 1 et 3.

Enfin, le point le plus important : le code source situé dans le contrôleur de code source (plus précisément dans la partie trunk), doit OBLIGATOIREMENT compiler. Si le code ne compile pas, on ne fait pas de commit de ce code.