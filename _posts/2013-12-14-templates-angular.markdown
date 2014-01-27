---
layout: post
title: "Mise en cache intelligente des templates AngularJS"
date: 2013-12-08 -0800
categories: [angularjs, code]
comments: true
---

Avant de rentrer dans le vif du sujet, petit rappel sur le fonctionnement du cache du navigateur.

Lorsque le navigateur demande une ressource (index.html par exemple) au  serveur, celui ci lui renvoie plusieurs éléments :

- un statut HTTP (200 SUCCESS ici)
- le contenu du fichier index.html
- un ensemble d'en-têtes http

Parmi ces en-têtes, on retrouvera (en fonction de la configuration du serveur) :

- un ETAG, qui est un checksum calculé selon le contenu renvoyé au navigateur
- une date d'expiration, qui indique au navigateur la durée de vie de la ressource demandée

Il est à noter que les valeurs dans l'en-tête sont purement prescriptives, charge au navigateur de les respecter.

Lorsque le navigateur refait une requête au serveur pour le fichier index.html, il adjoindra également des en-têtes à sa requête. L'en-tête ETAG permettra de répondre au navigateur par un statut 304 NOT MODIFIED, dans le cas ou le fichier n'aurait pas changé.

L'en-tête date d'expiration permet au navigateur d'éviter d'envoyer des requêtes au serveur : tant que la date d'expiration n'est pas atteinte, le navigateur utilise la copie en cache.

Les templates AngularJS sont chargés au travers du service $http, qui se base sur xmlHttpRequest, qui lui même bénéficie du cache du navigateur.

Imaginons le scénario suivant :

- le matin a 8h, le navigateur du client A demande le fichier index.html
- le serveur lui renvoie, avec un ETAG "ABCD", et une date d'expiration fixée au lendemain 8h
- lors de l'utilisation de l'application, le navigateur va se baser sur la version en cache du fichier, tant que la date d'expiration est atteinte
- a 12h, une nouvelle version de l'application est mise en ligne

Jusqu'au lendemain 8h, le client A utilisera une version potentiellement obsolète du fichier index.html.

Pour eviter cela, je vais mettre en place un mécanisme permettant d'assurer le bon fonctionnement du cache, tout en utilisant les derniers fichiers disponibles de l'application.

Dans un premier temps, il faut fournir un numéro identifiant l'application déployée. J'ai choisi d'utiliser la date de création d'un assembly du projet Web. Pour cela, j'ai intégré une simple balise script déclarant une constante AngularJs :

```` html
<script type="text/javascript"> 
    angular.module('SampleApplication.Config', []) 
        .constant('SampleApplicationVersion', '<%: Version %>'); 
</script>
````

La suite de l'implémentation est aisée, grâce au système de HttpInterceptors fourni par AngularJs. Ces HttpInterceptors permettent de modifier les requêtes envoyées et reçues par le service $http.

```` javascript
.factory('SmartCacheInterceptor', ['$q', 'SampleApplicationVersion', function ($q, SampleApplicationVersion) { 
    return { 
        request: function (config) { 
            if (config.url.indexOf(".htm") > -1) { 
                var separator = config.url.indexOf("?") === -1 ? "?" : "&"; 
                config.url = config.url + separator + "v=" + SampleApplicationVersion; 
            } 
            return config || $q.when(config); 
        } 
    }; 
}]);
````

Voici les résultats dans fiddler. Les requêtes sur l'url "/" correspondent a un rafraichissement de la page du navigateur. Le serveur web utilisé est IIS Express, sans paramétrage spécifique.

![2013-12-14-templates-angular](/img/2013-12-14-templates-angular.png)

Le code source est disponible sur [github](https://github.com/mathieubrun/Samples.AngularBootstrapWebApi/tree/master/SampleApplication.Web)
