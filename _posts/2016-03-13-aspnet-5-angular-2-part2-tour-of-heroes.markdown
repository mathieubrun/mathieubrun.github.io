---
layout: post
title: "Angular2 + VS 2015 : Tour of heroes"
date: 2016-03-13 -0800
tags: [asp.net-5, angular-2]
comments: true
---

This series sample will convert the [Tour of heroes](https://angular.io/docs/ts/latest/tutorial/) sample application from [angular.io](https://angular.io/docs). 

As usual, the source is available on [Github here](https://github.com/mathieubrun/Samples.Angular2/tree/dev-part-2).

### Getting things up and running

Starting from part 1, getting the first part of the tutorial to work was mainly copy and paste job from [Hero editor](https://angular.io/docs/ts/latest/tutorial/toh-pt1.html).

I also updated package.json to use latests versions of libs (Angular2 version 2.0.0-beta.8), but ran into a typescript compilation issue :

````
Compiling...
### Fast Compile >>src/ts/app.component.ts
### Fast Compile >>src/ts/boot.ts
Using tsc v1.7.3
GitHub/Samples.Angular2/Samples.Front/node_modules/angular2/platform/browser.d.ts(77,90): error TS2304: Cannot find name 'Promise'.
GitHub/Samples.Angular2/Samples.Front/node_modules/angular2/src/core/application_ref.d.ts(83,60): error TS2304: Cannot find name 'Promise'.
GitHub/Samples.Angular2/Samples.Front/node_modules/angular2/src/core/application_ref.d.ts(83,146): error TS2304: Cannot find name 'Promise'.
... and so on ...
````

This was easily fixed, thanks to [http://stackoverflow.com/a/35514492/971](), just edit boot.ts to reference the typings !

```` javascript
// from : http://stackoverflow.com/a/35514492/971
/// <reference path="../../node_modules/angular2/typings/browser.d.ts" />

import {bootstrap} from 'angular2/platform/browser';
import {AppComponent} from './app.component';

bootstrap(AppComponent);
````

And everything is now running fine !

### Adding the next parts

Adding the [Master/details](https://angular.io/docs/ts/latest/tutorial/toh-pt2.html) and [Multiple components](https://angular.io/docs/ts/latest/tutorial/toh-pt3.html) was also a quick copy/paste story. 

As I didn't lile having the css and html hardcoded into the components, I took the opportunity to move them to their own files :

```` javascript
@Component({
    selector: 'my-app',
    moduleId: module.id,
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css'],
    directives: [HeroDetailComponent]
})
```` 

Here you can see a moduleId property. This one is used to not have to hardcode the 'app' (module name) in the template and style urls. However, due to an [issue with relativeUrl and SystemJS](https://github.com/angular/angular/issues/6053) I had to create a shim.d.ts file and reference it in main.ts : 

```` javascript
// from : https://github.com/angular/angular/issues/6053
declare var module: any;
````

Finally, I split the hero module into its own directory, as I like having things neatly organised.