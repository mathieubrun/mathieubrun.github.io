---
layout: post
title: "JQuery.AutoComplete et ASP.NET MVC : Partie 3"
date: 2010-08-02 -0800
tags: [jquery, asp.net-mvc]
comments: true
---

Cette fois ci, nous allons personnaliser les objets retournés par notre Controller :

```` csharp
public JsonResult AutoCompleteCustomJson(string search, string prefixWith)
{
    var data = GenerateData()
        .Where(x => x.Libelle.Contains(search))
        .Select(x => new
        {
            Id = x.Id,
            Libelle = x.Libelle,
            Prefix = prefixWith
        });
 
    return Json(data);
}
````

Pour que ces modifications soient prises en compte dans notre vue, il faudra modifier la fonction dans "source", et remplacer la fonction "_renderItem".

La fonction "$.map" permet de transformer la liste d'objets JSON reçu dans une autre liste, dans le cas où l'on souhaiterait renommer encore une fois les propriétés des objets de notre liste. 
La fonction "_renderItem" permet de contrôler le rendu de la liste d'auto complétion.

```` html
<%using (var f = Html.BeginForm()) { %>
    <%=Html.TextBox("Libelle_CustomJson")%>
    <%=Html.TextBox("PrefixWithJson")%>
    <%=Html.TextBox("Id_CustomJson")%>
<%} %>
````
 
```` html
<script type="text/javascript">
    $(document).ready(function () {
        $('#Libelle_CustomJson').autocomplete({
            minLength: 1,
            source: function (request, response) {
                $.post('<%=Url.Action("AutoCompleteCustomJson") %>',
                    {
                        search: request.term,
                        prefixWith: $("#PrefixWithJson").val()
                    }, 
                    function (result) {
                        response(result)
                    })
            },
            select: function (event, ui) {
                $('#Libelle_CustomJson').val(ui.item.Libelle);
                $('#Id_CustomJson').val(ui.item.Id);
                return false;
            }
        }).data("autocomplete")._renderItem = function (ul, item) {
            return $("<li></li>")
            .data("item.autocomplete", item)
            .append("<a>" + item.Prefix 
                    + "<br>" + item.Libelle + "</a>")
            .appendTo(ul);
        };
     });
</script>
````

Le résultat :

![Autocomplete](/img/2010-08-02-jquery-autocomplete-mvc-3.png)