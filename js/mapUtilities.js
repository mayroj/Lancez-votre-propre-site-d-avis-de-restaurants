function getEtoiles (place) {
    var rating = [];
    
    if (place.rating) {
        for (var i = 0; i < 5; i++) {
            if (place.rating < (i + 0.5)) {
                rating.push("✩");
            } else {
                rating.push("✭");
            }
        }
        return rating.join(" ");
    }
}
/*-----------------------------------------------------------------------------------
Lorsque l'utilisateur sélectionne une ville, obtien les détails de l'emplacement pour la ville et
            zoomer sur la carte dans la ville.
-------------------------------------------------------------------------------------*/
function onPlaceChanged() {
    mesRestaurants=[];
    var place = autocomplete.getPlace();
    
    if (place.geometry) {
        map.panTo(place.geometry.location);
        map.setZoom(15);
        rechercher();
    } else {
        
        $("#autocomplete-input").text("");
    }           
}

function nearbySearchCallbck (results, status) {
            
    //results = results.results;
    mesRestaurants = [];
    for (var i = 0; i < results.length; i++) {
        mesRestaurants.push(results[i]);
        
    }           
    
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        rechercher();
    }
}
    
function rechercher () {
    var search = {
        bounds: map.getBounds(),
        type: ["restaurant"]
    };
    places.nearbySearch(search, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            //results = results.results;
            mesRestaurants = [];
            for (var i = 0; i < results.length; i++) {
                mesRestaurants.push(results[i]);
                
            } 
            displayRestaurants(results);
        }
    });
}

function displayRestaurants(restaurants) {
    resetResults();
    resetMarkers();
            
    googleRestaurants = [];
    for (var i = 0; i < restaurants.length; i++) {
        googleRestaurants.push(restaurants[i]);
        markers[i] = new google.maps.Marker({
            position: restaurants[i].geometry.location,
            placeId: restaurants[i].id,
            icon: createMarkerStars(googleRestaurants[i]),
            zIndex: 52,
        });
        
        // Si l'utilsateur clic un resto marker, affiche les details du resto
        google.maps.event.addListener(markers[i], "mouseover", afficheInfoWindowPetite);
        google.maps.event.addListener(markers[i], "mouseout", masquerInfoWindowPetite);
        google.maps.event.addListener(markers[i], "click", afficheInfoWindow);
        google.maps.event.addListener(map, "click", masquerInfoWindow);
        google.maps.event.addListener(markers[i], "touchstart", masquerInfoWindowPetite);
        google.maps.event.addListener(markers[i], "touchend", masquerInfoWindowPetite);
        
        
        ajouterResultsEtMarkers(i, restaurants, i);
        
    }
}
/*-----------------------------------------------------------------------------------
    écouteur d'événement pour trier par
-------------------------------------------------------------------------------------*/
    
/******** Modification **********/

function trierFiltres (min, max) { 

    return mesRestaurants.filter(restaurant => (Math.round(restaurant.rating) >= min && Math.round(restaurant.rating) <= max));    
      
}
    
filterBtn.click(function () {
    if (minStar.val() <= maxStar.val()) {
        restaurantsFiltres = trierFiltres(minStar.val(), maxStar.val());
        displayRestaurants(restaurantsFiltres);    
    } else {
        alert('La note minimum doit être inférieure à la note maximum !');
    }
    
});
/*-----------------------------------------------------------------------------------
    réinitialise les valeurs
-------------------------------------------------------------------------------------*/
function resetResults () {
    var results = document.getElementById('resultats');
    while (results.childNodes[0]) {
           results.removeChild(results.childNodes[0]);
           }
}

function resetMarkers (){
    for (var i = 0; i < markers.length; i++) {
        if (markers[i]) {
            markers[i].setMap(null);
        }
    }
    
    markers = [];
}
/*-----------------------------------------------------------------------------------
    depose les marqueurs sur le map
-------------------------------------------------------------------------------------*/

function getMarker(i) {
    return markers[i] ? function () {markers[i].setMap(map);} : null;
}
/*-----------------------------------------------------------------------------------
    crée la liste des restaurants à droite de la carte
-------------------------------------------------------------------------------------*/
function ajoutResultList (result, i) {
    var ratingElt;
    var listElt = $("<div/>").addClass("results-list").appendTo($("#resultats"));
    listElt.on("click", function () {
        google.maps.event.trigger(markers[i], "click");
    });
    var details = $("<div/>").addClass("placeIcon").appendTo(listElt);
    $("<img/>").attr("src", createPhoto(result)).appendTo(details);
    var listDetails = $("<div/>").addClass("placeDetails").appendTo(listElt);
    $("<div/>").addClass("name").text(result.name).appendTo(listDetails);
    if (result.rating) {
        ratingElt = $("<div/>").addClass("rating");
        getEtoilesRating(ratingElt, result.rating);

        details += ratingElt.appendTo(listDetails);
        details += $("<div/>").addClass("rating-note").text(result.rating).appendTo(listDetails);
    }
    details += $("<a/>").attr("href", "#restaurant-info").addClass("reviews-link").text("Voir les Avis").appendTo(listDetails);
    
}

/*-----------------------------------------------------------------------------------
    crée la photo de l'api
-------------------------------------------------------------------------------------*/

function createPhoto (place) {
    var photos = place.photos;
    var photo;
    
    if (!photos) {
        photo = place.icon;
        avoirPhoto = false;
    } else {
        avoirPhoto = true;
        photo = photos[0].getUrl({
            "maxWidth": 600,
            "maxHeight": 400
        });
    }
    return photo;
}

/*-----------------------------------------------------------------------------------
Affiche la fenêtre d'information avec les détails du restaurant
-------------------------------------------------------------------------------------*/

function afficheInfoWindow () {
    masquerInfoWindowPetite();
    var marker = this;
    places.getDetails({
        placeId: marker.placeResult.place_id
    }, function (place, status) {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
            return;
        }
        infoWindow.open(map, marker);
        creerIWContent(place);
        displayRestaurantInfo(place);
    });
}

function afficheInfoWindowPetite () {
    masquerInfoWindow();
    var marker = this;
    places.getDetails({
        placeId: marker.placeResult.place_id
    }, function (place, status) {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
            return;
        }
        infoWindowPetite.open(map, marker);
        creerIWContentPetit(place);
    });
}

function afficheInfoWindowMesRest () {
    masquerInfoWindowPetite();
    var marker = this;
    infoWindow.open(map, marker);
    creerIWContent(mesRestaurants[marker.id]);
    displayRestaurantInfo(mesRestaurants[marker.id]);
}

function afficheInfoWindowPetiteMesRest () {
    masquerInfoWindowPetite();
    var marker = this;
    infoWindowPetite.open(map, marker);
    creerIWContentPetit(mesRestaurants[marker.id]);
}

function ajoutRestaurantInfoWindow () {
    var marker = this;
    if (restoEstNouveau) {
        infoWindowNouveauRest.open(map, marker);
        creerResDetailContent(marker);
        nouveauRestMarker.push(marker);
        nResNum += 1;
    } else {
        infoWindow.open(map, marker);
        creerIWContent(nouveauPlace[marker.id]);
        displayRestaurantInfo(nouveauPlace[marker.id]);
    }
}

/*-----------------------------------------------------------------------------------
    ferme les fenêtres d'information "InfoWindow"
-------------------------------------------------------------------------------------*/

function masquerInfoWindow (marker) {
    infoWindow.close(map, marker);
}

function masquerInfoWindowPetite (marker) {
    infoWindowPetite.close(map, marker);
}

function masquerInfoWindowNouveauRest (marker) {
    infoWindowNouveauRest.close(map, marker);
}

/*-----------------------------------------------------------------------------------
    affiche des informations supplémentaires ci-dessous lorsque le restaurant est cliqué
-------------------------------------------------------------------------------------*/

    function displayRestaurantInfo (place) {
                afficheForm();
                restaurantInfoElt.css("display", "block");
                $("#name").text(place.name);
                $("#address").text(place.vicinity);
                $("#telephone").text(place.formatted_phone_number);            
                if (place.website) {
                    var website = hostnameRegexp.exec(place.website);
                    if (website === null) {
                        website = "https://" + place.website + "/";
                    }               

                    $("#website").html('<a href="' + website + '">Visiter la website du Restaurant</a>');

                }

                var reviewsElt = $("#reviews");
                var reviewsHtml = "";

                reviewsElt.html(reviewsHtml);
                if (place.reviews) {
                    if (place.reviews.length > 0) {
                        for (var i = 0; i < place.reviews.length; i += 1) {
                            var review = place.reviews[i];
                            var avatar;
                            if (place.reviews[i].profile_photo_url) {
                                    avatar = place.reviews[i].profile_photo_url;
                                } else {
                                    avatar = 'img/avatar.png';
                                }
                            reviewsHtml += '<div class="restaurant-reviews">' +
                                '<h3 class="review-title">' +
                                '<span class="profile-photo" style="background-image: url(' + avatar + ')"></span>';

                            if (place.rating) {
                                reviewsHtml += '<span id="review-rating" class="rating">' + getEtoiles(review) + '</span>';

                            }
                            reviewsHtml += '</h3>' +
                                '<p>' + place.reviews[i].text + '</p>' +
                                '</div>';
                            reviewsElt.html(reviewsHtml);
                         }
                    }
                }

    /*-----------------------------------------------------------------------------------
        ajoute la fonctionnalité street view
    -------------------------------------------------------------------------------------*/
    let sv = new google.maps.StreetViewService();
    sv.getPanorama({
        location: place.geometry.location,
        radius: 50
    }, processSVData);
    
    var panoElt = document.getElementById("pano");
    var streetViewWrapper = $("#street-view-wrapper");
    var voirPhoto = $("#see-photo");
    var voirStreetView = $("#see-street-view");
    var photoElt = $("#photo");            
   
    photoElt.html('<img class="photo-big" ' + 'src="' + createPhoto(place) + '"/>');    
    
    streetViewWrapper.css("display", "block");
    voirStreetView.css("display", "none");
    photoElt.css("display", "none");
    
    if(avoirPhoto) {
        voirPhoto.css("display", "block");
    } else {
        voirPhoto.css("display", "none");
    }

    function processSVData (data, status) {
        if (status === "OK") {
            let panorama = new google.maps.StreetViewPanorama(panoElt);
            panorama.setPano(data.location.pano);
            panorama.setPov({
                heading: 270,
                pitch: 0
            });
            panorama.setVisible(true);
            
            
            /*-----------------------------------------------------------------------------------
                clique sur le bouton Street View et affiche Street View et cache la photo
            -------------------------------------------------------------------------------------*/
            voirStreetView.click(function() {
                voirStreetView.css("display", "none");
                voirPhoto.css("display", "block");
                streetViewWrapper.css("display", "block");
                photoElt.css("display", "none");
            });                   
            
             /*-----------------------------------------------------------------------------------
                clique sur le bouton photo et affiche la photo masque la street view
            -------------------------------------------------------------------------------------*/
            voirPhoto.click(function(){
                voirStreetView.css("display", "block");
                voirPhoto.css("display", "none");
                streetViewWrapper.css("display", "none");
                photoElt.css("display", "block");
            });                    
            
        } else {
            voirPhoto.css("display", "none");
            streetViewWrapper.css("display", "none");
            photoElt.css("display", "block");
        }
    }
}

/*-----------------------------------------------------------------------------------
    crée les marqueurs avec des étoiles et ajoute les valeurs par défaut si aucune as évaluation
-------------------------------------------------------------------------------------*/

function createMarkerStars (result) {
    var rating = Math.round(result.rating);
    var markerIcon;
    
    if (isNaN(rating)) {
        markerIcon = "img/" + "clip.png";
    } else {
        markerIcon = "img/" + "bitmap" + rating + ".png";
    }
    return markerIcon;
}
/*-----------------------------------------------------------------------------------
    ajoute les résultats et les marqueurs
-------------------------------------------------------------------------------------*/
function ajouterResultsEtMarkers (markersI, array, i) {
    ajoutResultList(array[i], markersI);
    markers[markersI].placeResult = array[i];
    setTimeout(getMarker(markersI), i * 100); 
}

/*-----------------------------------------------------------------------------------
    Construit la petite fenêtre d'information
-------------------------------------------------------------------------------------*/
function creerIWContentPetit (place) {
    $("#iw-icon-small").html('<img class="photo" ' + 'src="' + createPhoto(place) + '"/>');
    $("#iw-url-small").html('<b>' + place.name + '</b>');
    
    if (place.rating) {
        getEtoilesRating($("#iw-url-small"), place.rating);
    } else {
        $("#iw-rating-small").css("display", "none");
    }
}

/*-----------------------------------------------------------------------------------
    Construit la grande fenêtre d'informations
-------------------------------------------------------------------------------------*/
function creerIWContent (place) {
    $("#iw-icon").html('<img class="photo" src="' + createPhoto(place) +'"/>');            
    $("#iw-url").html('<b><a href="#restaurant-info">' + place.name + '</a></b>');
    $("#iw-address").text(place.vicinity);
    if (place.formatted_phone_number) {
        
        $("#iw-phone").css("display", "");
        $("#iw-phone").text(place.formatted_phone_number);
        
    } else {

        $("#iw-phone").css("display", "none");
    }     
    
    if (place.rating) {
        
        getEtoilesRating($("#iw-rating"), place.rating);
    } else {

        $("#iw-rating").css("display", "block");
        //$("#iw-rating-small").html(ratingHtml);
    }
    if (place.website) {
        var website = hostnameRegexp.exec(place.website);
        if (website === null) {
            website = "http://" + place.website + "/";
        }
        
        $("#iw-website").css("display", "");
        $("#iw-website").html('<a href="' + website + '">' + place.website + '</a>');
        
    } else {

        $("#iw-website").css("display", "none");
    }
    if (place.opening_hours) {
        if (place.opening_hours.open_now) {

            $("#iw-open").css("display", "");
            $("#iw-open").text("Maintenaint Ouvert");
        } else {
            
            $("#iw-open").css("display", "none");
        }
    }

    $("#iw-reviews").text("Voir Avis");
}

/*-----------------------------------------------------------------------------------
    Construit la nouvelle fenêtre d'informations sur le restaurant
-------------------------------------------------------------------------------------*/

function creerResDetailContent (marker) {
    restaurantInfoElt.css("display", "block");
    form.css("padding", "10px");

    form.html('<h3 class="add-res-heading">Ajouter un Restaurant</h3>' +
        '<input type="text" id="res-name" name="res-name" placeholder="Nom du Restaurant" required/>' +
        '<input type="hidden" id="res-location-lat" name="res-location-lat" value="' + marker.position.lat() +'"/>' +
        '<input type="hidden" id="res-location-lng" name="res-location-lng" value="' + marker.position.lng() +'"/>' +
        '<input type="text" name="res-address" id="res-address" placeholder="Adresse du Restaurant" required/>' +
        '<label for="res-rating">Note: </label>' +
        '<select name="res-rating" id="res-rating" required>' +
            '<option value="1">1</option>' +
            '<option value="2">2</option>' +
            '<option value="3">3</option>' +
            '<option value="4">4</option>' +
            '<option value="5">5</option>' +
        '</select>' +
        '<input type="text" name="res-telephone" id="res-telephone" placeholder="Telephone du Restaurant" />' +
        '<input type="text" name="res-website" id="res-website" placeholder="Website"/>' +
        '<button id="add-restaurant" class="button add-restaurant">Ajouter Restaurant </button>');
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation Service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}