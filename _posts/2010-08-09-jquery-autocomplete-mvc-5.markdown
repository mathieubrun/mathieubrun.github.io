---
layout: post
title: "JQuery.AutoComplete et ASP.NET MVC : Partie 5"
date: 2010-08-09 -0800
categories: [javascript, mvc, code]
comments: true
---

Pour terminer cette série, voici un extrait de code permettant de créer simplement une zone de texte avec autocompletion.

En premier, le code de la méthode d'extension :

```` csharp
using System;
using System.Linq.Expressions;
using System.Web.Mvc;
using System.Web.Mvc.Html;
 
namespace Cogimator.Demos.Mvc
{
    /// <summary>
    /// Classes helper pour autocompletion
    /// </summary>
    public static class AutoCompleteExtensions
    {
        /// <summary>
        /// Genere un editeur avec autocompletion
        /// </summary>
        /// <typeparam name="TModel">Type de Model</typeparam>
        /// <typeparam name="TDisplayValue">Type de la propriété utilisée 
        /// pour affichage</typeparam>
        /// <param name="html">helper</param>
        /// <param name="displayExpression">Expression pour indiquer la 
        /// propriété à utiliser</param>
        /// <param name="action">Action du Controler courant renvoyant du 
        /// JSON</param>
        /// <returns>Chaine HTML</returns>
        public static string AutoCompleteFor<TModel, TDisplayValue>(this HtmlHelper<TModel> html, Expression<Func<TModel, TDisplayValue>> displayExpression, string action)
        {
            var res = html.EditorFor(displayExpression, null).ToHtmlString();
 
            var displayName = ModelMetadata.FromLambdaExpression(displayExpression, html.ViewData).PropertyName;
 
            res += string.Format(
                @"<script type=""text/javascript"">
                    $(document).ready(function() \{\{
                        $(""#{0}"")
                            .autocomplete(\{\{
                                source: function (request, response) \{\{
                                    $.post(""{1}"",
                                        \{\{
                                            term: request.term
                                        }}, 
                                        function (result) \{\{
                                            response(result)
                                        }})
                                }},
                                minLength: 1,
                                select: function(event, ui) \{\{
                                    $('#{0}').val(ui.item.label);
                                    return false;
                                }}
                            }});
                    }});
                </script>",
                html.ViewData.TemplateInfo.GetFullHtmlFieldId(displayName),
                UrlHelper.GenerateUrl(null, action, null, null, html.RouteCollection, html.ViewContext.RequestContext, true));
 
            return res;
        }
    }
}
````

Un modèle simple :

```` csharp
namespace Cogimator.Demos.FrontEnd.Mvc.Models
{
    public class SimpleModel
    {
        public string Label { get; set; }
    }
}
````

Dans la partie configuration/pages/namespace des fichiers web.config situé dans le dossier racine et dans le dossier Views de votre application MVC, n'oubliez pas d'indiquer le namespace de vos méthodes d'extension et de vos modeles :

```` xml
<add namespace="Cogimator.Demos.Mvc" />
<add namespace="Cogimator.Demos.FrontEnd.Mvc" />
````

Et la vue :

```` html
<%@ Page Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<SimpleModel>" %>
<asp:Content ContentPlaceHolderID="plhCenter" runat="server">
    <%using (var f = Html.BeginForm()) { %>
    <h2>Extension</h2>
    <p>Champ : <%=Html.AutoCompleteFor( x=> x.Label, "AutoComplete") %></p>
    <%} %> 
</asp:Content>
````

Ceci termine cette série sur JQuery.UI.AutoComplete et ASP.NET MVC.