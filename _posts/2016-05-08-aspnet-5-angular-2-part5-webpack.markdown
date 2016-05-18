---
layout: post
title: "Angular2 + Visual Studio 2015 : Webpack setup"
date: 2016-05-08 -0800
tags: [asp.net5, angular2, webpack, visual studio 2015]
comments: true
---

This series sample will convert the [Tour of heroes](https://angular.io/docs/ts/latest/tutorial/) sample application from [angular.io](https://angular.io/docs). 

As usual, the source is available on [Github here](https://github.com/mathieubrun/Samples.Angular2/tree/dev-part-5).

This part will add webpack support to our samples, to replace grunt.

### Prerequisites

The following two visual studio extensions will make our lifes easier :

- [NPM task runner](https://visualstudiogallery.msdn.microsoft.com/8f2f2cbc-4da5-43ba-9de2-c9d08ade4941) for running NPM scripts from task runner explorer
- [Webpack task runner](https://visualstudiogallery.msdn.microsoft.com/5497fd10-b1ba-474c-8991-1438ae47012a) for running webpack fron task runner explorer

![Improved task runner explorer](/img/2016-05-08-aspnet-5-angular-2-part5-task-runner-explorer.png)

### Webpack installation

A nice introduction for this new fancy Webpack thing was made by [Burke Holland from Telerik](http://developer.telerik.com/featured/webpack-for-visual-studio-developers/). Have a look at it, I'll be waiting for you here!

Now, we can start writing some config and code ! 

First of all, we'll need to update the package.json file :

````
  "dependencies": {
    "angular2": "2.0.0-beta.15",
    "es6-shim": "^0.35.0",
    "reflect-metadata": "0.1.2",
    "rxjs": "5.0.0-beta.2",
    "zone.js": "0.6.11"
  },
  "devDependencies": {
    "webpack": "^1.12.13",

    "copy-webpack-plugin": "^1.1.1",
    "css-loader": "^0.23.0",
    "file-loader": "^0.8.4",
    "html-loader": "^0.4.0",
    "raw-loader": "0.5.1",
    "style-loader": "^0.13.0",
    "ts-loader": "^0.8.1",

    "typescript": "^1.8.0",
    "typings": "^0.7.12"
  },
````

### Webpack configuration

All configuration is done through a javascript file named ... webpack.conf.js. The base concept is that webpack will discover your code, from one or more entry points:

```` javascript
    config.entry = {
        'polyfills': ['core-js/client/core', 'angular2/bundles/angular2-polyfills'],
        'vendor': './src/vendor.ts',
        'app': './src/main.ts' // our angular app
    };
````

From there, loaders will transform your code:

```` javascript
    loaders: [
        // Reference: https://github.com/TypeStrong/ts-loader
        // -> ts compilation
        {
          test: /\.ts$/,
          loader: 'ts'
        },

        // Reference: https://github.com/webpack/css-loader
        // -> will resolve imports and requires in css
        // Reference: https://github.com/webpack/style-loader
        // -> will load the css into the page
        {
          test: /\.css$/,
          // all files in css folder
          include: path.join(sourcesRoot, 'src/css'),
          loader: 'style!css'
        },

        // Reference: https://github.com/webpack/raw-loader
        {
          test: /\.css$/,
          // all files in app folder will get inlined
          include: path.join(sourcesRoot, 'src/app'),
          loader: 'raw'
        },

        // https://github.com/webpack/raw-loader
        {
          test: /\.html$/,
          loader: 'raw'
        }
    ]
````

And produce an output :

```` javascript
    config.output = {
        path: path.join(sourcesRoot, 'wwwroot'),
        filename: 'js/[name].js'
    };
````

### Typings

This one is mandatory for referencing libraries from your code, and having compilation working smoothly. Setup is straightforward : create a typings.json file, and run

````
typings install
````

Using package.json, this can go into a script, and we can put webpack there as well :

````
  "scripts": {
    "typings": "typings install",
    "webpack-dev": "webpack -d --color"
  },
````

### Updating the code

A few updates are required, add a vendor.ts file to reference external libraries entry points :

```` javascript
// Angular 2
import 'angular2/platform/browser';
import 'angular2/platform/common_dom';
import 'angular2/core';
import 'angular2/router';
import 'angular2/http';

// RxJS
import 'rxjs';
````

Replace templateUrls and styleUrls, as for the moment, we're going to let webpack inline the templates and the styles:

```` javascript
    // from:
    templateUrl: 'hero-detail.component.html',
    styleUrls: ['hero-detail.component.css'],

    // to:
    template: require('./hero-detail.component.html'),
    styles: [require('./hero-detail.component.css')],
`````

### Weird issue : templates loaded as urls ?!

In the following exception, it looks like the template used for one component acts as an URL : 
````
GET http://localhost:53792/%3Ch1%3E%7B%7Btitle%7D%7D%3C/h1%3E%0D%0A%0D%0A%0D%0A 400 (Bad Request)
EXCEPTION: Failed to load %3Ch1%3E%7B%7Btitle%7D%7D%3C/h1%3E%0D%0A%0D%0A%0D%0A
EXCEPTION: Failed to load %3Ch1%3E%7B%7Btitle%7D%7D%3C/h1%3E%0D%0A%0D%0A%0D%0A
EXCEPTION: Error: Uncaught (in promise): Failed to load %3Ch1%3E%7B%7Btitle%7D%7D%3C/h1%3E%0D%0A%0D%0A%0D%0A
EXCEPTION: Error: Uncaught (in promise): Failed to load %3Ch1%3E%7B%7Btitle%7D%7D%3C/h1%3E%0D%0A%0D%0A%0D%0A
STACKTRACE:
Error: Uncaught (in promise): Failed to load %3Ch1%3E%7B%7Btitle%7D%7D%3C/h1%3E%0D%0A%0D%0A%0D%0A
    at resolvePromise (angular2-polyfills.js:602)
    at angular2-polyfills.js:638
    at ZoneDelegate.invokeTask (angular2-polyfills.js:423)
    at Object.NgZoneImpl.inner.inner.fork.onInvokeTask (ng_zone_impl.js:36)
    at ZoneDelegate.invokeTask (angular2-polyfills.js:422)
    at Zone.runTask (angular2-polyfills.js:320)
    at drainMicroTaskQueue (angular2-polyfills.js:541)
    at XMLHttpRequest.ZoneTask.invoke (angular2-polyfills.js:493)
Unhandled Promise rejection: Failed to load %3Ch1%3E%7B%7Btitle%7D%7D%3C/h1%3E%0D%0A%0D%0A%0D%0A ; Zone: angular ; Task: Promise.then ; Value: Failed to load %3Ch1%3E%7B%7Btitle%7D%7D%3C/h1%3E%0D%0A%0D%0A%0D%0A
Error: Uncaught (in promise): Failed to load %3Ch1%3E%7B%7Btitle%7D%7D%3C/h1%3E%0D%0A%0D%0A%0D%0A(…)
Unhandled Promise rejection: Failed to load %3Ch1%3E%7B%7Btitle%7D%7D%3C/h1%3E%0D%0A%0D%0A%0D%0A ; Zone: <root> ; Task: Promise.then ; Value: Failed to load %3Ch1%3E%7B%7Btitle%7D%7D%3C/h1%3E%0D%0A%0D%0A%0D%0A
Error: Uncaught (in promise): Failed to load %3Ch1%3E%7B%7Btitle%7D%7D%3C/h1%3E%0D%0A%0D%0A%0D%0A(…)
````

After a LOT of head scratching and banging, the issue was simply that :

```` javascript
@Component({
    selector: 'dashboard',
    templateUrl: require('./dashboard.component.html'),
    styleUrls: [require('./dashboard.component.css')]
})
````

needs to be changed with :

```` javascript
@Component({
    selector: 'dashboard',
    template: require('./dashboard.component.html'),
    styles: [require('./dashboard.component.css')]
})
````

Otherwise, the template would be ... the url...

### Special thanks

A lot of this setup and configuration was made possible thanks to [angular2-webpack repository](https://github.com/preboot/angular2-webpack), thanks to them for the hard work put into their repo, which contains a lot more interesting stuff to see!
