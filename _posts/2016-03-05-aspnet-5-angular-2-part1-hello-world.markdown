---
layout: post
title: "Your first Angular 2 project with Visual Studio 2015"
date: 2016-03-05 -0800
tags: [asp.net5, angular2, visual studio 2015]
comments: true
github: "https://github.com/mathieubrun/Samples.Angular2/tree/dev-part-1"
---

Building your first Angular2 app using Visual Studio 2015 is quite simple. Let's have a look at what's inside a simple hello world app. 

This sample is based on [angular.io quickstart](https://angular.io/docs/ts/latest/quickstart.html), by adapting it to run on Visual Studio 2015. Following are some key points.

### package.json

As explained in [angular.io quickstart](https://angular.io/docs/ts/latest/quickstart.html#!#package-json), dependencies are required to run the angular application. Differences between dependencies and devDependencies are explained in depth [here](https://angular.io/docs/ts/latest/guide/npm-packages.html).

The main dependencies are Angular2 (sure...) and [systemjs](https://github.com/systemjs/systemjs). The latter is a dynamic module loader, removing all the hassle of referencing all your application js files in the index.html.

Other dependencies are polyfills, providing functionnality that will be offered later by browsers (hopefully). Internet Explorer has it's own set of required shims, which have to be included in a specific order in index.html.

### gruntfile

Like in previous samples, I'm using a gruntfile for managing the development and build process :

- copy files into wwwroot
- copy dependencies into wwwroot/vendor
- compile typescript sources into wwwroot/app
- watch for changes in typescript or html files, and copy them to wwwroot

The dependencies to copy are specified manually in the gruntfile. This may seem complicated to injector/wiredep fans, but at the moment I did not find an easier way to do it. Proposals will be appreciated !

### application sources

The html and other static files are located in a src/html folder, and get copied to wwwroot folder.
The application code is located in src/ts folder and get compiled into wwwroot folder using grunt-ts task.

It may seem easier to put everything in wwwroot directly, but separating the sources will enable for later testing of release building of application, including sources in unit test runner, and so on.

### what are the main differences with AngularJS 1.5, from this hello world point of view ?

- Angular2 is now based on typescript
- There is no attribute based bootstrapping of your application, a root component is now used.
- Systemjs is used for managing modules (webpack can be used as well).

Next part in this series will convert the [Tour of heroes](https://angular.io/docs/ts/latest/tutorial/) sample application from [angular.io](https://angular.io/docs).
