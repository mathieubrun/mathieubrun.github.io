import "./../css/type-on-strap.scss";
import "font-awesome/css/font-awesome.css"

// external links
document.addEventListener("DOMContentLoaded", function(event) { 
    var links = document.links;

    for (var i = 0, linksLength = links.length; i < linksLength; i++) {
        if (links[i].hostname != window.location.hostname) {
            links[i].target = '_blank';
        } 
    }
});

// Make the header images move on scroll
window.addEventListener('scroll', function() {
    var x = window.pageYOffset | document.body.scrollTop;
    var m = document.getElementById("main"), c = m.style;
    
    c.backgroundPosition = '100% ' + parseInt(-x/3) + 'px' + ', 0%, center top';
});
