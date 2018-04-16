---
layout: post
title: "Dockerizing Jekyll"
date: 2018-04-16 -0800
tags: [jekyll, docker]
comments: true
github: "https://github.com/mathieubrun/docker-jekyll"
---

I wanted to write a short post on development applications dockerisation. There was a small issue though: I no more had ruby and associated bundles installed… it turned out that creating a docker image containing everything necessary to run jekyll was in fact quite easy. 

Here is the dockerfile:

```` docker
FROM ruby:alpine

RUN apk add --no-cache \
        bash \
        build-base \
        make && \
    gem install bundler

EXPOSE 4000 

COPY entrypoint.sh /usr/local/bin/

ENTRYPOINT [ "entrypoint.sh" ]

CMD [ "bundle", "exec", "jekyll", "serve", "--force_polling", "-H", "0.0.0.0" ]
````

The trick is to install build-base and make to allow for c modules compilation during bundle install. Bash is used for running our shell script as entrypoint.

And to run it, set working directory, bind mount it to current folder and that’s it. If you want to keep your installed ruby gems, you can bind mount them as well.

```` sh
docker run -ti \
    --workdir '/code' \
    -v "${PWD}:/code" \
    -v "${PWD}/.gems:/usr/local/bundle" \
    -p "4000:4000" \
    mathieubrun/jekyll:latest
````

Finally, everything can be wrapped in a shell alias for maximum reusability.

To try it out, run in either bash or powershell :

```` sh
git clone https://github.com/mathieubrun/mathieubrun.github.io
cd mathieubrun.github.io
docker run -ti \
    --workdir '/code' \
    -v "${PWD}:/code" \
    -v "${PWD}/.gems:/usr/local/bundle" \
    -p "4000:4000" \
    mathieubrun/jekyll:latest
````

And then open your browser to [localhost:4000](localhost:4000) !
