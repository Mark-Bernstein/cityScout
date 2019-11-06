//Global variables
var continentObject;
var chosenCountry;
var chosenCountryLink;
var chosenCountryId;
var currencyCode;
var cityChosen;
var currency;

//API call for currency exchange
var apiKEY = "9434dac94bff4079b3e8ae867f65cdda";

var queryURL = "https://openexchangerates.org/api/latest.json?app_id=" + apiKEY;
//Function renders the currency change using the U.S. dollar as the base and appends to last page
function renderCurrencyExchange(currencyCode) {
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    currency = response.rates[currencyCode];
    goToNextPage(cityChosen);
  });
}

function createElementsForCityPage(currency) {
  var currencyEl = $(
    "<p style='font-size:25px;font-family:candara,arial,helvetica;'>" +
      "U.S. Dollar exchange rate: " +
      currency +
      "</p>"
  );
  $("#currency-exchange").append(currencyEl);
}

//API call for continents
var teleportAPIkey = "";
var continentQueryURL = "https://api.teleport.org/api/continents/";

$.ajax({
  url: continentQueryURL,
  method: "GET"
}).then(function(response) {
});

// Ajax call to pull top 10 cities based on population by country Id
function getCityList(countryId) {
  var citySearchApi = {
    async: true,
    crossDomain: true,
    url:
      "https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=10&countryIds=" +
      countryId +
      "&sort=-population",
    method: "GET",
    headers: {
      "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
      "x-rapidapi-key": "6fa73b7e3dmsh2c5c461c7d26929p191785jsne3190cf9f4b1"
    }
  };
  $.ajax(citySearchApi).done(function(response) {
    var cityList = $("<div>");
    cityList.attr("aria-labelledby", "dropdownMenuButton");
    cityList.attr("class", "dropdown-menu");
    cityList.attr("id", "dropdown-menu-countries");
    for (var i = 0; i < response.data.length; i++) {
      var city = $("<a href='#'>" + response.data[i].city + "</a>");
      city.attr("class", "dropdown-item city-drop");
      city.attr("data-name", response.data[i].city);
      cityList.append(city);
    }
    var cities = "Cities";
    var cityBtn = dropDownBtn(cities);
    $("#city").append(cityBtn);
    $("#city").append(cityList);
  });
}
var continentsObj = {
  AF: "Africa",
  AN: "Antarctica",
  AS: "Asia",
  EU: "Europe",
  NA: "North America",
  OC: "Australia",
  SA: "South America"
};

function renderContinents() {
  var contArray = Object.values(continentsObj);
  var contKeys = Object.keys(continentsObj);
  var contList = $("<div>");
  contList.attr("aria-labelledby", "dropdownMenuButton");
  contList.attr("class", "dropdown-menu");

  for (var continentCode in continentsObj) {
    var cont = $("<a href='#'>" + continentsObj[continentCode] + "</a>");
    cont.attr("class", "dropdown-item continent-drop");
    cont.attr("data-contGeoName", continentCode);
    contList.append(cont);
  }
  $("#continent").append(contList);
}

//renders the continent drop down list
renderContinents();

//JQuery get variables
var startContainer = $("#start-container");
var dropDownContainer = $("#dropdown-container");

$(".start-btn").on("click", function() {
  startContainer.attr("style", "display:none");
  dropDownContainer.attr("style", "display:block");
});

var contInstructions = $("<h3>" + "Choose a continent: " + "</h3>");
contInstructions.attr("id", "instruc-1");
contInstructions.attr("style", "display:block");
$("#continent").prepend(contInstructions);

// saving continent user selected
var continentChosen;

$(".continent-drop").on("click", function() {
  continentChosen = $(this).attr("data-contgeoname");

  var countryUrl =
    "https://api.teleport.org/api/continents/geonames:" +
    continentChosen +
    "/countries/";

  $.ajax({
    url: countryUrl,
    method: "GET"
  }).then(function(countries) {
    continentObject = countries;
    var countryList = $("<div>");
    countryList.attr("aria-labelledby", "dropdownMenuButton");
    countryList.attr("class", "dropdown-menu");
    countryList.attr("id", "dropdown-menu-countries");
    for (var i = 0; i < countries.count; i++) {
      var country = $(
        "<a href='#'>" + countries._links["country:items"][i].name + "</a>"
      );
      country.attr("class", "dropdown-item country-drop");
      countryList.append(country);
    }
    var Countries = "Countries";
    var countryBtn = dropDownBtn(Countries);
    $("#country").append(countryBtn);
    $("#country").append(countryList);

    //Click event to grab text value when country button is clicked
    $(".country-drop").on("click", function() {
      chosenCountry = $(this).text();
      var countriesArray = continentObject._links["country:items"];
      for (var i = 0; i < countriesArray.length; i++) {
        if (countriesArray[i].name === chosenCountry) {
          chosenCountryLink = countriesArray[i].href;
        }
      }

      getCountryInfo(chosenCountryLink);

      //instructions when a country is chose
      $("#instruc-2").attr("style", "display:none");
      $("#dropdownMenuButton").attr("style", "display:none");
      $("#country").attr("style", "display:none");
      var cityInstructions = $("<h3>" + "Choose a city: " + "</h3>");
      cityInstructions.attr("id", "instruc-3");
      cityInstructions.attr("style", "display:block");
      $("#city").append(cityInstructions);
    });
  });

  $("#dropdown-container").on("click", ".city-drop", function() {
    $("#clearBtn").attr("style", "display:none");
    cityChosen = $(this).attr("data-name");
    renderCurrencyExchange(currencyCode);
  });

  // instructions when a continent is chosen
  $("#instruc-1").attr("style", "display:none");
  $("#dropdownMenuButton").attr("style", "display:none");
  var countryInstructions = $("<h3>" + "Choose a country: " + "</h3>");
  countryInstructions.attr("id", "instruc-2");
  countryInstructions.attr("style", "display:block");
  countryInstructions.attr("style", "text-align:left");
  $("#country").append(countryInstructions);
});

function getCountryInfo(chosenCountryLink) {
  $.ajax({
    url: chosenCountryLink,
    method: "GET"
  }).then(function(countryInfoResponse) {
    chosenCountryId = countryInfoResponse.iso_alpha2;
    currencyCode = countryInfoResponse.currency_code;
    getCityList(chosenCountryId);
  });
}

function dropDownBtn(name) {
  var dropBtn = $("<button>");
  dropBtn.attr("class", "btn btn-secondary dropdown-toggle");
  dropBtn.attr("type", "button");
  dropBtn.attr("id", "dropdownMenuButton");
  dropBtn.attr("data-toggle", "dropdown");
  dropBtn.attr("aria-haspopup", "true");
  dropBtn.attr("aria-expanded", "false");
  dropBtn.attr("style", "margin: 14px 0; padding: 0 60px");
  dropBtn.text(name);
  return dropBtn;
}

//Function for city-facts
function cityFacts() {
  cityChosen = cityChosen.toLowerCase();
  var citySearch = "https://api.teleport.org/api/cities/?search=" + cityChosen;

  $.ajax({
    url: citySearch,
    method: "GET"
  }).then(function(cityResponse) {
    var cityGeoId =
      cityResponse._embedded["city:search-results"][0]._links["city:item"].href;

    var cityFactsURL = cityGeoId;

    $.ajax({
      url: cityFactsURL,
      method: "GET"
    }).then(function(cityFactsResponse) {
      var cityPopulation = cityFactsResponse["population"];
      var cityPopulationEl = $(
        "<p style=font-size:25px;font-family:candara,arial,helvetica;>" +
          "Population: " +
          cityPopulation +
          "</p>"
      );
      $("#population").append(cityPopulationEl);
    });
  });
}

function goToNextPage(cityChosen) {
  $("#dropdown-container").attr("style", "display:none");

  cityChosen = cityChosen.toLowerCase();

  var scoresUrl =
    "https://api.teleport.org/api/urban_areas/slug:" + cityChosen + "/scores/";
  var imgUrl =
    "https://api.teleport.org/api/urban_areas/slug:" + cityChosen + "/images/";

  var cityName = $("<h2>" + cityChosen + "</h2>");
  cityName.attr("class", "header");
  cityName.attr(
    "style",
    "display:flex; justify-content:center; background-color:cyan;"
  );
  var cardHorizontal = $("<div>");
  cardHorizontal.attr("class", "card horizontal");
  cardHorizontal.attr("style", "display:flex; flex-direction:row");
  var imgDiv = $("<div>");
  imgDiv.attr("class", "card-image");
  var img = $("<img>");

  $.ajax({
    url: imgUrl,
    method: "GET"
  }).then(function(response) {

    img.attr("src", response.photos[0].image.web);
    imgDiv.append(img);
    cardHorizontal.append(imgDiv);
    $("#city-intro").append(cityName);
    $("#city-intro").append(cardHorizontal);
  });

  var cardSummary = $("<div>");
  cardSummary.attr("class", "card-stacked");

  var cardContent = $("<div>");
  cardContent.attr("class", "card-content");

  $.ajax({
    url: scoresUrl,
    method: "GET"
  }).then(function(response) {
    cardContent.append(response.summary);
    cardSummary.append(cardContent);
    cardHorizontal.append(cardSummary);

    // creating the quality of life stats bars
    var housing = $(
      "<p>" + response.categories[0].name + "</p>"
    );
    housing.attr("style", "background-color:white;");

    var housingDiv = $("<div>");
    housingDiv.attr("class", "score-container");

    var housingScoreDiv = $("<div>");
    housingScoreDiv.attr("class", "stats");

    var housingScore = response.categories[0].score_out_of_10;
    housingScore = Math.round(housingScore);
    housingScoreDiv.text(housingScore + "/10");
    housingScoreDiv.attr(
      "style",
      "width:" + housingScore * 10 + "%; background-color:red"
    );

    var costOfLiving = $(
      "<p>" + response.categories[1].name + "</p>"
    );
    costOfLiving.attr("style", "background-color:white;");

    var costOfLivingDiv = $("<div>");
    costOfLivingDiv.attr("class", "score-container");

    var costOfLivingScoreDiv = $("<div>");
    costOfLivingScoreDiv.attr("class", "stats");

    var costOfLivingScore = response.categories[1].score_out_of_10;
    costOfLivingScore = Math.round(costOfLivingScore);
    costOfLivingScoreDiv.text(costOfLivingScore + "/10");
    costOfLivingScoreDiv.attr(
      "style",
      "width:" + costOfLivingScore * 10 + "%; background-color:red"
    );

    var commute = $(
      "<p>" + response.categories[5].name + "</p>"
    );
    commute.attr("style", "background-color:white;");
    var commuteDiv = $("<div>");
    commuteDiv.attr("class", "score-container");

    var commuteScoreDiv = $("<div>");
    commuteScoreDiv.attr("class", "stats");

    var commuteScore = response.categories[5].score_out_of_10;
    commuteScore = Math.round(commuteScore);
    commuteScoreDiv.text(commuteScore + "/10");
    commuteScoreDiv.attr(
      "style",
      "width:" + commuteScore * 10 + "%; background-color:red"
    );

    var safety = $(
      "<p>" + response.categories[7].name + "</p>"
    );
    safety.attr("style", "background-color:white;");
    var safetyDiv = $("<div>");
    safetyDiv.attr("class", "score-container");

    var safetyScoreDiv = $("<div>");
    safetyScoreDiv.attr("class", "stats");

    var safetyScore = response.categories[7].score_out_of_10;
    safetyScore = Math.round(safetyScore);
    safetyScoreDiv.text(safetyScore + "/10");
    safetyScoreDiv.attr(
      "style",
      "width:" + safetyScore * 10 + "%; background-color:red"
    );

    var healthcare = $(
      "<p>" + response.categories[8].name + "</p>"
    );
    healthcare.attr("style", "background-color:white;");
    var healthcareDiv = $("<div>");
    healthcareDiv.attr("class", "score-container");

    var healthcareScoreDiv = $("<div>");
    healthcareScoreDiv.attr("class", "stats");

    var healthcareScore = response.categories[8].score_out_of_10;
    healthcareScore = Math.round(healthcareScore);
    healthcareScoreDiv.text(healthcareScore + "/10");
    healthcareScoreDiv.attr(
      "style",
      "width:" + healthcareScore * 10 + "%; background-color:red"
    );

    var education = $(
      "<p>" + response.categories[9].name + "</p>"
    );
    education.attr("style", "background-color:white;");

    var educationDiv = $("<div>");
    educationDiv.attr("class", "score-container");

    var educationScoreDiv = $("<div>");
    educationScoreDiv.attr("class", "stats");

    var educationScore = response.categories[9].score_out_of_10;
    educationScore = Math.round(educationScore);
    educationScoreDiv.text(educationScore + "/10");
    educationScoreDiv.attr(
      "style",
      "width:" + educationScore * 10 + "%; background-color:red"
    );

    var internetAccess = $(
      "<p>" + response.categories[13].name + "</p>"
    );
    internetAccess.attr("style", "background-color:white;");
    var internetAccessDiv = $("<div>");
    internetAccessDiv.attr("class", "score-container");

    var internetAccessScoreDiv = $("<div>");
    internetAccessScoreDiv.attr("class", "stats");

    var internetAccessScore = response.categories[13].score_out_of_10;
    internetAccessScore = Math.round(internetAccessScore);
    internetAccessScoreDiv.text(internetAccessScore + "/10");
    internetAccessScoreDiv.attr(
      "style",
      "width:" + internetAccessScore * 10 + "%; background-color:red"
    );

    var outdoors = $(
      "<p>" + response.categories[16].name + "</p>"
    );
    outdoors.attr("style", "background-color:white;");
    var outdoorsDiv = $("<div>");
    outdoorsDiv.attr("class", "score-container");

    var outdoorsScoreDiv = $("<div>");
    outdoorsScoreDiv.attr("class", "stats");

    var outdoorsScore = response.categories[16].score_out_of_10;
    outdoorsScore = Math.round(outdoorsScore);
    outdoorsScoreDiv.text(outdoorsScore + "/10");
    outdoorsScoreDiv.attr(
      "style",
      "width:" + outdoorsScore * 10 + "%; background-color:red"
    );

    $("#city-qualities").append(
      "The following quality of life data is aggragated by " +
        "<a href='https://developers.teleport.org/api/'>" +
        "Teleport" +
        "</a>" +
        ":"
    );
    $("#city-qualities").append("<hr>" + "</hr>");

    housingDiv.append(housing);
    housingDiv.append(housingScoreDiv);
    $("#city-qualities").append(housingDiv);

    costOfLivingDiv.append(costOfLiving);
    costOfLivingDiv.append(costOfLivingScoreDiv);
    $("#city-qualities").append(costOfLivingDiv);

    commuteDiv.append(commute);
    commuteDiv.append(commuteScoreDiv);
    $("#city-qualities").append(commuteDiv);

    safetyDiv.append(safety);
    safetyDiv.append(safetyScoreDiv);
    $("#city-qualities").append(safetyDiv);

    healthcareDiv.append(healthcare);
    healthcareDiv.append(healthcareScoreDiv);
    $("#city-qualities").append(healthcareDiv);

    educationDiv.append(education);
    educationDiv.append(educationScoreDiv);
    $("#city-qualities").append(educationDiv);

    internetAccessDiv.append(internetAccess);
    internetAccessDiv.append(internetAccessScoreDiv);
    $("#city-qualities").append(internetAccessDiv);

    outdoorsDiv.append(outdoors);
    outdoorsDiv.append(outdoorsScoreDiv);
    $("#city-qualities").append(outdoorsDiv);

    //creates start new search button the starts the user from the beginning again
    var startNewSearch = $("<button>");
    startNewSearch.attr("class", "btn btn-secondary");
    startNewSearch.attr("type", "button");
    startNewSearch.attr("id", "newSearch");
    startNewSearch.text("Start New Search");
    $("#nav-btn").append(startNewSearch);

    //reloads to beginning page
    $("#newSearch").click(function() {
      location.reload(true);
    });

    createElementsForCityPage(currency);
    cityFacts();
  });
}