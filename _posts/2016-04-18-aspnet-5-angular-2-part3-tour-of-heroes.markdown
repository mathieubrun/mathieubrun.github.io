---
layout: post
title: "Angular2 + Visual Studio 2015 : Tour of heroes"
date: 2016-04-18 -0800
tags: [asp.net5, angular2, visual studio 2015]
comments: true
---

This series sample will convert the [Tour of heroes](https://angular.io/docs/ts/latest/tutorial/) sample application from [angular.io](https://angular.io/docs). 

As usual, the source is available on [Github here](https://github.com/mathieubrun/Samples.Angular2/tree/dev-part-3).

This part will finalize the implementation of the Tour of heroes sample. 

### Changing typescript compiler

I wanted to get rid of the grunt-ts dependency, in order to be able to compile using latest typescript version. This was relatively easy by using grunt-shell, and running tsc with the sources folder :

```` javascript
shell:{
    tsc: 'tsc -p src/ts'
}
````

### Adding service

This part was mainly a copy and paste job from the tutorial with small adaptations : splitting templates and styles into their own files. 

### Adding routing

Like adding the services, the routing part was again copy and paste

### Allowing deep linking

Now that routing is available to the sample application, and HTML5 mode is used (by default), the urls look like **http://localhost:59128/detail/16**. If the users tries to refresh his browser, a nice 404 will be displayed, as the server as no clue of what file to serve in this case.

Hopefully, url rewriting (and [StackOverflow](http://stackoverflow.com/questions/30945402/url-rewrite-in-asp-net-5)) can allow this scenario. Simply edit your web.config file, to add rewriting for all urls not requesting an existing file, and without dots in it :

```` xml
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!--http://stackoverflow.com/questions/30945402/url-rewrite-in-asp-net-5 -->
        <rule name="Index Rule" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <!-- Do not rewrite for files, allow for 404 during dev -->
            <add input="{REQUEST_URI}" matchType="Pattern" pattern="\." negate="true" />
            <!-- Do not rewrite for file existing on disk -->
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
````
