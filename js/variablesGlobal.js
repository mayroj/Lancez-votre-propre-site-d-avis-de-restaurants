/*---------------------------------------------------------------------------------------
    Init Map
---------------------------------------------------------------------------------------*/
var map;
var infoWindow;
var infoWindowPetite;
var infoWindowNouveauRest;
var markers = [];
var pos = {
    lat: 48.8587741,
    lng: 2.2069771,
};
var places;
var services;

/*---------------------------------------------------------------------------------------
    Apis et Restaurants
---------------------------------------------------------------------------------------*/
var autocomplete;
var mesRestaurants = [];
var restaurantsFiltres = [];
var googleRestaurants = [];
var nouveauPlace = [];
var avoirPhoto = true;
var hostnameRegexp = new RegExp('^https?://.+?/');

/*---------------------------------------------------------------------------------------
    Selection par clasification des restaurants
---------------------------------------------------------------------------------------*/
var trierPar = document.getElementById("filtre");
var minStar = $('#min-star');
var maxStar = $('#max-star');
var filterBtn = $('#filter-btn'); 
var toutesEtoiles = false;
var tri3Etoile = false;
var tri4Etoile = false;
var tri5Etoile = false;

/*---------------------------------------------------------------------------------------
    Ajout nouveau restaurants et avis 
---------------------------------------------------------------------------------------*/
var restoEstNouveau = true;
var nResNum = -1;
var form = $("#form-add-restaurant");
var nouveauRestMarker = [];
var nouvelAvisArray = [];
var nouveauAvisArray = [];

/*---------------------------------------------------------------------------------------
    Selection et styles 
---------------------------------------------------------------------------------------*/
var restaurantInfoElt = $("#restaurant-info");
var rechercheElt = $("#recherche");
var filtreOptionsElt = $("#filtre-options");
restaurantInfoElt.css("display", "none");
rechercheElt.css("display", "none");
filtreOptionsElt.css("display", "none");


