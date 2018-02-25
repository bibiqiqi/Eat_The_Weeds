const iNAT_SEARCH_URL = 'https://api.inaturalist.org/v1/observations';
const EDIBLES_JSON = 'http://localhost:8080/edibles.json';
let USER_INFO = {};
let LOCAL_JSON = {};
let INAT_QUERY = [];
let MAP;
let GEOCODER;
let MARKER;

function renderImageGrid(item, index) {
//generates html markup for the image grid that users can browse through.
//will repeat the code for one image by the number of images that exist in the json files
let imageHtml = `
        <div class="img-grid js-img" id="index" style="background-image: url(${item.image})"></div>
  `
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
  });
}

//function makeInatQuery() {
//  let data = LOCAL_JSON;
//  data.plants.forEach(function(item) {
//    INAT_QUERY.push(item.scientificName);
//  })
//}

function getEdibleInfo(item, marker) {
  if (item.scientificName == marker) {
    return (`${item.edibility} <br> <a href="${item.recipes.recipeName_url}">${item.recipes.recipeName}</a>`)
  }
}

//gets data from iNAT API
//initializes a map, using Google maps API, thats centered at the geo coordinates of the user
//sets the markers on the map
function iNatDataToMarkers() {
  const query = {
    taxon_name: "Guepinia helvelloides",
    //order: "desc",
    //order_by: "created_at"

    //taxon_name: INAT_QUERY,
    lat: USER_INFO.latLng.lat,
    lng: USER_INFO.latLng.lng,
    radius: 1,
    quality_grade: "research",
    mappable: true,
    geo: true
  };
  $.getJSON(iNAT_SEARCH_URL, query, function (data) {
  //$.getJSON("https://api.inaturalist.org/v1/observations?taxon_name=%22Guepinia%20helvelloides%22&order=desc&order_by=created_at", function (data) {
    //callback function for json request
    let results = data.results;
    console.log(results);
    //results.forEach(function(result) {
    //for each result item, create a marker at corresponding location
    //  MARKER = new google.maps.Marker({
    //    position: results.location,
    //    map: MAP
    //  });
    //and a corresponding info window
    //resultsArray.taxon.name
    //  let infoWindow = new google.maps.InfoWindow({
    //    content: `
    //      <h1>Scientific Name: ${results.taxon.name}</h1>
    //      <h2>Common Name: ${results.preferred_common_name}</h2>
    //      <p>${iterateThroughJson(getEdibleInfo(), results.taxon.name)}</p>
    //      `
    //  });
    });
  //});
}

//converts zipcode to Geo Coordinates and assigns those values to the property LatLng in the global object USER_INFO
//results is coming back undefined, for some reason
function addressToGeo() {
  USER_INFO.latLng = {};
  console.log (USER_INFO.userAddress);
  GEOCODER = new google.maps.Geocoder();
  GEOCODER.geocode( { 'address': USER_INFO.userAddress }, function(results, status) {
    if (status == 'OK') {
      USER_INFO.latLng.lat = results[0].geometry.location.lat();
      USER_INFO.latLng.lng = results[0].geometry.location.lng();
      MAP.setCenter(USER_INFO.latLng);
      //console.log(USER_INFO.latLng);
      ////debugger;
    } else {
     alert("Geocode was not successful for the following reason: " + status);
    }
    //debugger;
    //alert('Latitude: ' + USER_INFO.latLng.lat + ' Longitude: ' + USER_INFO.latLng.lng);
  });
}

function initMap() {
   MAP = new google.maps.Map(document.getElementById('js-map'), {
     center: {lat: 0, lng: 0},
     zoom: 1
   });
}

//event listeners

//when user hovers over an image, div with plant name appears above image
function hoverGetsInfo() {
  $('.js-img').hover(
    function() {
      console.log(this);
      debugger;
      let whichWeed = this.attr('id');
      console.log(whichWeed);
      console.log(this.parent);
      debugger;
      $(this.parent.append(`
        <div class="img-grid-hover">
          <h1>${LOCAL_JSON.plants[whichWeed].scientificName}</h1>
          <h2>${LOCAL_JSON.plants[whichWeed].commonName}</h2>
        </div>
        `));
    }, function() {
      $(this).remove('.img-grid-hover');
    }
  );
}

function doTheMainPage() {
  $('#js-enter').on("click", function(event) {
    $('#js-cover-page').addClass('hidden');
    $('#js-main-page').removeClass('hidden');
    $('#js-img-browse').removeClass('hidden');
    displayImageGrid();
    console.log('doTheMainPage ran')
    //hoverGetsInfo();
  });
}

function doTheMap() {
  $('#js-location-submit').on("click", function(event) {
    event.preventDefault();
    //get the value of the user's zipcode
    USER_INFO.userAddress = $('#address').val();
    //console.log(USER_INFO.userAddress);
    //debugger;
    //create an array of scientific names for user's chosen filter, and store as a property of global object USER_INFO,
    // that will be used as a search query for the iNat API
    makeInatQuery();
    //console.log(INAT_QUERY);
    //debugger;
    //convert the users zipCode to geo coordinates and store as a property of global object USER_INFO
    addressToGeo();
    //queries iNat api with the array of scientific names and the user's location, creates a map, and sets markers According
    //to the locations of the iNat observations that match the query
    //calls iterateThroughJson() and getEdibleInfo()
    iNatDataToMarkers();
  });

 }
//makes JSON request and stores data as local variable
makeLocalJson();
doTheMainPage();
