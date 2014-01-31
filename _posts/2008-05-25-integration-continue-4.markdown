---
layout: post
title: "Integration continue : Partie 4, Microsoft Source Analysis Tool for C#"
date: 2008-05-25 -0800
categories: [integration continue]
comments: true
---

Initialement, la partie 4 devait parler de tests unitaires, mais la sortie récente de cet outil mérite qu'on fasse un petit détour. Concrètement, MSAT va effectuer une analyse statique de votre code. Il va donc vous indiquer les parties de votre code qui ne se conforment pas à un standard de codage. Il est possible de le configurer selon ses besoins (par exemple, la règle qui dit que les tabulations c'est mal à l'air de faire couler beaucoup d'encre...). Donc attention, le but d'un tel outil n'est pas de définir une norme de codage pour tous les développeurs C# du monde (rien que ça), mais plutôt de maintenir une cohérence au sein des équipes travaillant sur un même projet.

Installation de l'outil
-

Microsoft Source Analysis Tool for C# peut être téléchargé ici : http://code.msdn.microsoft.com/sourceanalysis/Release/ProjectReleases.aspx?ReleaseId=1047. L'installation est très simple, il faut juste s'assurer que la partie MSBuild est bien installée, sinon, pas d'intégration dans notre processus de build.

Intégration dans vos projets
-

Une fois l'outil installé, une nouvelle entrée apparait dans le menu "Outils" de Visual Studio : "Run Source Analysis". Elle vous permet d'exécuter l'analyse du code directement dans Visual Studio, et affichera les résultats dans l'onglet "Source Analysis". Un double clic sur un message vous emmene sur la ligne concernée. Rien d'inhabituel donc.

Il est également possible d'intégrer l'analyse de votre code source directement dans le processus de build, et là, celà devient vraiment intéressant : lorsqu'un développeur lancera une compilation, toutes les erreurs liées à l'analyse du code source apparaitront en tant que warning dans l'onglet "Liste d'erreurs".

Pour permettre cela, deux solutions :

Si MSAT est installé sur tous les postes de développeur
-

Ouvrez chaque fichier .csproj pour lequel vous souhaitez analyser le code, et modifiez le de la façon suivante :

```` xml
<Project DefaultTargets="Build" xmlns="http://schemas.microsoft.com/developer/msbuild/2003"> 
    [...] 
    <Import Project="$(MSBuildBinPath)\Microsoft.CSharp.targets" /> 
    <Import Project="$(ProgramFiles)\MSBuild\Microsoft\SourceAnalysis\v4.2\Microsoft.SourceAnalysis.targets" /> 
    [...] 
</Project> 
````

Si MSAT n'est pas installé sur tous les postes de développeur
-

Pour faire suite au billet sur l'arborescence projet, vous pouvez maintenant rajouter un autre répertoire à la racine de la solution : "External" (par exemple... vous pouvez aussi l'appeler Tools, ou Trucs, peu importe!). Créez un répertoire "SourceAnalysis", et copiez y le contenu du répertoire "C:\Program Files\Microsoft Source Analysis Tool for C#". Maintenant, ouvrez chaque fichier .csproj pour lequel vous souhaitez analyser le code, et modifiez le de la façon suivante :

```` xml
<Project DefaultTargets="Build" xmlns="http://schemas.microsoft.com/developer/msbuild/2003"> 
    [...] 
    <Import Project="$(MSBuildBinPath)\Microsoft.CSharp.targets" /> 
    <Import Project="..\..\External\SourceAnalysis\Microsoft.SourceAnalysis.targets" /> 
    [...] 
</Project> 
````

Ensuite, intégrez ce répertoire dans le contrôle de code source. Les développeurs bénéficieront de l'analyse de code source dès qu'ils mettront leur copie locale à jour. Lors du premier rechargement du projet, vous obtiendrez un message d'avertissement :

![Avertissement de sécurité](/img/2008-05-25-integration-continue-4.png)

Choisissez de charger normalement le projet.

Et voilà, l'analyse statique intégrée dans Visual Studio, et dans le processus de compilation (et dans CruiseControl, de fait!).