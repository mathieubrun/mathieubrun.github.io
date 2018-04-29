document.addEventListener("DOMContentLoaded", function(event) { 
    var links = document.links;

    for (var i = 0, linksLength = links.length; i < linksLength; i++) {
        if (links[i].hostname != window.location.hostname) {
            links[i].target = '_blank';
        } 
    }
});

/*
 * Make the header images move on scroll
 */
$(window).scroll(function () {
    var x = $(this).scrollTop();   
    $('#main').css('background-position', '100% ' + parseInt(-x/3) + 'px' + ', 0%, center top');
});
