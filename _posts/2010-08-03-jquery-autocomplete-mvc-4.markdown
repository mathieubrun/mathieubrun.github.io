---
layout: post
title: "JQuery.AutoComplete et ASP.NET MVC : Partie 4"
date: 2010-08-03 -0800
categories: [javascript, mvc, code]
comments: true
---

Pour clore cette série, nous allons présenter les résultats avec des catégories. Comme précédemment, commençons par l'action de notre Controller :

```` csharp
public JsonResult AutoCompleteCategorized(string search){
    var data = GenerateData()
        .Where(x => x.Libelle.Contains(search))
        .Select(x => new
        {
            value = x.Id,
            label = x.Libelle,
            category = x.Category
        });
     return Json(data);
}
````

Suivie de la vue, dans laquelle on pourra noté que lors de l'appel de $().autocomplete(), le résultat est placé dans une variable, afin de pouvoir personnaliser plus facilement les fonctions de rendu.

```` html
<%using (var f = Html.BeginForm()) { %>
<p>Categorized</p>
<%=Html.TextBox("Libelle_Categorized")%>
<%=Html.TextBox("Id_Categorized")%>
<%} %>
<script type="text/javascript">
$(document).ready(function () {
    var ac_categorized = $('#Libelle_Categorized').autocomplete({
        minLength: 1,
        source: function (request, response) {
            $.post('<%=Url.Action("AutoCompleteCategorized") %>',
                {
                    search: request.term
                },
                function (result) {
                    response(result)
                })
        },
        select: function (event, ui) {
            $('#Libelle_Categorized').val(ui.item.label);
            $('#Id_Categorized').val(ui.item.value);
            return false;
        }
    });
    ac_categorized.data("autocomplete")._renderItem = function (ul, item) {
        return $("<li></li>")
        .data("item.autocomplete", item)
        .append("<a>" + item.label + "</a>")
        .appendTo(ul);
    };
    ac_categorized.data("autocomplete")._renderMenu = function (ul, items) {
        var self = this;
        var currentCategory = "";
        $.each(items, function (index, item) {
            if (item.category != currentCategory) {
                ul.append("<li class='ui-autocomplete-category'>"
                     + item.category + "</li>");
                currentCategory = item.category;
            }
            self._renderItem(ul, item);
        });
    };
});
</script>
````

Et le résultat :

![Autocomplete](/img/2010-08-03-jquery-autocomplete-mvc-4.png)

Pour terminer cette série, nous verrons comment créer une méthode d'extension pour capitaliser les cas simples (libellé et identifiant).