---
layout: post
title: "Tests unitaires avec WebApi, Castle Windsor et OWIN"
date: 2014-02-03 -0800
categories: [code, ASP.NET Web API, OWIN, Castle Windsor]
comments: true
---

Une des grosses forces de ASP.NET Web API est sa modularité. Celle ci facilite la mise en place des principes [SOLID](http://en.wikipedia.org/wiki/SOLID_%28object-oriented_design%29), le S, pour Separation of Concerns, en particulier.

Pour la suite de l'article, nous allons tester un controller assez basique, dépendant d'un service injecté par le constructeur :

```` csharp
[RoutePrefix("api/names")]
public class NamesController : ApiController
{
	private const string PrefixRegex = "[a-zA-Z]+";
	
	private readonly IDataProvider dataProvider;

	public NamesController(IDataProvider dataProvider)
	{
		this.dataProvider = dataProvider;
	}

	[Route("{prefix}")]
	public IHttpActionResult GetNames(string prefix)
	{
		var names = this.dataProvider.GetFirstNames().Where(x => x.StartsWith(prefix));

		if (!Regex.IsMatch(prefix, PrefixRegex))
		{
			return StatusCode(HttpStatusCode.BadRequest);
		}

		if (!names.Any())
		{
			return NotFound();
		}

		return Ok(names);
	}
}
````

Afin de pouvoir utiliser ce controller dans Web API, il faut remplacer le DependencyResolver par défaut, par une implémentation spécifique à [Windsor](https://github.com/WebApiContrib/WebApiContrib.IoC.CastleWindsor/blob/master/src/WebApiContrib.IoC.CastleWindsor/WindsorResolver.cs). Habituellement, cet enregistrement se passe dans une classe de configuration, appelée dans la méthode MvcApplication.Application_Start. Les différents composants seront crées et nettoyés à chaque requete HTTP.

```` csharp
public class WindsorConfig
{
	public static void Register<T>(HttpConfiguration config) where T : IScopeAccessor, new()
	{
		var container = new WindsorContainer();

		config.DependencyResolver = new WindsorResolver(container);

		// when we begin registering many components, we should use installers here
		container.Register(Component.For<IDataProvider, DataProvider>().LifestylePerWebRequest());
		container.Register(Component.For<NamesController>().LifestylePerWebRequest());
		container.Register(Component.For<ClientsController>().LifestylePerWebRequest());
	}
}

public class MvcApplication : System.Web.HttpApplication
{
	protected void Application_Start()
	{
		WebApiConfig.Register(GlobalConfiguration.Configuration);
		BundleConfig.Register(BundleTable.Bundles);
		WindsorConfig.Register(GlobalConfiguration.Configuration);

		GlobalConfiguration.Configuration.EnsureInitialized();
	}
}
````

Une fois cette infrastructure en place, nous pouvons appeler normalement notre API REST.

Supposons que nous souhaitions maintenant lancer des tests d'intégration, afin de valider le bon fonctionnement de cette API. Il est possible d'héberger une application WebAPI dans un process OWIN, sans serveur IIS. Ceci devient extrêmement pratique dans le cadre de tests automatisés. 

Nous pouvons donc écrire un premier test :

```` csharp
[TestClass]
public class NamesControllerTest : ControllerTestBase
{
	[TestMethod]
	public void Valid_prefix_must_return_OK()
	{
		using (WebApp.Start<Startup>("http://localhost:9000/"))
		{
			using (var client = new HttpClient())
			{
				var response = client.GetAsync("http://localhost:9000/api/names/A").Result;

				Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
			}
		}
	}
}

public class Startup
{
	public void Configuration(IAppBuilder appBuilder)
	{
		var config = new HttpConfiguration();

		WindsorConfig.Register<OwinRequestScopeAccessor>(config);
		WebApiConfig.Register(config);

		appBuilder.Use<WindsorOwinRequestModule>();
		appBuilder.UseWebApi(config);
		
		config.EnsureInitialized();
	}
}
````

Le point interessant est la classe Startup : celle ci agira de manière similaire au Global.asax, dans les deux cas nous initialisons WebApi et Windsor. Les différences étant :

- la création de l'objet HttpConfiguration est à notre charge dans le cas d'un hébergement OWIN Self-hosted
- le IScopeAccessor est différent, le serveur OWIN Self-hosted ne disposant pas de la notion d'HttpModule

Pour pouvoir tout de même limiter la durée de vie des composants enregistrés dans Windsor, il a fallu implémenter un middleware OWIN : 

```` csharp
/// <remarks>
/// Inspired from : https://github.com/castleproject/Windsor/blob/master/src/Castle.Windsor/MicroKernel/Lifestyle/PerWebRequestLifestyleModule.cs
/// </remarks>
public class OwinRequestLifeTimeManager : OwinMiddleware
{
	public OwinRequestLifeTimeManager(OwinMiddleware next)
		: base(next)
	{
	}

	public override Task Invoke(IOwinContext context)
	{
		using (var scope = GetScope())
		{
			return Next.Invoke(context);
		}
	}

	internal static ILifetimeScope GetScope()
	{
		return GetScope(createIfNotPresent: true);
	}

	internal static ILifetimeScope YieldScope()
	{
		var scope = GetScope(createIfNotPresent: true);
		if (scope != null)
		{
			scopeHolder = null;
		}
		return scope;
	}

	private static ILifetimeScope scopeHolder;

	private static ILifetimeScope GetScope(bool createIfNotPresent)
	{
		var candidates = scopeHolder;
		if (candidates == null && createIfNotPresent)
		{
			candidates = new DefaultLifetimeScope(new ScopeCache());
			scopeHolder = candidates;
		}
		return candidates;
	}
}
````

Ainsi qu'un IScopeAccessor :

```` csharp
/// <remarks>
/// Inspired from : https://github.com/castleproject/Windsor/blob/master/src/Castle.Windsor/MicroKernel/Lifestyle/WebRequestScopeAccessor.cs
/// </remarks>
public class OwinRequestScopeAccessor : IScopeAccessor
{
	public void Dispose()
	{
		var scope = WindsorOwinRequestModule.YieldScope();
		if (scope != null)
		{
			scope.Dispose();
		}
	}

	public ILifetimeScope GetScope(CreationContext context)
	{
		return WindsorOwinRequestModule.GetScope();
	}
}
````

Et maintenant nous pouvons exécuter de jolis tests d'intégration automatisés, sans passer par IIS.

Le code source est disponible sur [github](https://github.com/mathieubrun/Samples.AngularBootstrapWebApi)
