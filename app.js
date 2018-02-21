const iNAT_SEARCH_URL = 'https://www.inaturalist.org/observations';
const EDIBLES_JSON = 'http://localhost:8080/edibles.json';
let USER_INFO = {};
let LOCAL_JSON = {};
let INAT_QUERY = [];
let MAP;
let GEOCODER;
let MARKER;


//makes JSON request and stores the data in a local file
function makeLocalJson() {
  $.getJSON(EDIBLES_JSON, function(data) {
    LOCAL_JSON = data;
    console.log(LOCAL_JSON);
    debugger;
  });
}

//iterates through local JSON object and calls a function that's passed as argument
//makeInatQuery or getEdibleInfo will be passed as arguments, when called
function iterateThroughJson(doAthing, marker) {
  let data = LOCAL_JSON;
  let whichWeeds = USER_INFO.userFilter;
  debugger;
  console.log(whichWeeds);
//if user chooses no filter, iterate through both arrays in object
  if (whichWeeds == 'both') {
    data.plants.forEach(function(item) {
      doAthing(item);
    });
    data.fungi.forEach(function(item) {
      doAthing(item);
    });
  } else if (whichWeeds == 'plants') {
//otherwise, JUST iterate the corresponding array
    data.plants.forEach(function(item) {
      doAthing(item);
    });
  } else {
//otherwise, JUST iterate the corresponding array
    data.fungi.forEach(function(item) {
      doAthing(item);
    });
  }
}

function makeInatQuery(item) {
  INAT_QUERY.push(item.scientificName);
}

function getEdibleInfo(item, marker) {
  if (item.scientificName == marker) {
    return (`${item.edibility} <br> <a href="${item.recipes.recipeName_url}">${item.recipes.recipeName}</a>`)
  };
}

//gets data from iNAT API
//initializes a map, using Google maps API, thats centered at the geo coordinates of the user
//sets the markers on the map
function iNatDataToMarkers() {
  const query = {
    taxon_name : INAT_QUERY,
    lat: 32.748880,
    lng: -117.168068,
    //lat: USER_INFO.latLng.lat,
    //lng: USER_INFO.latLng.lng,
    radius: 10,
    mappable: true,
    geo: true
  };
  $.getJSON(iNAT_SEARCH_URL, query, function (data) {
    //callback function for json request
    let resultsArray = data.results;
    console.log(resultsArray);
    debugger;
    resultsArray.forEach(function(result) {
    //for each result item, create a marker at corresponding location
      MARKER = new google.maps.Marker({
        position: results.location,
        map: MAP
      });
    //and a corresponding info window
    //resultsArray.taxon.name
      let infoWindow = new google.maps.InfoWindow({
        content: `
          <h1>Scientific Name: ${results.taxon.name}</h1>
          <h2>Common Name: ${results.preferred_common_name}</h2>
          <p>${iterateThroughJson(getEdibleInfo(), results.taxon.name)}</p>
          `
      });
    });
  });
}

//converts zipcode to Geo Coordinates and assigns those values to the property LatLng in the global object USER_INFO
//results is coming back undefined, for some reason
function zipToGeo() {
  console.log (USER_INFO.userZipcode);
  debugger;
  GEOCODER = new google.maps.Geocoder();
  GEOCODER.geocode( { 'address': USER_INFO.userZipcode }, function(results, status) {
    if (status == 'OK') {
      MAP.setCenter(results[0].geometry.location);
      USER_INFO.latLng = results[0].geometry.location.latLng;
    } else {
     alert("Geocode was not successful for the following reason: " + status);
    }
  });
   debugger;
   alert('Latitude: ' + USER_INFO.latLng.lat + ' Longitude: ' + USER_INFO.latLng.lng);
}

function initMap() {
   MAP = new google.maps.Map(document.getElementById('js-map'), {
     center: {lat: 0, lng: 0},
     zoom: 1
   });
}

//event listeners
function doTheMap() {
  $('#js-location-submit').on("click", function(event) {
    event.preventDefault();
    //get the filter option user chooses (plants, fungi, or both)
    USER_INFO.userFilter = $('.filter-results:checked').val();
    //console.log(USER_INFO.userFilter);
    //debugger;
    //get the value of the user's zipcode
    USER_INFO.userZipcode = $('#zipcode').val();
    //console.log(USER_INFO.userZipcode);
    //debugger;
    //create an array of scientific names for user's chosen filter, and store as a property of global object USER_INFO,
    // that will be used as a search query for the iNat API
    iterateThroughJson(makeInatQuery);
    console.log(INAT_QUERY);
    debugger;
    //convert the users zipCode to geo coordinates and store as a property of global object USER_INFO
    //zipToGeo();
    //queries iNat api with the array of scientific names and the user's location, creates a map, and sets markers According
    //to the locations of the iNat observations that match the query
    //calls iterateThroughJson() and getEdibleInfo()
    iNatDataToMarkers();
  });

 }
//makes JSON request and stores data as local variable
makeLocalJson();
 //function generateImageGrid() {
 //generates html markup for the image grid that users can browse through.
 //will repeat the code for one image by the number of images that exist in the json files
 //  $('.js-image-grid').html(`
 //    <section class="image-browse" role="region">
 //      <div class="image-grid">
 //        <a href="path-to-the-image">
 //          <figure>
 //            <img src="path-to-the-image" alt="">
 //            <figcaption>plant name</figcaption>
 //          </figure>
 //        </a>
 //      </div>
 //    </section>
 //    `);
 //}
doTheMap();
