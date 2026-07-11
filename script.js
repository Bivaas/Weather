const searchButton = document.querySelector(".search-btn");
const cityInput = document.querySelector(".city-input");


const createWeatherCard = (weatherItem) => { 

    return
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`;


    fetch(WEATHER_API_URL).then(res => res.json()).then(data => { 

        const uniqueForecastDays = [];

        data.list.filter(forecast => {

            const forecastDate = new Date(forecast.dt_txt).getDate();

            if(!uniqueForecastDays.includes(forecastDate)) {

                return uniqueForecastDays.push(forecastDate);
            }
        });

        fiveDaysForecast.forEach(weatherItem => {

            createWeatherCard(weatherItem);
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