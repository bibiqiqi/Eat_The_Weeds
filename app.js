const iNAT_SEARCH_URL = 'https://api.inaturalist.org/v1/observations';
const EDIBLES_JSON = 'edibles.json'
let LOCAL_JSON = {};
let INAT_QUERY = [];
let MAP;
let GEOCODER;
let MARKER;
let USER_INFO = {};
let BOUNDS;

// intitializes results map
function initMap() {
   MAP = new google.maps.Map(document.getElementById('map'), {
     center: {lat: 0, lng: 0},
     zoom: 1
   });
}

// makes JSON request and stores the data in a local file
function makeLocalJson(callback) {
  $.getJSON(EDIBLES_JSON, function(data) {
    LOCAL_JSON = data;
    callback();
  });
}

// generates html markup for the image grid that users can browse through
function renderImageGrid(item, index) {
  let imageHtml = `
    <figure id="figure-${index}" class="figures">
      <div class="img-grid" style="background-image: url(${item.image})"></div>
      <div class="img-hover hidden">
        <h1>${LOCAL_JSON.plants[index].commonName}</h1>
        <h2>(${LOCAL_JSON.plants[index].scientificName})</h2>
      </div>
    </figure>
    `
  return (imageHtml);
}

function displayImageGrid() {
  let imageGrid = LOCAL_JSON.plants.map((item, index) => renderImageGrid(item, index));
    $('#grid').html(imageGrid);
}

//function makeInatQuery() {
//  let array = LOCAL_JSON.plants;
//  console.log(array);
//  array.forEach(function(item) {
//    INAT_QUERY.push(item.scientificName);
//  })
//  console.log('makeInatQuery ran');
//}

// generates html markup for the chosen edible weed specimen
function renderPlantSummary() {
  let item =  LOCAL_JSON.plants[USER_INFO.choice];
  if (item.recipes[0].recipeName == undefined) {
    let plantSumHtml = `
      <header>
        <h1>${item.commonName}</h1>
        <h2> (${item.scientificName})</h2>
      </header>
      <main role="main">
        <img src="${item.image}" alt="${item.scientificName}">
          <p>${item.edibleParts}</p>
          <button class="search-again">pick new weed</button>
        </ul>
      </main>
      `
    return (plantSumHtml);
  }
  else {
    let plantSumHtml = `
      <header>
        <h1>${item.commonName}</h1>
        <h2> (${item.scientificName})</h2>
      </header>
      <main role="main">
        <img src="${item.image}" alt="${item.scientificName}">
          <p>${item.edibleParts}</p>
          <p>Recipe: <a href="${item.recipes[0].recipeName_url}">${item.recipes[0].recipeName}</a></p>
          <button class="search-again">pick new weed</button>
        </ul>
      </main>
      `
    return (plantSumHtml);
  }
}

//converts address to Geo Coordinates and assigns those values to the property geo
//in USER_INFO
function addressToGeo() {
  USER_INFO.geo = {};
  GEOCODER = new google.maps.Geocoder();
  GEOCODER.geocode( { 'address': USER_INFO.address }, function(results, status) {
    if (status == 'OK') {
      USER_INFO.geo.lat = results[0].geometry.location.lat();
      USER_INFO.geo.lng = results[0].geometry.location.lng();
      MAP.setCenter(USER_INFO.geo);
    } else {
    }
    getInatData();
  });
}

function noResults() {
  $('#plant-info').addClass('hidden');
  $('form').addClass('hidden');
  $('#map').addClass('hidden');
  $('#no-results').removeClass('hidden');
  noResultsSearch();
}

function revealMap() {
  $('#map').removeClass('hidden');
  $('.search-again').removeClass('hidden');
  MAP.fitBounds(BOUNDS);
  MAP.panToBounds(BOUNDS);
}

// makes request to iNAT API, sets the markers on the map, and zooms into map
function getInatData() {
  let taxonName = LOCAL_JSON.plants[USER_INFO.choice].scientificName;
  let lat = USER_INFO.geo.lat;
  let lng = USER_INFO.geo.lng;
  const query = {
    taxon_name: taxonName,
    lat: lat,
    lng: lng,
    radius: "100",
    mappable: true,
    geo: true,
  };
  $.getJSON(iNAT_SEARCH_URL, query, setMarkers);
}

function setMarkers(data) {
  let results = data.results;
  if (results.length == 0) {
  noResults();
  }
  else {
    BOUNDS = new google.maps.LatLngBounds();
    let markerGeo = {};
    results.forEach(function(result) {
      markerGeo.lat = parseFloat(result.geojson.coordinates[1]);
      markerGeo.lng = parseFloat(result.geojson.coordinates[0]);
      MARKER = new google.maps.Marker({
        position: markerGeo,
        map: MAP
      });
      let loc = new google.maps.LatLng(markerGeo.lat, markerGeo.lng);
      BOUNDS.extend(loc);
    });
    revealMap();
  }
}

// event listeners

// listens for user to select enter button on first page
function doTheMainPage() {
  $('#enter').on("click", function(event) {
    $('#cover-page').addClass('hidden');
    $('#main-page').removeClass('hidden');
    $('#img-browse').removeClass('hidden');
    displayImageGrid();
    hoverShowsName();
    resultsPage();
  });
}

// listens for user to hover over image in img grid to display plant name
function hoverShowsName() {
  $('.figures').hover(function(event) {
    $(this).find('.img-hover').removeClass('hidden');
  }, function() {
    $(this).find('.img-hover').addClass('hidden');
  });
}

// listens for user to select one of the plant images to display results page
function resultsPage() {
  $('.figures').on("click", function(event) {
    let figureId = $(this).attr('id');
    let index = Number(figureId.slice(7, figureId.length));
    USER_INFO.choice = index;
    $('#main-page').addClass('hidden');
    $('#img-browse').addClass('hidden');
    $('#plant-info').html(renderPlantSummary());
    $('#results-page').removeClass('hidden');
    doTheMap();
    searchAgain();
  });
}

//listens for user to submit address to initiate chain of function for displaying markers
function doTheMap() {
  $('#location-submit').on("click", function(event) {
    event.preventDefault();
    //get the value of the user's address
    $('form').addClass('hidden');
    USER_INFO.address = $('#address').val();
    addressToGeo();
  });
 }

// listens for user to select search-again button after receiving "no results" for a search
function noResultsSearch() {
  $('.search-again').on("click", function(event) {
    $('#no-results').addClass('hidden');
    $('#img-browse').removeClass('hidden');
    displayImageGrid();
    hoverShowsName();
    $('#plant-info').removeClass('hidden');
    $('form').removeClass('hidden');
    resultsPage();

  });
}

// listens for user to select search-again button on results page
function searchAgain() {
  $('.search-again').on("click", function(event) {
    //Clear out the user info
    Object.keys(USER_INFO).forEach(function (prop) {
      delete USER_INFO[prop];
      });
    $('#results-page').addClass('hidden');
    $('#img-browse').removeClass('hidden');
    displayImageGrid();
    hoverShowsName();
    $('#map').addClass('hidden');
    $('form').removeClass('hidden');
    resultsPage();
  });
}
//makes JSON request and stores data as local variable
makeLocalJson(function() {
  doTheMainPage();
});
