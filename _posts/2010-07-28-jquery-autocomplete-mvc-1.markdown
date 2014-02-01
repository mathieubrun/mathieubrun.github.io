---
layout: post
title: "JQuery.AutoComplete et ASP.NET MVC : Partie 1"
date: 2010-07-28 -0800
categories: [javascript, mvc, code]
comments: true
---

Pour implémenter facilement une autocompletion sur une TextBox dans vos applications ASP.NET MVC, vous aurez besoin de :

- JQuery
- JQuery.UI (contient le plugin autocomplete)
- ASP.NET MVC 2

Premiere étape, créer une action dans le controller. Par défaut, jquery.ui.autocomplete envoie la valeur saisie dans une textbox dans le paramètre "term". Toujours par défaut, les objets JSON renvoyés doivent posséder une propriété value et une propriété label.

```` csharp
public IEnumerable<Data> GenerateData()
{
    return new List<Data>() 
    {
        new Data() { Id = 11, Libelle = "Foo 1", Category = "Foos" },
        new Data() { Id = 12, Libelle = "Foo 2", Category = "Foos" },
        new Data() { Id = 13, Libelle = "Foo 3", Category = "Foos" },
        new Data() { Id = 21, Libelle = "Bar 1", Category = "Bars" },
        new Data() { Id = 22, Libelle = "Bar 2", Category = "Bars" },
        new Data() { Id = 23, Libelle = "Bar 3", Category = "Bars" },
        new Data() { Id = 31, Libelle = "Baz 1", Category = "Bazs" },
        new Data() { Id = 32, Libelle = "Baz 2", Category = "Bazs" },
        new Data() { Id = 33, Libelle = "Baz 3", Category = "Bazs" }
    };
}
````
 
```` csharp
public JsonResult AutoComplete(string term)
{
    var data = GenerateData()
        .Where(x => x.Libelle.Contains(term))
        .Select(x => new
        {
            value = x.Id,
            label = x.Libelle
        });
  
    return Json(data, JsonRequestBehavior.AllowGet);
}
````

Ici, le jeu de donnée est crée à la volée, filtré, et renvoyé sous forme JSON. Le paramètre  JsonRequestBehavior.AllowGet permet de renvoyer les resultats JSON suite à une requête HTTP GET.

Dans la vue :

```` html
<%using (var f = Html.BeginForm()) { %>
    <%=Html.TextBox("Libelle_Simple")%>
    <%=Html.TextBox("Id_Simple")%>
<%} %>
```` 

```` html
<script type="text/javascript">
    $(document).ready(function () {
        $('#Libelle_Simple').autocomplete({
            minLength: 1,
            source: "<%=Url.Action("AutoComplete") %>",
            select: function (event, ui) {
                $('#Libelle_Simple').val(ui.item.label);
                $('#Id_Simple').val(ui.item.value);
                return false;
            }
        });
    });
</script>
````

Dans le code JavaScript :

- minlength représente la longueur minimale devant être saisie pour déclencher une rêquete d'autocompletion 
- source sera l'url de l'action de notre controller renvoyant le JSON 
- select est la fonction exécutée lors du clic sur un élément. Ici, on va placer les valeurs des propriétés label et value dans leurs TextBox respectives.

Il ne nous reste plus qu'à tester :

![Autocomplete](/img/2010-07-28-jquery-autocomplete-mvc-1.png)

Lorsque que l'on sélectionne un élément, la valeur de sa propriété value est renseigné dans la deuxième TextBox

![Autocomplete](/img/2010-07-28-jquery-autocomplete-mvc-11.png)

Dans les prochains billets, nous verrons comment capitaliser cela dans une méthode d'extension de HtmlHelper, et comment personnaliser les paramètres envoyés par JQuery.