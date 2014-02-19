---
layout: post
title: "Debugger un HTC One X sous windows 8"
date: 2014-02-19 -0800
categories: [code, android, nightmare]
comments: true
---

Histoire de changer un peu mon quotidien, j'ai jeté un oeil a [Xamarin](https://xamarin.com/). Premiere épreuve, faire reconnaitre mon HTC One X par le debugger.

Dans l'ordre :

- Télécharger les derniers drivers google usb : [http://developer.android.com/sdk/win-usb.html](http://developer.android.com/sdk/win-usb.html)
- Modifier le fichier `android_winusb.inf` pour ajouter les lignes suivantes en dessous de `[Google.NTx86]` et `[Google.NTamd64]` 

````
; HTC One X
%SingleAdbInterface% = USB_Install, USB\VID_0BB4&PID_0CED
%CompositeAdbInterface% = USB_Install, USB\VID_0BB4&PID_0CED&MI_01
````

- Exécuter la ligne de commande `shutdown /r /o`
- Une fois le rédémarrage effectué, aller dans `Dépannage` > `Avancé` > `Options de démarrage` > `Rédémarrer` > `F7`
- Connecter le téléphone
- Activer le débuggage USB dans le téléphone
- Executer `devmgmt.msc`
- Clic droit sur `Android phone`, puis `Mettre à jour le pilote` > `Rechercher un pilote sur mon ordinateur` > `Choisir parmi une liste de pilotes...` > `Disque fourni` 
- Indiquer le chemin vers `android_winusb.inf`
- Accepter l'avertissement de sécurité

Exécuter `adb devices` pour vérifier la présence du téléphone :

````
C:\adt-bundle-windows-x86_64-20131030\sdk\platform-tools>adb devices
* daemon not running. starting it now on port 5037 *
* daemon started successfully *
List of devices attached
HTxxxxxxxxxx    device
````

Facile, surtout grâce a un mix des liens suivants :

- [http://stackoverflow.com/questions/11012944/android-adb-driver-for-htc-one-x/13327665#13327665](http://stackoverflow.com/questions/11012944/android-adb-driver-for-htc-one-x/13327665#13327665)
- [http://forum.xda-developers.com/wiki/BN_Nook_Simple_Touch/Installing_ADB](http://forum.xda-developers.com/wiki/BN_Nook_Simple_Touch/Installing_ADB)
- [http://www.howtogeek.com/167723/how-to-disable-driver-signature-verification-on-64-bit-windows-8.1-so-that-you-can-install-unsigned-drivers/](http://www.howtogeek.com/167723/how-to-disable-driver-signature-verification-on-64-bit-windows-8.1-so-that-you-can-install-unsigned-drivers/)
- [http://docs.xamarin.com/guides/android/getting_started/installation/set_up_device_for_development/](http://docs.xamarin.com/guides/android/getting_started/installation/set_up_device_for_development/)


