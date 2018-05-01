import "simple-jekyll-search/dest/simple-jekyll-search.js"

document.addEventListener("DOMContentLoaded", function(event) { 
    window.SimpleJekyllSearch({
        searchInput: document.getElementById('search-input'),
        resultsContainer: document.getElementById('results-container'),
        json: '/pages/search.json',
        searchResultTemplate: '<div class="search-title"><a href="{url}"><h3> {title}</h3></a><div class="meta">{date} <div class="right"><i class="fa fa-tag"></i> {tags}</div></div><p>{excerpt}</p></div><hr> ',
        noResultsText: 'No results found',
        limit: 10,
        fuzzy: false,
        exclude: []
    })
});
