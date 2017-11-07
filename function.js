
// Return a string value containing the sign-out link formatted
// @login : login of the sign-ined login
// @return html code for the sign-out link
function signOutLinkHtml(login) {

    var html = '<a id="sign-out" href="?sign-out">';
        html+= 'Déconnecter <span class="small">(' + login +')</span>';
        html+= '</a>';

     return html;
}

// Return a string value containing the sign-in link formatted
// @return html code for the sign-in link
function signInLinkHtml() {

    html = '<a id="sign-in" href="?sign-in">Connexion</a>';

    return html;
}

// Get the JSON data from the JSONFil
// @JSONFile : path to JSONFile
// @return : JSON data
function getJSONDataFromFile(JSONFile) {

    var dataReturned;

    $.getJSON( JSONFile, function( data ) {
        dataReturned = data;
    });

    return dataReturned;
}

// Load food items from the JSON file and load it in #food-menu section
// @file : path to JSON file
// @selection : type of food items to load 
// 'all' load all items regardless of item types | 'menu' load only menus | 'entrée' load only starters  |
// 'plateau' load sushiboards | dessert load only desserts 
function loadFoodMenu(file = 'JSON/food-menu.json', selection = 'all') {

    console.log('loadFoodMenu(' + file + ', ' + selection + ')');

    var foodMenu = $('#food-menu');

    // AJAX request for file
    $.getJSON(file, function(data) {

        console.log('loadFoodMenu -- $.getJSON:data - ' + data);

        var items = [];

        // pushing all JSON data in array
        $.each( data, function( key, val ) {
            items.push(val);
          });

        console.log('loadFoodMenu -- $.getJSON:items - ' + items);

        // mapping JSON array items into formatted html string array
        itemsHtml = items.map(function(item, index) {

            var itemHtml = '';

            if(selection == item.type || selection == 'all') {
                itemHtml = '<div id="'+ item.id + '" class="food-menu-item"><img src="food-menu-img/' + item.img + '">';
                itemHtml += '<h3>' + item.name + '</h3><p>' + item.price + '&nbsp;€</p>';
                itemHtml += '<ul><li class="more-info"><a href="?info&id=' + item.id + '">+ d\'infos</a></li><li class="add-to-cart"><a href="?add2cart=' + item.id + '">Ajouter au panier</a></li></ul></div>';
                console.log('loadFoodMenu -- $.getJSON: -- items.map - [' + index + '] ' + itemHtml);
            }

            return itemHtml;
        });

        foodMenu.empty();
        
        if(itemsHtml.length) {
            foodMenu.append(itemsHtml.join(''));
        }

    });
}

 function loadFoodMenuMenu() {
    loadFoodMenu(file = 'JSON/food-menu.json', selection = 'menu');
 }

 function loadFoodMenuDessert() {
    loadFoodMenu(file = 'JSON/food-menu.json', selection = 'dessert');
 }

 function loadFoodMenuEntree() {
    loadFoodMenu(file = 'JSON/food-menu.json', selection = 'entrée');
 }

 function loadFoodMenuPlateau() {
    loadFoodMenu(file = 'JSON/food-menu.json', selection = 'plateau');
 }

 // Remove class .active from each filters
 // and add class .active to link
 // @link : jQuery object
function setActiveFilter(link) {
    
    if(link.length != 0) {

        $('.filter a').each(function() {
            $(this).removeClass("active");
        });

        link.addClass('active');

        console.log('setActiveFilter : class active set to ' + link.attr('id'));

    }
    else {
        console.log('setActiveFilter : link empty jQuery object');
    }

 }