---
layout: post
title: "Front end develoment using Visual Studio 2015, ASP.NET 5, and AngularJS - Part 2"
date: 2015-12-11 -0800
tags: [asp.net-5, angularjs]
comments: true
---

In this part I'll dive into unit testing your AngularJS code. Not so much on the test specs details, as there are enough documentation on those. I'll show how to set up a nice workflow which will set up tests as they're added, and run them automatically when you edit you javascript code, and create code coverage reports.

### NPM packages used

Add the following packages to the package.json file :

- grunt-contrib-watch
- grunt-karma
- karma
- karma-chrome-launcher
- karma-coverage
- karma-ie-launcher
- karma-jasmine
- karma-phantomjs-launcher
- phantomjs

The key packages here are grunt-contrib-watch, grunt-karma and karma-coverage.

### Watch task

Create a new task in gruntfile.js for reacting on file change events. This will trigger injection of JS files, or test running.

```` javascript
watch: {
	// adding or removing a js file trigger injections
	injections: {
		files: ['<%= paths.app %>/app/**/*.js'],
		tasks: ['wiredep', 'injector'],
		options: {
			event: ['added', 'deleted'],
		},
	},
	
	// changing an application file triggers automated tests
	tests: {
		files: ['<%= paths.app %>/app/**/*.js'],
		tasks: ['karma:unit']
	}
},
````

### Karma grunt task

The karma task is quite simple as well, this one has two sub-tasks, to run unit tests into phantomjs, reporting results in a console; or runs tests directly into IE and Chrome browsers.

```` javascript
karma: {
    allBrowsers: {
        configFile: 'test/karma.conf.js',
        browsers: ['Chrome', 'IE']
    },
    unit: {
        configFile: 'test/karma.conf.js',
        browsers: ['PhantomJS']
    },
}
````

Will produce the following in task runner explorer console :

![Karma runner](/img/2015-12-11-karma.png) 

### Code coverage

Producing code coverage reports is also simple, just add the relevant reporters, preprocessors and plugins to the karma.conf.js file.

```` javascript
reporters: ['progress', 'coverage'],

// process application files (not test !) for coverage
preprocessors: { '../wwwroot/app/**/!(*.spec).js': ['coverage'] },

plugins: [
	'karma-jasmine',
	'karma-chrome-launcher',
	'karma-ie-launcher',
	'karma-phantomjs-launcher',
	'karma-coverage'
],
````

And see output in test/artifacts/coverage-html folder :

![Code coverage](/img/2015-12-11-coverage.png) 

### HTML test runner

Finally, should you want to debug your tests, you can add the [Jasmine html runner](https://github.com/jasmine/jasmine/releases) to the project, and inject JS files into it.

```` html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Jasmine Spec Runner v2.3.4</title>
    <link rel="shortcut icon" type="image/png" href="lib/jasmine-2.3.4/jasmine_favicon.png">
    <link rel="stylesheet" href="lib/jasmine-2.3.4/jasmine.css">
    <script src="lib/jasmine-2.3.4/jasmine.js"></script>
    <script src="lib/jasmine-2.3.4/jasmine-html.js"></script>
    <script src="lib/jasmine-2.3.4/boot.js"></script>
    <!-- bower:js -->
    <!-- endbower -->
    <!-- injector:js -->
    <!-- endinjector -->
</head>
<body>
</body>
</html>
````

Then you can just run it from the file system :

![Html runner](/img/2015-12-11-runner.png) 

Full code for this part is available on [Github](https://github.com/mathieubrun/Samples.FrontAspNet5/tree/dev-part-2)