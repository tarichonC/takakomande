$(function() {

    var caddie = [];
    var caddieAmount = 0;


    if(Cookies.get('caddie') != null)
        caddie = JSON.parse(Cookies.get('caddie'));


    updateCaddieTotal();

    if(Cookies.get('login') != null) {
        $('#sign-in-out').html('<a id="sign-out" href="?sign-out">Déconnecter <span class="small">(' + Cookies.get('login') +')</span></a>');
        $('#sign-out').click(function() {
            Cookies.remove('login');
            Cookies.remove('caddie');
            $('#sign-in-out').html('<a id="sign-in" href="?sign-in">Connexion</a>');
            console.log('après remove ' + Cookies.get('login'));
            caddie = JSON.parse(Cookies.get('caddie'));
            updateCaddieTotal();
        });
    }

    // Get the JSON content to display the menu
    $.getJSON( "JSON/food-menu.json", function( data ) {
        var items = [];
        $.each( data, function( key, val ) {
            items.push(val);
        });
        var html = ""
        items.forEach(function(item) {
            html += "<div id='"+ item.id +"' class='food-menu-item'><img src='food-menu-img/" + item.img + "'>";
            html += "<h3>" + item.name + "</h3><p>" + item.price + " €</p>";
            html += "<ul><li class='more-info'><a href='?info&id=" + item.id + "'>+ d'infos</a></li><li class='add-to-cart'><a href='?add2cart=" + item.id + "'>Ajouter au panier</a></li></ul></div>";
        });
        $("#food-menu").html(html);
    });

    // Clear Each placeholder on focus
    $('input').each(function() {
        if ($(this).attr('placeholder') && $(this).attr('placeholder') != '')
        {
            $(this).attr( 'data-placeholder', $(this).attr('placeholder') );
        }
    });


    $('input').focus(function()
                     {
        if ($(this).attr('data-placeholder') && $(this).attr('data-placeholder') != '')
        {
            $(this).attr('placeholder', '');
        }
    });

    $('input').blur(function()
                    {
        if ($(this).attr('data-placeholder') && $(this).attr('data-placeholder') != '')
        {
            $(this).attr('placeholder', $(this).attr('data-placeholder'));
        }
    });

    $("body").on("click", "#foodModal, #loginModal", function() {
        $("#foodModal").remove();
        $("#loginModal").remove();
    });

    $("body").on("click", ".modal-content", function(e) {
        e.stopPropagation();
    });

    $('a[href^="#"]').click(function(){
        var toTheId = $(this).attr("href");

        $('html, body').animate({
            scrollTop:$(toTheId).offset().top
        }, 500);
    });

    function pushCaddie(id) {

        var inserted = false

        caddie.forEach(function (element) {
            if(element.id == id) {
                element.times ++;
                inserted = true;
            }
        });

        if(inserted == false) {
            caddie.push({"id": id, "times": 1});
        }
        console.log(caddie);

    }

    function updateCaddieTotal() {

        var items = [];

        $.getJSON( "JSON/food-menu.json", function( data ) {
            $.each( data, function( key, val ) {
                items.push(val);
            });

            caddieAmount = 0;

            caddie.forEach(function(foodArticle, index) {
                console.log("updateCaddieTotal ="+index);
                var unitPrice;
                for(var i=0 ; i<items.length ; i++) {
                    if(items[i].id == foodArticle.id) {
                        unitPrice = items[i].price;
                        break;
                    }
                }

                caddieAmount += (unitPrice * foodArticle.times);

            });
                $("#caddieAmount").html(' (' + caddieAmount + ' €)');

            console.log('caddieAmount :' + caddieAmount);
        });


    }

    $('body').on('click', 'a[href^="?add2cart"]', function(event) {

        console.log($(this).attr('href'));
        event.preventDefault();
        event.stopPropagation();

        var href = $(this).attr('href');
        var n = href.search('=');
        var id = href.substring(n+1);
        var inserted = false;

        pushCaddie(id);

        Cookies.set('caddie', JSON.stringify(caddie));
        updateCaddieTotal();

    });

    function caddie2html() {
        $.getJSON( "JSON/food-menu.json", function( data ) {

            var items = [];

            $.each( data, function( key, val ) {
                items.push(val);
            });

            var html = "<table id='caddie'><tbody>";

            caddie.forEach(function(item) {
                var i = 0;
                html += "<tr>";
                while(i<items.length && items[i].id != item.id) {
                    i++;
                }
                var unitPrice = parseFloat(items[i].price) * parseFloat(item.times);
                html += '<td class="center"><img src="food-menu-img/' + items[i].img +'"></td>';
                html += '<td>' + items[i].name + '</td>';
                html += '<td class="center"><input type="text" id="foodItemCount' + item.id  +'" value="' + item.times + '"></td>';
                html += '<td class="right">' + unitPrice + '€</td>';
                html += '<td class="center"><a href="?removeFromCaddie=' + item.id + '">&times;</a></td>';
                html += '</tr>';
            });

            html += "</table>";
            if($('#caddie').length) {
                $('#caddie').remove();
            }
            $('#right-header-section').append(html);
        });
    }

    $('body').on('change', 'input[id^="foodItemCount"]', function() {
        var id = $(this).attr('id').substring(13);
        var value = $(this).val();
        console.log("modif");
        if(value == 0) {
            removeFromCaddie(id);
        }
        else {
            updateValueFromCaddie(id, value);
        }
    });

    function updateValueFromCaddie(id, value) {

        var i = 0;

        console.log('updateValueFromCaddie:' + typeof id + ':'+value+':'+caddie.length+':'+ typeof caddie[0].id);

        while(i<caddie.length && id.localeCompare(caddie[i].id) != 0) {
            if(caddie[i].id == id) {
                console.log("updateValueFromCaddie:" + id);
                caddie[i].times = value;
                Cookies.set('caddie', JSON.stringify(caddie));
                updateCaddieTotal();
                console.log("value modified");
            }
            i++;
        }
    }

    function removeFromCaddie(id) {
        var i=0;
        var removed = false;
        console.log('remove');
        while(i<caddie.length && !removed) {
            if(caddie[i].id == id) {
                removed = true;
                console.log("Element removed");
                if(caddie.length == 1) {
                    caddie = [];
                }
                else {
                    caddie.splice(i,1);
                }
                updateCaddieTotal();
                Cookies.set('caddie', JSON.stringify(caddie));
            }
            i++;
        }
    }

    $('body').on('click', 'a[href^="?removeFromCaddie"]', function() {
        event.preventDefault();
        var href = $(this).attr('href');
        var n = href.search('=');
        var id = href.substring(n+1);
        removeFromCaddie(id);
        caddie2html();
    });

    $('body').on('click', 'a[href^="?caddie"]', function() {
        event.preventDefault();
        if($('#caddie').length) {
            $('#caddie').remove();
        }
        else {
            caddie2html();
        }
    });

    $('body').on('click', 'a#menu-filter', function(event) {

        event.preventDefault();
        $('a#menu-filter').removeClass("active");
        $('a#starter-filter').removeClass("active");
        $('a#sushiboard-filter').removeClass("active");
        $('a#dessert-filter').removeClass("active");

        $('a#menu-filter').addClass("active");

        $.getJSON( "JSON/food-menu.json", function( data ) {

            var items = [];
            var results = [];

            $.each( data, function( key, val ) {
                items.push(val);
            });

            // console.log('a#starter-filter' + items);

            for(var i=0 ; i<items.length ; i++) {
                if(items[i].type == "menu") {
                    results.push(items[i]);
                }
            }

            var html = ""

            results.forEach(function(item) {
                html += "<div id='"+ item.id +"' class='food-menu-item'><img src='food-menu-img/" + item.img + "'>";
                html += "<h3>" + item.name + "</h3><p>" + item.price + " €</p>";
                html += "<ul><li class='more-info'><a href='?info&id=" + item.id + "'>+ d'infos</a></li><li class='add-to-cart'><a href='?add2cart=" + item.id + "'>Ajouter au panier</a></li></ul></div>";
            });
            $("#food-menu").html(html);
        });

    });

    // Affichage des plateaux uniquement
    $('body').on('click', 'a#dessert-filter', function(event) {

        event.preventDefault();

        $('a#menu-filter').removeClass("active");
        $('a#starter-filter').removeClass("active");
        $('a#sushiboard-filter').removeClass("active");
        $('a#dessert-filter').removeClass("active");

        $('a#dessert-filter').addClass('active');

        $.getJSON( "JSON/food-menu.json", function( data ) {

            var items = [];
            var results = [];

            $.each( data, function( key, val ) {
                items.push(val);
            });

            for(var i=0 ; i<items.length ; i++) {
                if(items[i].type == "dessert") {
                    results.push(items[i]);
                }
            }

            var html = ""

            results.forEach(function(item) {
                html += "<div id='"+ item.id +"' class='food-menu-item'><img src='food-menu-img/" + item.img + "'>";
                html += "<h3>" + item.name + "</h3><p>" + item.price + " €</p>";
                html += "<ul><li class='more-info'><a href='?info&id=" + item.id + "'>+ d'infos</a></li><li class='add-to-cart'><a href='?add2cart=" + item.id + "'>Ajouter au panier</a></li></ul></div>";
            });
            $("#food-menu").html(html);
        });

    });


    // Affichage des plateaux uniquement
    $('body').on('click', 'a#sushiboard-filter', function(event) {

        event.preventDefault();

        $('a#menu-filter').removeClass("active");
        $('a#starter-filter').removeClass("active");
        $('a#sushiboard-filter').removeClass("active");
        $('a#dessert-filter').removeClass("active");

        $(this).addClass("active");

        $.getJSON( "JSON/food-menu.json", function( data ) {

            var items = [];
            var results = [];

            $.each( data, function( key, val ) {
                items.push(val);
            });

            // console.log('a#starter-filter' + items);

            for(var i=0 ; i<items.length ; i++) {
                if(items[i].type == "plateau") {
                    results.push(items[i]);
                }
            }

            var html = ""

            results.forEach(function(item) {
                html += "<div id='"+ item.id +"' class='food-menu-item'><img src='food-menu-img/" + item.img + "'>";
                html += "<h3>" + item.name + "</h3><p>" + item.price + " €</p>";
                html += "<ul><li class='more-info'><a href='?info&id=" + item.id + "'>+ d'infos</a></li><li class='add-to-cart'><a href='?add2cart=" + item.id + "'>Ajouter au panier</a></li></ul></div>";
            });
            $("#food-menu").html(html);
        });

    });


    // Affichage des entrées uniquement
    $('body').on('click', 'a#starter-filter', function(event) {

        event.preventDefault();

        $('a#menu-filter').removeClass("active");
        $('a#starter-filter').removeClass("active");
        $('a#sushiboard-filter').removeClass("active");
        $('a#dessert-filter').removeClass("active");

        $('a#starter-filter').addClass("active");

        $.getJSON( "JSON/food-menu.json", function( data ) {

            var items = [];
            var results = [];

            $.each( data, function( key, val ) {
                items.push(val);
            });

            // console.log('a#starter-filter' + items);

            for(var i=0 ; i<items.length ; i++) {
                if(items[i].type == "entrée") {
                    results.push(items[i]);
                }
            }

            var html = ""

            results.forEach(function(item) {
                html += "<div id='"+ item.id +"' class='food-menu-item'><img src='food-menu-img/" + item.img + "'>";
                html += "<h3>" + item.name + "</h3><p>" + item.price + " €</p>";
                html += "<ul><li class='more-info'><a href='?info&id=" + item.id + "'>+ d'infos</a></li><li class='add-to-cart'><a href='?add2cart=" + item.id + "'>Ajouter au panier</a></li></ul></div>";
            });
            $("#food-menu").html(html);
        });

    });

    $('body').on('click', 'a#sign-in', function() {
        var html = '<div id="loginModal" class="modal"><div class="modal-content"><div class="modal-header"><span class=\'close\'>&times;</span></div>';
        html+= '<div class="modal-body">';
        html+= '<form id="account-creation"><h3>Créez un compte</h3><input type="email" id="email-login-creation" placeholder="email"><input type="submit" value="Creer un compte"></form>';
        html+= '<form id="account-connexion"><h3>Déjà enregistré ?</h3><input type="email" id="email-login-connexion" placeholder="email"><input type="password" id="password-login-connexion" placeholder="Mot de passe"><input type="submit" id="login-submit" value="Connexion"></form>';
        html+= '</div>';
        html+= '<div id="login-modal-footer" class="modal-footer>"';
        html+= '</div></div></div>';

        event.preventDefault();

        $('body').append(html)
    });

    $('body').on('focusout', '#loginModal input[type="email"]', function() {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if(regex.test($(this).val())) {
            $(this).addClass('valid');
        }
        else $(this).addClass('invalid');
    });

    $('body').on('focusin', '#loginModal input[type="email"]', function() {
        $(this).removeClass('valid');
        $(this).removeClass('invalid');
    });

    $('body').on('click', '#sign-out', function(event) {
        event.preventDefault();
        $('#sign-in-out').html('<a id="sign-in" href="?sign-out"><a id="sign-in" href="?sign-in">Connexion</a>');
        
        Cookies.remove('login');
        Cookies.remove('caddie');
        caddie = [];
        updateCaddieTotal();
    });

    $('body').on('click', '#login-submit', function(event) {

        var login = $('#email-login-connexion').val();
        var password = $('#password-login-connexion').val();
        var processOk = false;

        console.log('-- request for ID : login(' + login + ') passws(' + password + ')');

        event.preventDefault();
        $('#login-error').remove();

        $.getJSON( "JSON/login.json", function( data ) {

            var items = [];
            var i = 0;

            console.log('-- -- retrieving data');

            $.each( data, function( key, val ) {
                items.push(val);
            });

            while(i < items.length && processOk == false) {
                if(items[i].login == login && items[i].password == password)
                    processOk = true;
                i++;
            }

            if(processOk == true) {

                console.log('-- -- -- Initializing cookie');
                $('#login')
                $("#loginModal").remove();
                Cookies.set('login', login);
                $('#sign-in-out').html('<a id="sign-out" href="?sign-out">Déconnecter <span class="small">(' + Cookies.get('login') +')</span></a>');

            }

            else {
                var html = "<p id='login-error' class='invalid'><b><u></u>Identification impossible :</b> <i>vérifiez l'adresse mail ou le mot de passe saisi.</i></p>"
                $('#account-connexion').append(html);

                console.log('-- -- -- ID error');

            }

        });

    });

    $('body').on("click", '.food-menu-item', function(){
        var element = $(this).attr("id");
        $.getJSON( "JSON/food-menu.json", function( data ) {
            var items = [];
            $.each( data, function( key, val ) {
                items.push(val);
            });
            console.log(items);
            var i=0;
            while(i<items.length && items[i].id != element) {
                i++;
            }

            var html = "<div id='foodModal' class='modal'><div class='modal-content'><div class='modal-header'><span class='close'>&times;</span><h2>"+ items[i].name +"</h2></div><div class='modal-body'><img src='./food-menu-img/"+ items[i].img + "'><p>"+ items[i].summary + "</p></div><div class='modal-footer'><p>"+ items[i].price +" €</p><a href='?add2cart=" + items[i].id + "'>Ajouter au panier</a></div></div></div>";

            $("#food-menu").append(html);
        });
    });

    $('body').on("click", '.close', function(){
        $("#foodModal").remove();
        $("#loginModal").remove();
    });


});
