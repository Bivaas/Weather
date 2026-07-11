const searchButton = document.querySelector(".search-btn");
const cityInput = document.querySelector(".city-input");

const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");


const createWeatherCard = (cityName, weatherItem, index) => { 

    if (index === 0) {

        return `<div class="details"> 

                    <h2>CITY (2026-7-8)</h2>
                    <h4>TEMPERATURE:</h4>
                    <h4>WIND:</h4>
                    <h4>HUMIDITY:</h4>
                </div>

                <div class="icon">

                    <img src="https://openweathermap.org/img/wn/10d@4x.png" alt="weather-icon">
                    <h4>Moderate Rain</h4>

                </div>`;

    } else { 

        // using actual value for weather and converting F to C and m/s to km/hr
        return `<li class="card">
        
                    <h3>${weatherItem.dt_txt.split("-")[0]}</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h4>Temp: ${(weatherItem.main.temp - 272.15).toFixed(2)} °C</h4>
                    <h4>Wind: ${(weatherItem.wind.speed * 3600 / 1000).toFixed(2)} km/h</h4>
                    <h4>Humidity: ${weatherItem.main.humidity} %</h4>
    
                </li>`;
    }

}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`;



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


        fiveDaysForecast.forEach((weatherItem, index) => {

            if (index === 0) { 

                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            } else { 

            weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
            
        })

    }).catch(() => {
        alert("Weather forecast error when fetching !!");
    });
}



const getCityCoordinates = async () => { 

    const cityName =  cityInput.value.trim();

    if (!cityName) return;

    const response = await fetch(`/api/geocode?city=${encodeURIComponent(cityName)}`);
    const data = await response.json();
}

searchButton.addEventListener("click", getCityCoordinates);