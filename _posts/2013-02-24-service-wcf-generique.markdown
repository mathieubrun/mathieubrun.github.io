---
layout: post
title: "Implémentation d'un service WCF générique"
date: 2013-02-24 -0800
tags: [wcf]
comments: true
---

Parfois on peut être améné à vouloir déclarer un service de manière générique :

```` csharp
public class GenericService<T> : IGenericService<T> where T : EntityBase, new()
{
    public T GetEntity(string text)
    {
        var t = new T() { Text = text };
        t.Initialize();
        return t;
    }
}
````

Toutefois, le service ainsi déclaré ne pourra pas être utilisé dans IIS sans modifier la déclaration dans le fichier .svc :

```` xml
<%@ ServiceHost 
    Language="C#"
    Service="WcfService.GenericService`1[[WcfInterfaces.SpecificEntity, WcfInterfaces]]" 
    CodeBehind="GenericService.cs" %>
````

Exemple complet sur : [GitHub](https://github.com/mathieubrun/Samples).