---
layout: post
title: "Implémenter simplement un formulaire dynamique avec WPF"
date: 2013-03-01 -0800
categories: [wpf, code]
comments: true
---

En s'appuyant sur les DataTemplates et les capacités de binding de WPF, on peut très facilement mettre en place des formulaires dynamiques. La première étape est de définir les classes qui serviront à définir les éléments de notre formulaire :

```` csharp
public class FormElement
{
    public string Name { get; set; }
    public object Value { get; set; }
}
 
public class FormElement<T> : FormElement
{ 
}
 
public class DateElement : FormElement<DateTime>
{ 
}
 
public class StringElement : FormElement<string>
{ 
}
````

Ensuite, on va définir les DataTemplates qui vont permettre leur affichage :

```` xml
<DataTemplate DataType="{x:Type Elements:DateElement}">
    <DockPanel>
        <TextBlock Text="{Binding Name}" DockPanel.Dock="Left" Width="80"/>
        <DatePicker SelectedDate="{Binding Value}" />
    </DockPanel>
</DataTemplate>
 
<DataTemplate DataType="{x:Type Elements:StringElement}">
    <DockPanel>
        <TextBlock Text="{Binding Name}" DockPanel.Dock="Left" Width="80" />
        <TextBox Text="{Binding Value}" />
    </DockPanel>
</DataTemplate>
````

Et pour finir, il reste juste a ajouter les éléments dans un conteneur :

```` xml
<ItemsControl ItemsSource="{Binding Parameters}">
    <ItemsControl.ItemsPanel>
        <ItemsPanelTemplate>
            <StackPanel IsItemsHost="True" />
        </ItemsPanelTemplate>
    </ItemsControl.ItemsPanel>
</ItemsControl>
````

Tout le reste est géré par WPF, qui, au travers des DataTemplates et du Binding affichera les contrôles nécessaires pour remplir nos éléments.

Le code source complet est disponible sur [Github](https://github.com/mathieubrun/Samples)