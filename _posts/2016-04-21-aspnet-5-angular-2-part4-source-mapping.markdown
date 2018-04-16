---
layout: post
title: "Angular2 + Visual Studio 2015 : Source maps"
date: 2016-04-21 -0800
tags: [asp.net5, angular2, visual studio 2015]
comments: true
github: "https://github.com/mathieubrun/Samples.Angular2/tree/dev-part-4"
---

This series sample will convert the [Tour of heroes](https://angular.io/docs/ts/latest/tutorial/) sample application from [angular.io](https://angular.io/docs). 

This part will add source map support, for easier typescript debugging using Chrome tools.

### Configuring typescript compiler

The easiest way to generate source maps is to add two parameters to the tsconfig.json file :

```` javascript
{
  "compilerOptions": {
    "inlineSourceMap": true,
    "inlineSources": true,
  }
}
````

Those will generate inline source mapping and original typescript sources directly into generated javascript files.

### Debugging

Running the Chrome debugger (unfortunately, not working with IE11 debugger...), notice the **hero = Object {id: 12, name: "Narco"}** tooltip, and the immediate watch displayed when hovering **this._router** !

![Chrome debugger](/img/2016-04-21-aspnet-5-angular-2-part4-source-mapping-chrome.png)

### Moving to core.js polyfills

After upgrading to latest Angular2 packages, my sample app was not working anymore with IE11. After a bit of search and fiddling, I updated the sample to use polyfills from [core.js](https://github.com/zloirock/core-js).