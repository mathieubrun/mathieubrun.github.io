---
layout: post
title: "Integration continue : Partie 5, Tests unitaires"
date: 2008-06-03 -0800
tags: [integration continue]
comments: true
---

Tout d'abord, un test unitaire, quesako ?  
Un test unitaire est un bout de code qui va tester un bout de code de votre application. Unitairement. La partie "unitairement" signifie qu'on va tester une "unité" de notre code, par exemple, une classe et ses méthodes. Si on commence à tester plusieurs classes ensemble, on parlera plutôt de tests d'intégration. Même si dans la pratique, l'outil (NUnit) restera le même.

Prenons une méthode "simple" :

```` csharp
public class StringUtil 
{ 
    public static string GetLength( string input ) 
    { 
        return input.Length; 
    }
}
````

Son test unitaire ressemblera à ceci (on ajoutera une référence à nunit.framework.dll, situé dans le répertoire d'installation de NUnit):

```` csharp
[TestFixture] 
public class StringUtilTest 
{ 
    [Test] 
    public void GetLenghTest() 
    { 
        Assert.That( StringUtil.GetLength( "ab" ) == 2 ); 
        Assert.That( StringUtil.GetLength( "abc" ) == 3 ); 
        Assert.That( StringUtil.GetLength( "abcd" ) == 4 ); 
    } 
} 
````

Jusqu'ici tout va bien, on vient de vérifier que le fonctionnement interne de notre méthode est correct, et nous avons 100% de couverture de code. Toutefois, 100% de couverture de code ne signifient pas 0% de bugs. En effet, les tests unitaires ne peuvent pas tester du code inexistant, comme un contrôle d'erreurs par exemple... Nous parlerons dans ce cas de couverture d'états.

Justement, un utilisateur nous soumet un bug : "lorsque je passe null à la méthode, elle plante avec un NullReferenceException !". Ici, deux solutions, soit nous décidons de renvoyer 0 si on passe null à notre fonction GetLength, soit on remonte une exception de type "ArgumentNullException". Partons sur la 2ème solution. Nous pourrions immédiatement modifier le code de notre méthode, mais tout d'abord, modifions notre test unitaire :

```` csharp
[TestFixture] 
public class StringUtilTest 
{ 
    [Test] 
    public void GetLenghtTest() 
    { 
        Assert.That( StringUtil.GetLength( "ab" ) == 2 ); 
        Assert.That( StringUtil.GetLength( "abc" ) == 3 ); 
        Assert.That( StringUtil.GetLength( "abcd" ) == 4 ); 
    } 

    [Test] 
    [ExpectedException(typeof(ArgumentNullException))] 
    public void GetLenghtArgNulTest 
    { 
        StringUtil.GetLength( null ); 
    } 
} 
````

Au lancement du jeu de test, GetLenghtArgNulTest devra logiquement échouer : on attend un ArgumentNullException, on reçoit un NullReferenceException. C'est évidemment voulu : nous utilisons les tests unitaires pour reproduire un "bug" avant de corriger celui-ci. Cela permet la non régression : une fois un bug soumis, un test est écrit, et si ce test échoue après la correction du bug, on a régressé. Nous n'augmentons pas encore notre couverture de code : le bug n'est pas corrigé. Par contre, nous améliorons notre couvertures d'états.

Corrigeons maintenant notre code :

```` csharp
public class StringUtil 
{ 
    public static string GetLength( string input ) 
    { 
        if( input == null ) throw new ArgumentNullException( "Merci de ne pas passer de null!"); 
        return input.Length; 
    } 
} 
````

Tout est maintenant au vert!

Pourquoi faire tout cela, écrire plein de lignes de code en plus, maintenir des tests unitaires ? Pour la fiabilité, et la maintenance future de l'application : une modification dans une partie de l'application non couverte pas les tests unitaires est une modification "sans filet". Il n'est pas possible, avant de tester manuellement, de savoir si la modification a introduit un bug. Si je modifie le fonctionnement interne de GetLength, j'aurai les tests unitaires qui m'indiqueront que, dans notre test, dans le cas des paramètres passés en entrée, les valeurs de retour sont bonnes.

On peut également utiliser NUnit pour "tester" une application avant même d'avoir une interface graphique. Le test d'une couche d'accès au données s'en trouve simplifié.

Enfin, un code qui est écrit à l'avance pour être testable est souvent modularisé et architecturé plus clairement : séparation des rôles, utilisation de couches et d'interfaces.

Même si ce billet peut paraître simple, voire simpliste dans son approche des tests unitaires, j'espère qu'il vous aura donné envie d'essayer.