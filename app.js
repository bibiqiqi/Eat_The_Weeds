const iNAT_SEARCH_URL = 'https://www.inaturalist.org/observations';
const EDIBLES_JSON = 'http://localhost:8080/edibles.json';
let SCIENTIFIC_NAMES = [];
let USERS_ZIPCODE;
let LATLNG = {
  lat: '',
  lng: ''
}

//pass getUsersFilter (which returns 'plants' 'fungi' or 'both') as argument, into this function
//this function pushes the values of all the scientific names of the plants and or fungi that the user wants into the
//global array SCIENTIFIC_NAMES
function pushScientificNames(usersFilter) {
  $.getJSON(EDIBLES_JSON, function(data) {
      let obj = data.usersFilter;
      obj.forEach(function(item) {
  //iterate through each object
        for (var key in item) {
          if (item.hasOwnProperty(key)) {
  //create an array of all the scientific names from that json file
            SCIENTIFIC_NAMES.push(item.scientificName);
          }
        }
      });
      console.log(SCIENTIFIC_NAMES);
  });
}

//pass getUsersFilter (which returns 'plants' 'fungi' or 'both') as argument, into this function
//based on what getUsersFilter returns, this function either iterates through the whole json object, or only parts of it,
//and calls the pushScientificNames function to create an array of just the scientific names of those plants
function  iterateThroughEdibles(usersFilter) {
  $.getJSON(EDIBLES_JSON, function(data) {
//if user chooses no filter, then iterate through the whole json object first
    if (usersFilter == 'both') {
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
//THEN call the function that iterates through each array and pushes the scientific names to a new array
          pushScientificNames(usersFilter);
        }
      }
    }
//otherwise, just iterate through that specific array
    else {
      pushScientificNames(usersFilter);
    }
  });
}

//converts zipcode to Geo Coordinates and assigns those values to global object LATLNG
function zipToGeo() {
 geocoder.geocode( { 'address': USERS_ZIPCODE}, function(results, status) {
   if (status == google.maps.GeocoderStatus.OK) {
      LATLNG.lat = results[0].geometry.location.lat();
      LATLNG.lng = results[0].geometry.location.lng();
   } else {
     alert("Geocode was not successful for the following reason: " + status);
   }
 });
 alert('Latitude: ' + LATLNG.lat + ' Longitude: ' + LATLNG.lng);
}

//initializes a map, using the google maps API, thats centered at the geo coordinates of the user
function initializeMap() {
  let mapOptions = {
    zoom: 8,
    center: LATLNG
  }
  google.maps.Map(document.getElementById('js-map'), mapOptions);
}


//gets data from iNAT API
//need to pass zipToGeo(getUsersZipCode) function, SCIENTIFIC_NAMES array, and a callback function that turns the results into markers
//also, mappable=true, geo=true,
function getDataFromiNat(geoCoord, callback) {
  const query = {
    taxon_name : SCIENTIFIC_NAMES,
    lat: LATLNG.lat,
    lng: LATLNG.lng,
    radius: 16,
  };
  $.getJSON(iNAT_SEARCH_URL, query, callback);
}

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

//event listeners
function getUsersFilter () {
  $('.js-question-submit').off();
  $('#js-location-submit').on("click", function(event) {
    event.preventDefault();
    let usersFilter = $('.filter-results:checked').val();
    iterateThroughEdibles(usersFilter);
  });
 }

 function getUsersZipcode () {
 $('.js-question-submit').off();
 $('#js-location-submit').on("click", function(event) {
   event.preventDefault();
   let usersZipcode = $('#zipcode').val();
   //clear out the input
   usersLocal.zipcode = $('#zipcode').val("");
 });
 }

getUsersZipcode();
getUsersFilter();
