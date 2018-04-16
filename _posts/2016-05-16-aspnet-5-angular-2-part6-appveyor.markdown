---
layout: post
title: "Angular2 + Visual Studio 2015 : Appveyor setup"
title: "Angular2 + Visual Studio 2015 : Appveyor setup"
date: 2016-05-16 -0800
tags: [asp.net5, angular2, appveyor, visual studio 2015]
comments: true
github: "https://github.com/mathieubrun/Samples.Angular2/tree/dev-part-6"
---

This part will add continuous integration using [AppVeyor](https://www.appveyor.com). They're free for projects hosted on github public repositories, so, let's go!

For a standard .NET project, there is almost no setup required, just add your repository as a new project, and it will build the .sln file at the root, and run your tests !

Here is the output after adding my [Samples.SerializerFun repository](https://github.com/mathieubrun/Samples.SerializerFun), without any specific configuration.

![Build success !](/img/2016-05-16-aspnet-5-angular-2-part6-appveyor-build.png)

### but for Node.js... 

... things are going to be a little different, we're going to have to use an appveyor.yml file to setup everything.

Here is the first version of the file, which is quite simple, full reference available [here](https://www.appveyor.com/docs/appveyor-yml).
 
````
# environment variables
environment:
  nodejs_version: "5"

# scripts that run after cloning repository
install:
  # install node 
  - ps: Install-Product node $Env:nodejs_version
  - npm install -g npm
  - npm install -g webpack  
  
# scripts to run before build
before_build:
  # install node modules
  - cd %APPVEYOR_BUILD_FOLDER%
  - cd Samples.Front
  - npm install
  # run webpack with production flag
  - webpack -p
  
artifacts:
  - path: Samples.Front\wwwroot
````

However, this will lead to a nasty error : 

````
Build FAILED.
 
"C:\projects\samples-angular2\Samples.Angular2.sln" (default target) (1) ->
"C:\projects\samples-angular2\Samples.Front\Samples.Front.xproj" (default target) (2) ->
(GetRuntimeToolingPathTarget target) -> 
  C:\Program Files (x86)\MSBuild\Microsoft\VisualStudio\v14.0\DNX\Microsoft.DNX.targets(126,5): error : The Dnx Runtime package needs to be installed. See output window for more details. [C:\projects\samples-angular2\Samples.Front\Samples.Front.xproj]
````

After a bit of fiddling and searching, adding the following lines :

````
# scripts that run after cloning repository
install:
  # install DNX
  - set PATH=C:\Program Files (x86)\MSBuild\14.0\Bin;%PATH%
  - dnvm upgrade
  - dnu restore  
````

Downloaded and installed latest DNX, which allowed the project to build, after adding 

````
  # back to original folder
  - cd %APPVEYOR_BUILD_FOLDER%  
````

at the end of before_build scripts, otherwise, the build system would try to build Samples.Angular2.sln, while still in the Samples.Front project...

### finally

The build succeeds :

![Build success !](/img/2016-05-16-aspnet-5-angular-2-part6-appveyor-success.png)

And a nice artifact is generated for download.