---
layout: post
title: "Indicateur de chargement AngularJs"
date: 2013-12-08 -0800
tags: [angularjs]
comments: true
github: "https://github.com/mathieubrun/Samples.AngularBootstrapWebApi/tree/master/SampleApplication.Web/App/Angular/Loader"
---

Depuis la version 1.2.0 de AngularJs, le service [$resource](http://docs.angularjs.org/api/ngResource.$resource) retourne des promise lors des appels aux méthodes get, query, save... Ceci ouvre des possibilités intéressantes, notamment la mise en place rapide d'indication de chargement.

Pour ce faire, j'ai choisi d'implémenter une directive, afin de pouvoir déclarer mon Loader ainsi :

```` html
<div loader="data"> 
    {{data | json}} 
</div>
````

Ceci va donc orienter la déclaration de la directive, pour utiliser la [transclusion](http://docs.angularjs.org/api/ng.directive:ngTransclude) et un scope isolé :

```` javascript
.directive('loader', ['$q', function ($q) { 
    return { 
        transclude: true, 
        templateUrl: 'app/loader/loader.html', 
        scope: { 
            source: '=loader' 
        }, 
        link: function (scope, elem, attrs) { 
             
        } 
    } 
}])
````

Ensuite il faut écrire la fonction link pour réagir aux évènements du promise :

```` javascript
.directive('loader', ['$q', function ($q) { 
    return { 
        transclude: true, 
        templateUrl: 'app/loader/loader.html', 
        scope: { 
            source: '=loader' 
        }, 
        link: function (scope, elem, attrs) { 
            scope.$watch("source", function (val) { 
                scope.status = 0; 
                val.$promise.then(function (success) { 
                    scope.status = 200; 
                }, function (err) { 
                    scope.status = err.status; 
                }); 
            }); 
        } 
    } 
}])
```` 
La fonction $watch de l'objet scope permet de réagir à une assignation de la valeur en chargement; notamment lors de l'appel à une fonction de rechargement de données. Pour obtenir une référence sur l'objet promise renvoyé par $resource, il faut passer par la propriété $promise de celui-ci

Enfin, pour afficher tout ça, il nous faut un template :

```` html
<div> 
    <div ng-hide="status==200"  ng-switch="status"> 
        <div ng-switch-when="0"> 
            <span><i class="fa fa-2x fa-spin fa-spinner"></i> Loading</span> 
        </div> 
        <div ng-switch-default> 
            <span>Error from server : {{status}}</span> 
        </div> 
    </div> 
    <div ng-show="status==200" ng-transclude></div> 
</div>
```` 