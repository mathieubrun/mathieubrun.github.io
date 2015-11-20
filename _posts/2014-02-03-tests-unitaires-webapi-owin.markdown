---
layout: post
title: "Tests unitaires avec WebApi, Castle Windsor et OWIN"
date: 2014-02-03 -0800
tags: [asp.net-web-api, owin, castle-windsor]
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
	protected static readonly string baseAddress = "http://localhost:9000/";
	protected static IDisposable app;

	/// <summary>
	/// Start the self hosted server once per assembly
	/// </summary>
	/// <param name="context"></param>
	[AssemblyInitialize]
	public static void AssemblyInitialize(TestContext context)
	{
		app = WebApp.Start<Startup>(baseAddress);
	}

	/// <summary>
	/// Do not forget to clean up !
	/// </summary>
	[AssemblyCleanup]
	public static void AssemblyCleanup()
	{
		if (app != null)
		{
			app.Dispose();
		}
	}
	
	[TestMethod]
	public void Valid_prefix_must_return_OK()
	{
		using (var client = new HttpClient())
		{
			var response = client.GetAsync("http://localhost:9000/api/names/A").Result;

			Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
		}
	}
}

public class Startup
{
	public void Configuration(IAppBuilder appBuilder)
	{
		var config = new HttpConfiguration();

		var container = WindsorConfig.Register<LifetimeScopeAccessor>(config);
		WebApiConfig.Register(config);

		appBuilder.Use<OwinRequestLifeTimeManager>(container);
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
	private readonly IWindsorContainer container;

	public OwinRequestLifeTimeManager(OwinMiddleware next, IWindsorContainer container)
		: base(next)
	{
		this.container = container;
	}

	public override Task Invoke(IOwinContext context)
	{
		using (new CallContextLifetimeScope(container))
		{
			// subsequent middlewares are executed inside this scope
			return Next.Invoke(context);
		}
	}
}
````

Ce middleware OWIN encapsule l'execution des middleware suivants (dont Web API) dans un scope spécifique, afin de "simuler" le comportement du PerWebRequestLifestyle.

Du coup maintenant nous pouvons exécuter de jolis tests d'intégration automatisés, sans passer par IIS.

Le code source est disponible sur [github](https://github.com/mathieubrun/Samples.AngularBootstrapWebApi)
