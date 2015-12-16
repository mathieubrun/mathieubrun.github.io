---
layout: post
title: "Front end develoment using Visual Studio 2015, ASP.NET 5, and AngularJS - Part 3"
date: 2015-12-16 -0800
tags: [asp.net-5, angularjs]
comments: true
---

In this part I'll continue automating testing, with [protractor](http://www.protractortest.org) integration. This is straightforward but requires a little plumbing configuration!

### NPM packages used

Add the following packages to the package.json file :

- grunt-protractor-runner
- grunt-contrib-connect

The key packages here are grunt-contrib-connect, and grunt-protractor-runner. The grunt-protractor-runner package version 3.0.0 relies on [nodejs version 4.0 at least](http://stackoverflow.com/questions/33818869/protactor-error-unexpected-token).

Hopefully the update is easy : go to [the node website](https://nodejs.org), download the latest version, and make Visual Studio use it, in _Tools > Options > Projects and Solutions > External Web Tools_, and add the path to nodejs on top.

![Visual studio config](/img/2015-12-16-node-path.png) 

### Connect grunt task

Create a new task in gruntfile.js for starting the connect web server, which will serve your application to protractor runner.

```` javascript
connect: {
	server: {
		options: {
			port: 9001,
			base: 'wwwroot'
		}
	}
},
````

### Protractor grunt task

The protractor task needs to update the webdrivers and start them in standalone mode (this is easier to setup)

```` javascript
protractor: {
	run: {
		options: {
			configFile: "test/protractor.conf.js",
			webdriverManagerUpdate: true
		}
	}
}
````

The e2e task, which will start the connect web server, and run protractor tests.

```` javascript
grunt.registerTask('test:e2e', [
	'connect:server',
	'protractor:run'
]);
````

And finally the protractor configuration file, with 2 important points : 

- as the webdriver is in standalone mode, there is [no need to have a selenium server url](http://stackoverflow.com/a/31377385/971)
- the rootElement is required, should you want to [define your ng-app on another element than body](http://stackoverflow.com/questions/28040078/no-injector-found-for-element-argument-to-gettestability)

```` javascript
exports.config = {
	// not required in standalone mode
	// seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['e2e/scenarios.js'],
    baseUrl: 'http://localhost:9001',
    rootElement: '[ng-app]'
}
````

Running this task will produce the following in task runner explorer console :

![Protractor runner](/img/2015-12-16-protractor.png) 

Full code for this part is available on [Github](https://github.com/mathieubrun/Samples.FrontAspNet5/tree/dev-part-3)