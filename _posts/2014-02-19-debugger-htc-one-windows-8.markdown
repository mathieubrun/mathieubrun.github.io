---
layout: post
title: "Debugging HTC One X with windows 8"
date: 2014-02-19 -0800
tags: [android]
comments: true
---

Wanting to change a bit, I had a look at [Xamarin](https://xamarin.com/). First issue, have my HTC One X working with the debugger.

I had to :

- Download latest google usb drivers : [http://developer.android.com/sdk/win-usb.html](http://developer.android.com/sdk/win-usb.html)
- Update the file `android_winusb.inf` to add following lines below `[Google.NTx86]` and `[Google.NTamd64]` 

````
; HTC One X
%SingleAdbInterface% = USB_Install, USB\VID_0BB4&PID_0CED
%CompositeAdbInterface% = USB_Install, USB\VID_0BB4&PID_0CED&MI_01
````

- Execute `shutdown /r /o`
- After reboot go to `Troubleshooting` > `Advanced` > `Startup options` > `Reboot` > `F7`
- Connect the phone
- Activate USB debugging in Android
- Run `devmgmt.msc`
- Right click `Android phone`, then `Update Driver` > `Find a driver on my computer` > `Choose in a driver list...` > `Disk` 
- Insert path to `android_winusb.inf`
- Accept security warning

Execute `adb devices` to check the phone presence :

````
C:\adt-bundle-windows-x86_64-20131030\sdk\platform-tools>adb devices
* daemon not running. starting it now on port 5037 *
* daemon started successfully *
List of devices attached
HTxxxxxxxxxx    device
````

Easy, thanks to following links:

- [http://stackoverflow.com/questions/11012944/android-adb-driver-for-htc-one-x/13327665#13327665](http://stackoverflow.com/questions/11012944/android-adb-driver-for-htc-one-x/13327665#13327665)
- [http://forum.xda-developers.com/wiki/BN_Nook_Simple_Touch/Installing_ADB](http://forum.xda-developers.com/wiki/BN_Nook_Simple_Touch/Installing_ADB)
- [http://www.howtogeek.com/167723/how-to-disable-driver-signature-verification-on-64-bit-windows-8.1-so-that-you-can-install-unsigned-drivers/](http://www.howtogeek.com/167723/how-to-disable-driver-signature-verification-on-64-bit-windows-8.1-so-that-you-can-install-unsigned-drivers/)
- [http://docs.xamarin.com/guides/android/getting_started/installation/set_up_device_for_development/](http://docs.xamarin.com/guides/android/getting_started/installation/set_up_device_for_development/)
