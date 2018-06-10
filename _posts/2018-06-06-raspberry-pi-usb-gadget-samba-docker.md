---
layout: post
title: "Including usb gadget, wifi setup and docker to a ready to use Raspbian SD card image"
date: 2018-06-06 -0800
tags: [docker, iot, raspberry]
comments: true
feature-img: "assets/img/pexels/circuit.jpg"
github: "https://github.com/mathieubrun/rpi-img-gen"
---

The raspbian lite image is nice for running on a Pi Zero, but still, after install, I wanted more stuff out of the box (usb gadget mode for example) without too much fiddling by ssh on each of my devices.

Here comes the [pi-gen](https://github.com/RPi-Distro/pi-gen) repository to the rescue. This tool is used to build the Raspbian Lite and Full images, with NOOBS.

First, I forked the repo, and cloned it locally. Not really rocket science so far!

The structure is really well explained in the [README](https://github.com/mathieubrun/rpi-img-gen#how-the-build-process-works) file :

Roughly :

1. Each stage folder is processed in alphanumeric order
2. Packages are installed
3. Scripts are ran
4. Image is built if EXPORT_IMAGE is present in stage folder

## custom stage

I added a stage8 folder next to the other stage folders. I chose 8 just in case I want to merge future updates from the original pi-gen repository. This should limit conflicts when I'll merge the RPi-Distro/pi-gen remote into my fork.

Then I could start adding the customizations.

## reduce video memory

With 512 MB of RAM, every MB counts ! As I'm not using video output, I reduced the GPU memory to the minimum of 16MB, in `/boot/config.txt` :

````
gpu_mem=16
````

## add ssh and wpa_supplicant

I wanted ssh and wifi configuration without having to insert the sd card after writing the image.

For ssh, per the documentation, I just added an empty ssh file to the boot folder.

Wifi configuration is done using the [wpa_supplicant.conf](https://www.raspberrypi.org/documentation/configuration/wireless/wireless-cli.md) file. If the file is present in the stage8/02-net-tweaks/files folder, it will get copied. The file is in .gitignore, just to be safe !

The file format is the following :

````
network={
    ssid="NETWORK_SSID"
    psk="NETWORK_KEY"
}
````

## change pi user password

The pi user password is `raspberry` by default. The setting the PI_PASSWD variable in the `config` file changes the password.

## adding samba

I find it easier to write code using VS Code than nano, so I added samba to easily access files on the Pi.

The package to install is `samba`. Then, by changing the `/etc/smb.conf` file, I configured Samba to share the home folders.

````
[global]
    server string = Samba Server %v
    security = user
    map to guest = bad user

[homes]
    comment = Home Directories
    browseable = no
    read only = no
    create mask = 0700
    directory mask = 0700
    valid users = %S
````

And set the samba user password :

```` sh
echo -ne "${PI_PASSWD}\n${PI_PASSWD}\n" | smbpasswd -a -s pi
````

Update : I removed samba from the image, it was simplier to rsync the files !

## adding docker

Docker has native arm support, and provides a convenience script for installing. I'm not too fond of this (come on, piping from curl as root ?!), so I extracted the interesting bits from the script.

```` sh
curl -fsSL https://download.docker.com/linux/raspbian/gpg | apt-key add -qq - >/dev/null
echo "deb [arch=armhf] https://download.docker.com/linux/raspbian stretch edge" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce
adduser pi docker
````

## usb gadget

Lastly, I wanted to be able to connect to my Pi without relying on pre-known wifi networks.

Ethernet over USB was the simpliest solution. This requires the setup of a kernel module by editing the `/boot/cmdline.txt` and `/boot/config.txt` files. Just replacing the files would prevent the filesystem to be resized on first boot. The easiest way was to edit the files in `stage1/00-boot-files/files` folder, generate a patch using `git diff` and use this patch.

With Mac OS, nothing should be installed, just enable "Internet Sharing" in `System Preferences` > `Sharing`.

With Windows 10, download Apple Itunes installer, extract it using 7-zip, and just install `Bonjour64.msi`.

After connecting the Pi to an usb port (do not forget to use the data port on the Pi), after it booted, it will be accessible on `raspberrypi.local`

```` console
$ ping raspberrypi.local
PING raspberrypi.local (192.168.2.13): 56 data bytes
64 bytes from 192.168.2.13: icmp_seq=0 ttl=64 time=0.824 ms
64 bytes from 192.168.2.13: icmp_seq=1 ttl=64 time=0.829 ms
````

## using the image

The images are present inside the `deploy` folder. You can write them to your SD card using [etcher](etcher.io).

## testing

### ssh connection

```` console
 mathieu@MBA ~/github/mathieubrun/rpi-img-gen master !1 ?2
$ ssh pi@raspberrypi.local
The authenticity of host 'raspberrypi.local (fe80::7e43:1d82:62dc:ab83%bridge100)' can't be established.
ECDSA key fingerprint is SHA256:dheqLpFxHmB37REh13VYAJYy520o2Lvumm04UY60Kk4.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added 'raspberrypi.local,fe80::7e43:1d82:62dc:ab83%bridge100' (ECDSA) to the list of known hosts.
pi@raspberrypi.local's password:
Linux raspberrypi 4.14.34+ #1110 Mon Apr 16 14:51:42 BST 2018 armv6l

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
````

### filesystem expansion

```` console
 pi@raspberrypi ~
$ df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/root       7.4G  1.2G  5.9G  17% /
devtmpfs        237M     0  237M   0% /dev
tmpfs           241M     0  241M   0% /dev/shm
tmpfs           241M  3.6M  238M   2% /run
tmpfs           5.0M  4.0K  5.0M   1% /run/lock
tmpfs           241M     0  241M   0% /sys/fs/cgroup
/dev/mmcblk0p1   43M   22M   21M  51% /boot
tmpfs            49M     0   49M   0% /run/user/1000
````

### connectivity

```` console
 pi@raspberrypi ~
$ ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: usb0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 06:8f:8f:cd:c7:3d brd ff:ff:ff:ff:ff:ff
    inet 169.254.85.50/16 brd 169.254.255.255 scope global usb0
       valid_lft forever preferred_lft forever
    inet6 fe80::7e43:1d82:62dc:ab83/64 scope link
       valid_lft forever preferred_lft forever
3: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether b8:27:eb:6c:1c:37 brd ff:ff:ff:ff:ff:ff
    inet 192.168.43.90/24 brd 192.168.43.255 scope global wlan0
       valid_lft forever preferred_lft forever
    inet6 fe80::a5fd:917c:93f7:938/64 scope link
       valid_lft forever preferred_lft forever
4: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default
    link/ether 02:42:af:1b:05:4c brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
       valid_lft forever preferred_lft forever
````

### docker

```` console
 pi@raspberrypi ~
$ docker run --rm hello-world
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
61ddb93a5f93: Pull complete
Digest: sha256:f5233545e43561214ca4891fd1157e1c3c563316ed8e237750d59bde73361e77
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (arm32v5)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/engine/userguide/
````

### samba

```` console
 pi@raspberrypi ~
$ touch hello.txt
````

And after editing the file on the computer :

```` console
 pi@raspberrypi ~
$ cat hello.txt
hello world
````


