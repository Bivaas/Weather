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
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${process.env.OPENWEATHER_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();


        res.json(data);

    } catch (error) {

        res.status(500).json({ error: `geocoding fetch failed for ${city}!!`});
    }
});

app.listen(3000, () => {

    console.log ("Server up and running at 3000 !!")
})