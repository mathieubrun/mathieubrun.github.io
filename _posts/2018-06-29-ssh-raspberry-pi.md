---
layout: post
title: "Simplify the connection to your Raspberry"
date: 2018-06-29 -0800
tags: [iot, raspberry, security]
comments: true
feature-img: "assets/img/pexels/old-phone.jpg"
---

Out of the box, opening a ssh terminal to your Raspberry Pi can be a bit tedious. Here are a few simple steps to optimize your workflow when connecting to your Raspberry Pi !

## change hostname

By default the hostname is `raspberrypi`. This can be changed by editing the files `/etc/hostname` and `/etc/hosts`. Here is a simple script that will do it, and apply the changes without needing to restart the system. Just change the value of `NEW_NAME` :

```` sh
export NEW_NAME=pi0
sudo sed -i "s/$(hostname)/${NEW_NAME}/g" /etc/hostname
sudo sed -i "s/$(hostname)/${NEW_NAME}/g" /etc/hosts
sudo hostnamectl set-hostname "${NEW_NAME}"
sudo systemctl restart avahi-daemon
unset NEW_NAME
````

This will be useful if you start hoarding Pi's on your network !

## use zeroconf

Accessing via IP address can be a bit cumbersome : you could configure each Raspberry to have a fixed address, or pin the DCHP address on your box. But an easier way exist : ZeroConf.

If you're under MacOS or Linux Ubuntu, normally there is nothing to do, as respectively the Bonjour and Avahi daemon should be running by default.

If you're under Windows, you need to install the [Bonjour service from Itunes](https://support.apple.com/kb/DL999?locale=en_GB).

To access your pi, just type its hostname followed by `.local` :

```` sh
ssh pi@pi0.local
````

## login using your public key

By creating a public/private key pair, and adding the public key to the authorized_keys file on the Raspberry, you can now connect (ssh, scp, and so on) without typing your password over and over.

```` sh
ssh-keygen
ssh-copy-id -i ~/.ssh/pi pi@pi0.local
````

Based on your threat analysis and dedication to security, you can omit the passphrase, or use ssh-agent. More details [here](https://security.stackexchange.com/questions/123316/why-use-a-passphrase-for-rsa-key) and [here](https://serverfault.com/questions/142959/is-it-okay-to-use-a-ssh-key-with-an-empty-passphrase).

## use `~/.ssh/config`

This file configures settings of the ssh client. Add the following to your `~/.ssh/config` file :

````
Host pi0
    HostName pi0.local
    User pi
    IdentityFile ~/.ssh/pi
````

Now, you can open an ssh connection to the Pi, just using 

```` sh
ssh pi0
````

So, we went from 

```` sh
# searching for IP ...
ssh pi@192.168.12.34
# typing password
# typing password again because of fat fingers
````

to

```` sh
ssh pi0
````

Much better !