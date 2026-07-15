const searchButton = document.querySelector(".search-btn");
const cityInput = document.querySelector(".city-input");
const LocationButton = document.querySelector(".location-btn");

const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const metarReportDiv = document.querySelector(".metar-report");

const explainButton = document.querySelector(".explain-btn");
const summaryDiv = document.querySelector(".weather-summary");

let currentWeatherData = null;


const showToast = (message) => { 

    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: { background: "linear-gradient(to right, #49b000, #c9653d)" },
    }).showToast();
};


// wind directions / degrees to compass direction
const getWindDirection = (deg) => { 

    const points = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return points[Math.round(deg / 45) % 8];
};


const createWeatherCard = (cityName, weatherItem, index) => { 

    if (index === 0) { // for main current weather card

        // using actual value for weather and converting F to C and m/s to km/hr
        return `<div class="details"> 

                    <h2>${cityName} [${weatherItem.dt_txt.split(" ")[0]}]</h2>
                    <h4><b>TEMPERATURE: </b> ${(weatherItem.main.temp - 273.15).toFixed(2)} °C</h4>
                    <h4><b>FEELS LIKE: </b> ${(weatherItem.main.feels_like - 273.15).toFixed(2)} °C</h4>
                    <h4><b>WIND: </b> ${(weatherItem.wind.speed * 3600 / 1000).toFixed(2)} km/h at ${getWindDirection(weatherItem.wind.deg)}</h4>
                    <h4><b>PRECIPITATION: </b> ${(weatherItem.pop * 100).toFixed(0)} % </h4>
                    <h4><b>HUMIDITY: </b> ${weatherItem.main.humidity} %</h4> 
                    <h4><b>VISIBILITY: </b> ${(weatherItem.visibility / 1000).toFixed(1)} km </h4>
                </div>

                <div class="icon">

                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h4> ${weatherItem.weather[0].description} </h4>

                </div>`;

    } else { // for 5 day forecast cards

        // using actual value for weather and converting F to C and m/s to km/hr
        return `<li class="card">
        
                    <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h4><b>Min / Max: </b> ${(weatherItem.main.temp_min - 273.15).toFixed(1)} / ${(weatherItem.main.temp_max - 273.15).toFixed(1)} °C</h4>
                    <h4><b>Wind: </b> ${(weatherItem.wind.speed * 3600 / 1000).toFixed(2)} km/h</h4>
                    <h4><b>Humidity</b>: ${weatherItem.main.humidity} %</h4>
                    <h4><b>Precipitation: </b>${(weatherItem.pop * 100).toFixed(0)} %</h4>
    
                </li>`;
    }

}

const getWeatherDetails = (cityName, lat, lon) => {

    const WEATHER_API_URL = `/api/forecast?lat=${lat}&lon=${lon}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => { 


        const uniqueForecastDays = [];

        const fiveDaysForecast = data.list.filter(forecast => {

            const forecastDate = new Date(forecast.dt_txt).getDate();

            if(!uniqueForecastDays.includes(forecastDate)) {

                return uniqueForecastDays.push(forecastDate);
            }
        });


        // rm old placeholder cards
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";


        // new weather cards and then adding them to DOM
        fiveDaysForecast.forEach((weatherItem, index) => {

            // organized and formatted the card data for AI to get proper notation for AI fetching
            if (index === 0) {

                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));

                currentWeatherData = { 

                    city: cityName,
                    date: weatherItem.dt_txt.split(" ")[0],
                    temperature: `${(weatherItem.main.temp - 273.15).toFixed(1)} °C`,
                    feelsLike: `${(weatherItem.main.feels_like - 273.15).toFixed(1)} °C `,
                    condition: weatherItem.weather[0].description,
                    wind: `${(weatherItem.wind.speed * 3600 / 1000).toFixed(1)} km/h ${getWindDirection(weatherItem.wind.deg)}`,
                    precipitationChange: `${(weatherItem.pop * 100).toFixed(0)} %`,
                    humidity: `${weatherItem.main.humidity} %`,
                    visibility: `${(weatherItem.visibility / 1000).toFixed(1)} km`

                };

            } else { 

                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
            
        })

    }).catch(() => {
        showToast("Weather forecast error when fetching !!");
    });
}



const getCityCoordinates = async () => { 

    const cityName =  cityInput.value.trim();

    if (!cityName) return;

    const response = await fetch(`/api/geocode?city=${encodeURIComponent(cityName)}`);
    const data = await response.json();

    if (!data.length) return showToast(`No coordinates found for ${cityName} !!`);
    const { name, lat, lon } = data[0];
    
    getWeatherDetails (name, lat, lon);
    getMetarByCoords (lat, lon);

}

// reverse API setup for usr location sharing
const getUserCoordinates = () => { 
    navigator.geolocation.getCurrentPosition(
        position => {

            const {latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `/api/reverse?lat=${latitude}&lon=${longitude}`;

            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => { 

                if (!data.length) return showToast(`No coordinates found !!`);
                const { name } = data[0];

                getWeatherDetails (name, latitude, longitude);
                getMetarByCoords (latitude, longitude);

            }).catch(() => {

                showToast("error during fetching the city location !!");
            });

        },
        error => { 
            if (error.code === error.PERMISSION_DENIED) { 
                showToast("Location permission denied !! Reset location permission to re-enable access !!");
            }
        }
    );
}


// for METAR reports
const getMetarReport = async () => { 

    const icao = cityInput.value.trim().toUpperCase();

    if (!icao) return;

    const response = await fetch(`/api/metar?ids=${encodeURIComponent(icao)}`);
    const data = await response.json();

    if (!data.data || !data.data.length) return showToast(`no METAR found for your ${icao} value !!`);

    currentWeatherDiv.innerHTML = `<div class="details"><h2> ${icao}'s METAR</h2><p>${data.data[0]}</p></div>`;

}


// If no , one or two airport exist in same city, a simple gate to show them and filter 
const getMetarByCoords = async (lat, lon) => { 

   metarReportDiv.innerHTML = "";

   try {

        const response = await fetch (`/api/metar-nearby?lat=${lat}&lon=${lon}`);
        const data = await response.json();

        if (!data.data || !data.data.length) { 

            metarReportDiv.innerHTML = `<h2>No airport found to be near your location !!</h2>`;
            return;
        }

        const reports = data.data.slice(0, 2).map(raw => `<p>${raw}</p>`).join("");
        metarReportDiv.innerHTML = `<h2>Airport weather (METAR): </h2> ${reports}`;

   } catch { 

        showToast("METAR fetch error !!");
   }
};


// getting AI generated summary displayed
const getWeatherSummary = async () => { 

    if (!currentWeatherData) return showToast("Select your city first !! ");

    summaryDiv.innerHTML = "<p>Getting you fresh update...</p>";

    try { 

        const response = await fetch ("/api/summary", {

            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify ({ weather: currentWeatherData })
        });

        const data = await response.json();

        if (!data.summary) return summaryDiv.innerHTML = "<p>Could not get summary !!</p>";

        summaryDiv.innerHTML = `<p>${data.summary}</p>`;

    } catch { 

        summaryDiv.innerHTML = "<p>Summary failed, unfortunately :(</p>";
    }

};



// EVENT LISTENERS
LocationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);

cityInput.addEventListener( "keyup", e => e.key === "Enter" && getCityCoordinates());

explainButton.addEventListener("click", getWeatherSummary);
