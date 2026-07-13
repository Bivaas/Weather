# About 

This is a simple weather app. You can view the weather either by typing city name or by using own current location (make sure to give location perms) whci also gives you METAR report if you're aviation enthusiast and want to take a flight :) 

I also have some extra ideas as an add-on into the weather app.

# Tech Stack

Frontend with vanilla JS, HTML and CSS
Backend server with Node.js and express handling OpenWeather API requests + CheckWX requests

## Dependency

- CORS 
- dotenv
- nodemon

# Use of AI 

I've used AI mainly for debugging purposes like API handling and when reverse location search did not work properly. I've used AI to suggest a color palette though I used it partially only. 

In my initial plan, I thought of using aviationweather.gov for easy METAR reports but they search up by only ICAO code but I have used cityname for openweather. So, I asked AI for help and if it would somehow convert cityname to ICAO airport, then it recommended me to use CheckWX although I had to setup API keys and have some rate limit but made the life easier and helped me implement. 

# NOTE

Visibility might not work properly as intended.

# Everything I've used 

``` 
Google fonts (open sans): https://fonts.google.com/selection
OpenWeather (API keys): https://openweathermap.org/
CheckWX (API keys for METAR): https://www.checkwxapi.com/
Degree: https://www.degreesymbol.net/
Toastify-JS: https://github.com/apvarun/toastify-js
```