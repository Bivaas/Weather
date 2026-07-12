const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.static("."));


app.get("/api/geocode", async (req, res) => {

    const city = req.query.city;

    if (!city) { 
        return res.status(400).json({ error: "Not a valid city !!"})
    }

    try { 
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${process.env.OPENWEATHER_API_KEYS}`;
        const response = await fetch(url);
        const data = await response.json();


        res.json(data);

    } catch (error) {

        res.status(500).json({ error: `geocoding fetch failed for ${city}!!`});
    }
});



app.get("/api/forecast", async (req, res) => { 

    const { lat, lon } = req.query;

    if (!lat || !lon ) { 

        return res.status(400).json({ error: "lat / lon info is required !!" });
    }

    try { 
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEYS}`;
        const response = await fetch(url);
        const data = await response.json();

        res.json(data);

    } catch (error) { 

        res.status(500).json({ error: "Fetch failed for forecast !!"});
    }
});


app.get("/api/reverse", async (req, res) => {

    const { lat, lon } = req.query;

    if (!lat || !lon ) {

        return res.status(400).json ({ error: "lat / lon info is required !!!"});
    }

    try { 

        const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${process.env.OPENWEATHER_API_KEYS}`;
        const response = await fetch(url);
        const data = await response.json();

        res.json(data);

    } catch (error) {

        res.status(500).json({ error: "Reverse geocoding fetch failed !!" });
    }

});


app.listen(3000, () => {

    console.log ("Server up and running at 3000 !!")
})