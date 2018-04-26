---
layout: post
title: "More docker !"
date: 2018-04-23 -0800
tags: [docker, "build automation"]
comments: true
---

After writing the jekyll docker image, I did not want to stop there and continued to create more images for future posts.

The process is finally quite simple, for example, for example here is the [figlet](http://www.figlet.org/) dockerfile :

```` docker
FROM alpine:3.6

RUN apk add --no-cache figlet

ENTRYPOINT ["figlet"]
````

After creating a [github repository](https://github.com/mathieubrun/docker-figlet), and an automated build on [docker hub](https://hub.docker.com/r/mathieubrun/figlet/), all pushes on github will trigger a build. I like this process for the transparency it provides :

- transparency for the image maintener, push, and build will occur
- transparency for image users, as the repository and dockerfile are de facto linked.

The second point is important, as otherwise you cannot know how the docker image you're downloading has been created, which github repository contains the source, the tag to use, and so on.

Also, to improve your command line experience, you can add function like the following to your bash_profile (here I use the official node image) :

```` sh
npm() {
    docker run --rm -ti \
        --workdir '/code' \
        -v "${PWD}:/code" \
        node:8.10.0-alpine npm $@
}
````

Or to your powershell profile :

```` powershell
function jekyll() {
    docker run --rm -ti `
        --workdir '/code' `
        -v "${pwd}:/code" `
        -v "${pwd}\.gems:/usr/local/bundle" `
        -p "4000:4000" `
        mathieubrun/jekyll:latest $args
}
````

For more aliases, you can have a look at my [ShellScripts github repository](https://github.com/mathieubrun/ShellScripts).

I'm starting to uninstall all those command line development tools and to convert them to docker images. Not only does it limit clutter on my system, but also simplifies my life when I move from one computer to another : as long as Docker is installed I'm good to go.