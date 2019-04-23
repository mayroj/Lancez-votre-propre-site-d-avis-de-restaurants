/*-----------------------------------------------------------------------------------
initialise la carte
-------------------------------------------------------------------------------------*/

function initMap () {
    
    /*-----------------------------------------------------------------------------------
     utilise la géolocalisation pour savoir où l'utilisateur est
    -------------------------------------------------------------------------------------*/
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            $(".filtre option:first").attr("selected", true);
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            if (typeof google === "object" && typeof google.maps === "object") {
                rechercheElt.css("display", "block");
                filtreOptionsElt.css("display", "block");
            }            
            
            map = new google.maps.Map(document.getElementById("map"), {
                center: pos,
                zoom: 14,
                streetViewControl: false
            });
            
            infoWindow = new google.maps.InfoWindow({
                content: document.getElementById("info-content")
            });
            
            infoWindowPetite = new google.maps.InfoWindow({
                content: document.getElementById("info-content-small"),
            });
            
            infoWindowNouveauRest = new google.maps.InfoWindow({
                content: document.getElementById("info-content-new-restaurant"),
            });
            
            infoWindow.setPosition(pos);
            map.setCenter(pos);
            
            var marker = new google.maps.Marker({
                position: pos,
                icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                title: "Votre Location.",
                draggable: true
            });
            
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout (function () {
                marker.setAnimation(null)
            }, 4000);
            
            marker.setMap(map);
            
            /*-----------------------------------------------------------------------------------
            Autocomplete
            -------------------------------------------------------------------------------------*/
            
            autocomplete = new google.maps.places.Autocomplete(
                (document.getElementById("autocomplete-input")), {
                    types: ["(cities)"],
            });
            
            autocomplete.addListener('place_changed', onPlaceChanged);
            google.maps.event.trigger(map, "resize");
            
            /*-----------------------------------------------------------------------------------
             si la carte est positionee, effectue une nouvelle recherche
            -------------------------------------------------------------------------------------*/
            map.addListener("dragend", function () {
                mesRestaurants = [];
                resetFiltre();
                rechercher();
            });           
            
            /*-----------------------------------------------------------------------------------
            un clic droit pourrait être utilisé pour ajouter un nouveau restaurant
            -------------------------------------------------------------------------------------*/
            map.addListener("rightclick", function (e) {
                masquerInfoWindow(marker);
                restoEstNouveau = true;
                
                var latlng = new google.maps.LatLng(e.latLng.lat(), e.latLng.lng());
                var marker = new google.maps.Marker({
                    position: latlng,
                    icon: createMarkerStars(latlng),
                    id: nResNum + 1
                });
                
                google.maps.event.addListener(marker, "click", ajoutRestaurantInfoWindow);
                marker.setMap(map);
            });
        
            /*-----------------------------------------------------------------------------------
                Utilise les places api
            -------------------------------------------------------------------------------------*/
            places  = new google.maps.places.PlacesService(map);
            service = new google.maps.places.PlacesService(map);
            
            service.nearbySearch({
                location: pos,
                radius: 500,
                type: ['restaurant']
            }, nearbySearchCallbck);
        
        
        
        $("#form-add-restaurant").submit(function (e) {
            e.preventDefault();
            form.css("padding", "");
            var nom = $("#res-name");
            var address = $("#res-address");
            var telephone = $("#res-telephone");
            var website = $("#res-website");
            var rating = $("#res-rating");
            var locationLat = $("#res-location-lat");
            var locationLng = $("#res-location-lng");
            
            var position = new google.maps.LatLng(locationLat.val(), locationLng.val());
            
            if (nom.val().trim().length > 0 && address.val().trim().length > 0) {
                var place = {
                    name: nom.val(),
                    vicinity: address.val(),
                    website: website.val(),
                    url: website.val(),
                    formatted_phone_number: telephone.val(),
                    rating: rating.val(),
                    position: position,
                    geometry: {location: position},
                    icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png',
                    reviews: "",
                    photos: "",
            };
            
                /*-----------------------------------------------------------------------------------
                    Crée un tableau pour qu'il sache quel nouveau restaurant ouvrir lorsque vous en ajoutez plusieurs
                -------------------------------------------------------------------------------------*/
                nouveauPlace.push(place);
                masquerInfoWindowNouveauRest(marker);
                var marker = nouveauRestMarker[nResNum];
                restoEstNouveau = false;
                infoWindow.open(map, marker);
                creerIWContent(place);
                displayRestaurantInfo(place);
            } else {
                alert("Le champ nom du restaurant ou address ne doit pas comporter d'espaces vides !");
            }
       
        });
        
        
        /*-----------------------------------------------------------------------------------*/
        
        
        }, function (error) {
            var loadingElt = $("#loading");
            
            if (error.code === 0) {
                
                loadingElt.html("Une erreur inconnue est survenue.");
            } else if (error.code === 1) {
                
                loadingElt.html("L'utilisateur a refusé la demande de géolocalisation. Actualiser le navigateur et autoriser la géolocalisation.");
            } else if (error.code === 2) {
               
                loadingElt.html("Les informations de localisation sont indisponibles.");
            } else if (error.code === 3) {
    
                loadingElt.html("La demande d'obtention de l'emplacement de l'utilisateur a expiré.");
            }
        });      
   
            
    } else {
        handleLocationError(false, infoWindow, map.getCenter(pos));
    }     
}

/*-----------------------------------------------------------------------------------
Utilise la function AJAX pour avoir et convertir mon fichier Json 
-------------------------------------------------------------------------------------*/

function getJson (url) {  
    
    ajaxGet(url, function (reponse) {
        
        restaurants = JSON.parse(reponse);        
        //dispoMarqueurs(map);      
        //creerListeRestos (restaurants);         
    });
}


/*-----------------------------------------------------------------------------------
crée les étoiles pour le classement
-------------------------------------------------------------------------------------*/

function getEtoilesRating (elt, rating) {
    elt.empty();
    for (var i = 0; i < 5; i++) {
        if (rating <= (i + 0.25)) {
            elt.append('<i class="far fa-star star-rating-font-size"></i>');
        } else if (rating < (i + 0.75)) {
            elt.append('<i class="fas fa-star-half-alt star-rating-font-size"></i>');
        } 
        else {
             elt.append('<i class="fas fa-star star-rating-font-size"></i>');
        }
        
        elt.css("display", "");
    }
}

function resetFiltre() {
    
    toutesEtoiles = false;
    tri3Etoile = false;
    tri4Etoile = false;
    tri5Etoile = false;
}

/*-----------------------------------------------------------------------------------
Affiche ou masque le formulaire pour les critiques de restaurant
-------------------------------------------------------------------------------------*/
function afficheForm() {
    $("#form-wrapper").css("display", "block");
    $("#add-review-button").css("display", "block");
}

function masquerForm() {
    $("#form-wrapper").css("display", "none");
    $("#add-review-button").css("display", "none");
}

/*-----------------------------------------------------------------------------------
Fonctionnalité de formulaire lors de l'envoi ajoute une nouvelle critique à la première des critiques et sauvegarde dans un tableau
-------------------------------------------------------------------------------------*/
$("#add-review").submit(function (e) {
    e.preventDefault(); 
    var nouveauNom = $("#your-name");
    var nouveauRating = $("#your-rating");
    var nouveauAvis = $("#your-review");
    
    if (!(nouveauNom.val() && nouveauRating.val() && nouveauAvis.val())) {
        return;
    }
    
    if (nouveauNom.val().trim().length > 0 && nouveauAvis.val().trim().length > 0) {
        ajouterAvis(nouveauNom.val(), nouveauRating.val(), nouveauAvis.val());
        nouveauNom.val("");
        nouveauRating.val("");
        nouveauAvis.val("");
        masquerForm();
    } else {
        alert("Les champs ne doit pas comporter d'espaces vides !");
    }
    
    
});

function ajouterAvis (nouveauNom, nouveauRating, nouveauAvis) {
    var nouveauAvisDetails = {
        name: nouveauNom,
        rating: nouveauRating,
        review: nouveauAvis,
    };
    var avatar = 'img/avatar.png';
    var avisElt = $("#reviews");
    var nouveauAvisHTML = "";
    nouveauAvisHTML += '<div class="restaurant-reviews">' +
        '<h3 class="review-title">' +
        '<span class="profile-photo" style="background-image: url(' + avatar + ')"></span>' +
        '<span id="review-rating" class="rating">' + getEtoiles(nouveauAvisDetails) +'</span>' +
        '</h3>' +
        '<p>' + nouveauAvisDetails.review + '</p>' +
        '</div>';
    nouveauAvisArray.push(nouveauAvisDetails);
    avisElt.prepend(nouveauAvisHTML);
}

// Button actualiser

$("#actualiser-btn").on('click', function () {
    
    $(".filtre option:first").attr("selected", true);
    window.location.reload();   
    
});
