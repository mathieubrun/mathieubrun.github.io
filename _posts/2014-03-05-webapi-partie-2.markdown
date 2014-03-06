---
layout: post
title: "ASP.NET Web API, kesako ? La suite"
date: 2014-03-05 -0800
categories: [code, ASP.NET Web API]
comments: true
---

# Le routing

Une nouveauté dans Web API 2.0 est le routing par attribut. Auparavant il était nécessaire de déclarer les routes selon des conventions :

````csharp
routes.MapHttpRoute(
    name: "API Default",
    routeTemplate: "api/{controller}/{action}/{id}",
    defaults: new { id = RouteParameter.Optional }
);
````

Voici le même exemple en utilisant les attributs :

````csharp
[RoutePrefix("api/names")]
public class NamesController : ApiController
{
	[HttpGet]
	[Route("{prefix}")]
	public IHttpActionResult GetNames(string prefix)
	{
		var names = this.dataProvider.GetFirstNames().Where(x => x.StartsWith(prefix));

		return this.Ok(names);
	}
}
````

Il n'est plus nécessaire de conformer toutes les routes à des conventions qui pouvaient devenir fastidieuses à maintenir, comme par exemple les routes que l'on peut rencontrer dans une API de type REST :

- /clients
- /clients/123
- /clients/123/orders
- /clients/123/orders/456

# La serialisation

La sérialisation se fait de manière transparente : en fonction du content-type de la requête HTTP, la réponse sera sérialisée en JSON ou en XML par défaut. Des points d'entrées sont présents dans Web API pour personnaliser ce comportement : [http://www.asp.net/web-api/overview/formats-and-model-binding/media-formatters](http://www.asp.net/web-api/overview/formats-and-model-binding/media-formatters)

# Les filtres

Tout comme ASP.NET MVC, les filtres permettent l'interception des actions des controlleurs, avant ou après l'exécution de celles ci. 

Les usages courants sont :

- la sécurisation des actions
- la journalisation
- la modification des en-têtes http avant envoi de la réponse

```` csharp
public class CustomHeaderAttribute : ActionFilterAttribute
{
	public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
	{
		actionExecutedContext.Response.Headers.Add("Hello-Header", "Hello world !");
	}
}
````

# Les tests unitaires

La séparation des rôles apportée par Web API permet de facilement mettre en place des tests unitaires, avec ou sans mocking.

Il est également possible de faire des tests de bout en bout : [Tests unitaires avec WebApi, Castle Windsor et OWIN](/archive/2014/02/03/tests-unitaires-webapi-owin/)

Le code source est disponible sur [github](https://github.com/mathieubrun/Samples.AngularBootstrapWebApi)