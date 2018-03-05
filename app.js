const iNAT_SEARCH_URL = 'https://api.inaturalist.org/v1/observations';
const EDIBLES_JSON = 'http://localhost:8080/edibles.json';
let LOCAL_JSON = {};
let INAT_QUERY = [];
let MAP;
let GEOCODER;
let MARKER;
let USER_INFO = {};
let BOUNDS;

function renderImageGrid(item, index) {
//generates html markup for the image grid that users can browse through.
//will repeat the code for one image by the number of images that exist in the json files
  let imageHtml = `
    <figure id="figure-${index}" class="figures">
      <div class="img-grid js-img" style="background-image: url(${item.image})"></div>
      <div class="img-grid-hover hidden">
        <br><br><br><br>
        <h1>${LOCAL_JSON.plants[index].commonName}</h1>
        <h2>(${LOCAL_JSON.plants[index].scientificName})</h2>
      </div>
    </figure>
    `
  console.log('renderImageGrid ran');
  return (imageHtml);
}

function displayImageGrid() {
  let imageGrid = LOCAL_JSON.plants.map((item, index) => renderImageGrid(item, index));
    $('#js-img-contain').html(imageGrid);
  console.log('displayImageGrid ran');
}

//makes JSON request and stores the data in a local file
function makeLocalJson() {
  $.getJSON(EDIBLES_JSON, function(data) {
    LOCAL_JSON = data;
    console.log(LOCAL_JSON);
  });
}

//function makeInatQuery() {
//  let array = LOCAL_JSON.plants;
//  console.log(array);
//  array.forEach(function(item) {
//    INAT_QUERY.push(item.scientificName);
//  })
//  console.log('makeInatQuery ran');
//}

function renderPlantSummary() {
  let item =  LOCAL_JSON.plants[USER_INFO.choice];
  console.log(item);
  let plantSumHtml = `
    <h1>${item.commonName}</h1>
    <h2>(${item.scientificName})</h2>
    <div class="main" role="main">
      <img src="${item.image}" alt="${item.scientificName}">
      <ul>
        <li>${item.edibleParts}</li>
        <li>Recipe: <a href="${item.recipes[0].recipeName_url}">${item.recipes[0].recipeName}</a></li>
      </ul>
    </div>
    `
  console.log('renderPlantSummary ran');
  return (plantSumHtml);
}

//gets data from iNAT API
//sets the markers on the map
function iNatDataToMarkers() {
  let taxonName = LOCAL_JSON.plants[USER_INFO.choice].scientificName;
  console.log (taxonName);
  let lat = USER_INFO.geo.lat;
  let lng = USER_INFO.geo.lng;
  console.log(lat, lng);
  const query = {
    taxon_name: taxonName,
    lat: lat,
    lng: lng,
    radius: "100",
    mappable: true,
    geo: true,
  };
  $.getJSON(iNAT_SEARCH_URL, query, function (data) {
    let results = data.results;
    console.log (results);
    BOUNDS = new google.maps.LatLngBounds();
    let markerGeo = {};
    results.forEach(function(result) {
      markerGeo.lat = parseFloat(result.geojson.coordinates[1]);
      markerGeo.lng = parseFloat(result.geojson.coordinates[0]);
    //for each result item, create a marker at corresponding location
      MARKER = new google.maps.Marker({
        position: markerGeo,
        map: MAP
      });
      let loc = new google.maps.LatLng(markerGeo.lat, markerGeo.lng);
      BOUNDS.extend(loc);
    });
    // auto-zoom
    MAP.fitBounds(BOUNDS);
    //auto-center
    MAP.panToBounds(BOUNDS);
    $('#js-map').removeClass('hidden');
  });
  console.log('iNatDataToMarkers ran');
}

//converts zipcode to Geo Coordinates and assigns those values to the property geo in the global object USER_INFO
//results is coming back undefined, for some reason
function addressToGeo() {
  USER_INFO.geo = {};
  console.log (USER_INFO.address);
  GEOCODER = new google.maps.Geocoder();
  GEOCODER.geocode( { 'address': USER_INFO.address }, function(results, status) {
    if (status == 'OK') {
      USER_INFO.geo.lat = results[0].geometry.location.lat();
      USER_INFO.geo.lng = results[0].geometry.location.lng();
      MAP.setCenter(USER_INFO.geo);
      //console.log(USER_INFO.geo);
      ////debugger;
    } else {
    // alert("Geocode was not successful for the following reason: " + status);
    }
    //alert('Latitude: ' + USER_INFO.geo.lat + ' Longitude: ' + USER_INFO.geo.lng);
    iNatDataToMarkers();
  });
  console.log('addressToGeo ran');
}

function initMap() {
   MAP = new google.maps.Map(document.getElementById('js-map'), {
     center: {lat: 0, lng: 0},
     zoom: 1
   });
   console.log('initMap ran');
}

//event listeners

//when user hovers over an image, div with plant name appears above image
function hoverShowsName() {
  $('.figures').hover(function(event) {
    //let index = $(this).attr('id');
    //console.log(index);
    //debugger;
    //let figureId = $(event.currentTarget).attr('id');
    $(this).find('.img-grid-hover').removeClass('hidden');
    //$(`#js-img-grid-hover-${index}`).removeClass('hidden');
  }, function() {
    //let index = $(this).attr('id');
    $(this).find('.img-grid-hover').addClass('hidden');
    //$(`#js-img-grid-hover-${index}`).addClass('hidden');
  });
  console.log('hoverShowsName ran');
}

function searchAgain() {
  $('#js-search-again').on("click", function(event) {
    //Clear out the user info
    Object.keys(USER_INFO).forEach(function (prop) {
      delete USER_INFO[prop];
      });
    $('#js-results').addClass('hidden');
    $('#js-img-browse').removeClass('hidden');
    displayImageGrid();
    hoverShowsName();
    resultsPage();
    console.log('searchAgain ran');
  });
}

function doTheMainPage() {
  $('#js-enter').on("click", function(event) {
    //makeInatQuery();
    $('#js-cover-page').addClass('hidden');
    $('#js-main-page').removeClass('hidden');
    $('#js-img-browse').removeClass('hidden');
    displayImageGrid();
    hoverShowsName();
    resultsPage();
    console.log('doTheMainPage ran');
  });
}

function resultsPage() {
  $('.figures').on("click", function(event) {
    let figureId = $(this).attr('id');
    let indexString = figureId.slice(7, figureId.length);
    let index = Number(indexString);
    USER_INFO.choice = index;
    $('#js-main-page').addClass('hidden');
    $('#js-img-browse').addClass('hidden');
    $('#js-plant-info').html(renderPlantSummary());
    $('#js-results').removeClass('hidden');
    doTheMap();
    searchAgain();
    console.log('resultsPage ran');
  });
}

//call doTheMap with iNatDataToMarkers() as the callback function
function doTheMap() {
  $('#js-location-submit').on("click", function(event) {
    event.preventDefault();
    //get the value of the user's address
    $('#js-form').addClass('hidden');
    USER_INFO.address = $('#address').val();
    addressToGeo();
    console.log('doTheMap ran');
  });
 }
//makes JSON request and stores data as local variable
makeLocalJson();
doTheMainPage();
