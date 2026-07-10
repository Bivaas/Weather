const searchButton = document.querySelector(".search-btn");
const cityInput = document.querySelector(".city-input");



const getCityCoordinates = () => { 

    const cityName =  cityInput.value.trim();

    if (!cityName) return;

    const response = await fetch(`/api/geocode?city=${encodeURIComponent(cityName)}`);
    const data = await response.json();
}

searchButton.addEventListener("click", getCityCoordinates);