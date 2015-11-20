---
layout: post
title: "JQuery.AutoComplete et ASP.NET MVC : Partie 2"
date: 2010-07-31 -0800
tags: [jquery, asp.net-mvc]
comments: true
---

Dans le billet précédent, nous avons vu comment réaliser une auto complétion sur une TextBox, avec ASP.NET MVC 2.

Nous allons maintenant voir comment personnaliser cet exemple, pour envoyer un deuxième paramètre en plus de la valeur saisie.

Comme dans la partie 1, l'action du Controller, avec deux paramètres. De plus, le paramètre JsonRequestBehavior a été retiré.

```` csharp
public JsonResult AutoCompleteCustom(string search, string prefixWith)
{
    var data = GenerateData()
        .Where(x => x.Libelle.Contains(search))
        .Select(x => new
        {
            value = x.Id,
            label = prefixWith + " " + x.Libelle
        });
  
    return Json(data);
}
````

Dans la vue, la source de données passée devient plus complexe : il s'agit d'une requête avec $.post, qui nous permet de passer en HTTP POST (d'où le retrait de JsonRequestBehavior.AllowGet), mais surtout de nommer les paramètres passés, via un objet anonyme. Ici les paramètres reprennent les noms des paramètres de notre action : "search" et "prefixWith".

Enfin, les données renvoyées par le Controller sont passés a jquery.ui.autocomplete par la fonction "response".

```` html
<%using (var f = Html.BeginForm()) { %>
    <%=Html.TextBox("Libelle_Custom")%>
    <%=Html.TextBox("PrefixWith")%>
    <%=Html.TextBox("Id_Custom")%>
<%} %>
````
 
```` html
<script type="text/javascript">
    $(document).ready(function () {
        $('#Libelle_Custom').autocomplete({
            minLength: 1,
            source: function (request, response) {
                $.post('<%=Url.Action("AutoCompleteCustom") %>', 
                    {
                        search: request.term,
                        prefixWith: $("#PrefixWith").val()
                    },
                    function (result) {
                        response(result);
                    })
            },
            select: function (event, ui) {
                $('#Libelle_Custom').val(ui.item.label);
                $('#Id_Custom').val(ui.item.value);
                return false;
            }
        });
    });
</script>
````

Et le résultat :

![Autocomplete](/img/2010-07-31-jquery-autocomplete-mvc-2.png)