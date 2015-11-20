---
layout: post
title: "Hériter un style WPF par défaut"
date: 2013-02-04 -0800
tags: [wpf]
comments: true
---

Parfois il peut arriver d'avoir besoin de baser un style sur un autre déclaré sans x:Key, s'applicant donc a tous les éléments correspondant à l'attribut TargetType. Ici, la clé est de déclarer l'attribut BasedOn avec non pas une ressource, mais le type de l'élément sur lequel appliquer le style.

```` xml
<Page
  xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
  xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
  <StackPanel>  
    <StackPanel.Resources>
      <Style TargetType="TextBlock">
        <Setter Property="Background" Value="Red" />
      </Style>
      <Style TargetType="TextBlock" x:Key="Custom1">
        <Setter Property="Foreground" Value="Blue" />
      </Style>
      <Style TargetType="TextBlock" x:Key="Custom2" BasedOn="{StaticResource {x:Type TextBlock}}">
        <Setter Property="Foreground" Value="Blue" />
      </Style>
    </StackPanel.Resources>
    <TextBlock>Defaut</TextBlock>
    <TextBlock Style="{StaticResource Custom1}">Custom 1 : background remis par defaut</TextBlock>
    <TextBlock Style="{StaticResource Custom2}">Custom 2 : background repris de Default</TextBlock>
  </StackPanel>
</Page>
````

Cela a le mérite d'être plus concis et plus explicite que le pattern suivant :

```` xml
<Page
  xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
  xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
  <StackPanel>  
    <StackPanel.Resources>
      <Style TargetType="TextBlock" x:Key="DefaultTextBlock">
        <Setter Property="Background" Value="Red" />
      </Style>
      <Style TargetType="TextBlock" 
             BasedOn="{StaticResource DefaultTextBlock}">
      </Style>
      <Style TargetType="TextBlock" x:Key="Custom1">
        <Setter Property="Foreground" Value="Blue" />
      </Style>
      <Style TargetType="TextBlock" x:Key="Custom2" 
             BasedOn="{StaticResource DefaultTextBlock}">
        <Setter Property="Foreground" Value="Blue" />
      </Style>
    </StackPanel.Resources>
    <TextBlock>Defaut</TextBlock>
    <TextBlock Style="{StaticResource Custom1}">Custom 1 : background remis par defaut</TextBlock>
    <TextBlock Style="{StaticResource Custom2}">Custom 2 : background repris de Default</TextBlock>
  </StackPanel>
</Page>
````