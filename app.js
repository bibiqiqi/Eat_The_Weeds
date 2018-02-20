const iNAT_SEARCH_URL = 'https://www.inaturalist.org/observations';
const EDIBLES_JSON = 'http://localhost:8080/edibles.json';

let MY_LIB = {};

//function iterates through the json file of edible plants and fungi
//a callback function (pushScientificNames or getEdibleInfo) is passed as argument
function  iterateThroughJson(callback) {
  $.getJSON(EDIBLES_JSON, function(data) {
    let obj = data[MY_LIB.usersFilter];
//if user chooses no filter,
    if (MY_LIB.usersFilter == 'both') {
//then iterate through the whole json object, first
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
//THEN iterate through each item in that array
          obj.forEach(function(item) {
//and each property in that object
            for (var key in item) {
              if (item.hasOwnProperty(key)) {
                callback();
                console.log(callback());
              }
            }
          });
        }
      }
//otherwise, just iterate through that specific array and call the callback functiona
  } else {
//JUST iterate through each item in that array
      obj.forEach(function(item) {
//and each property in that object
        for (var key in item) {
          if (item.hasOwnProperty(key)) {
            callback();
            console.log(callback());
          }
        }
      });
    }
  });
}
//passing the result item's scientific name into this function,
//it returns info about edibility, pulled from edibles.json
function getEdibilInfo(itemScientificName, dataObj) {
  let usersFilter = MY_LIB.usersFilter;
  if (dataObj.usersFilter.scientificName == itemScientificName) {
    return (`${dataObj.usersFilter.edibility} </br> Recipe: <a href="${dataObj.usersFilter.recipes.recipeName_url}">${dataObj.usersFilter.recipes.recipeName}</a>`);
  }
}

//this function creates an array that's a property within my global object MY_LIB
//then pushes the values of all the scientific names of the plants and or fungi that the user wants into the array
function pushScientificNames() {
  MY_LIB.scientificNames = [];
  MY_LIB.scientificNames.push(item.scientificName);
}

//gets data from iNAT API
//initializes a map, using Google maps API, thats centered at the geo coordinates of the user
//sets the markers on the map
function iNatDataToMarkers() {
  const query = {
    taxon_name : MY_LIB.scientificNames,
    lat: MY_LIB.latLng.lat,
    lng: MY_LIB.latLng.lng,
    radius: 16,
    mappable: true,
    geo: true
  };
  $.getJSON(iNAT_SEARCH_URL, query, function (data) {
    //callback function for json request
    let resultsArray = data.results;
    results.forEach(function(result) {
    //for each result item, create a marker at corresponding location
      let marker = new google.maps.Marker({
        position: results.location,
        map: map
      });
    //and a corresponding info window
    //resultsArray.taxon.name
      let infoWindow = new google.maps.InfoWindow({
        content: `
          <h1>Scientific Name: ${results.taxon.name}</h1>
          <h2>Common Name: ${results.preferred_common_name}</h2>
          <p>${iterateThroughJson(getEdibleInfo(results.taxon.name, data))}</p>
          `
      });
    });
  });
}

//converts zipcode to Geo Coordinates and assigns those values to the property LatLng in the global object MY_LIB
function zipToGeo() {
  MY_LIB.latLng = {};
  let geocoder = new google.maps.Geocoder();
  geocoder.geocode( { 'address': MY_LIB.usersZipcode }, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      MY_LIB.latLng.lat = results[0].geometry.location.lat();
      MY_LIB.latLng.lng = results[0].geometry.location.lng();
    } else {
     alert("Geocode was not successful for the following reason: " + status);
    }
  });
   alert('Latitude: ' + MY_LIB.latLng.lat + ' Longitude: ' + MY_LIB.latLng.lng);
}

function initMap() {
  let options = {
    zoom: 5,
    center:MY_LIB.latLng
  }
  let map = new google.maps.Map(document.getElementById('js-map'), options);
}

//event listeners
function doTheMap() {
  $('#js-location-submit').on("click", function(event) {
    event.preventDefault();
    //get the filter option user chooses (plants, fungi, or both)
    MY_LIB.usersFilter = $('.filter-results:checked').val();
    //alert(MY_LIB.usersFilter);
    //create an array of scientific names for user's chosen filter, and store as a property of global object MY_LIB,
    // that will be used as a search query for the iNat API
    iterateThroughJson(pushScientificNames());
    //get the value of the user's zipcode for generating the map
    MY_LIB.usersZipcode = $('#zipcode').val();
    //alert(MY_LIB.usersZipcode);
    //convert the users zipCode to geo coordinates and store as a property of global object MY_LIB
    zipToGeo();
    //queries iNat api with the array of scientific names and the user's location, creates a map, and sets markers According
    //to the locations of the iNat observations that match the query
    //calls iterateThroughJson() and getEdibleInfo()
    iNatDataToMarkers();
  });

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

doTheMap();
