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


// api endpoint for normal weather search ( using city name )
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

// api ep setup for reverse geocoding ( use current location btn )
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


//api endpoint for metar report ( with checkWX )
app.get("/api/metar", async (req, res) => {

    const { ids } = req.query;

    if (!ids) { 

        return res.status(400).json ({ error: "Please ICAO code first !!"});
    }

    try { 
        
        const url = `https://api.checkwx.com/v2/metar/${encodeURIComponent(ids)}`;
        const response = await fetch(url, { 

            headers: { "X-API-Key": process.env.CHECKWX_API_KEY}
        });
        const data = await response.json();

        res.json(data);

    } catch {

        res.status(500).json ({ error: "METAR fetch FAILED !!"});
    }
});


// api endpoint to wire nearby METAR of nearby airport in the city with lat / lon of 70 mile radius ( getting metar with city input )
app.get ("/api/metar-nearby", async (req, res) => { 

    const { lat, lon } = req.query;

    if (!lat || !lon) { 

        return res.status(400).json({ error: "Location info is required !!!"});

    }

    try { 

        const url = `https://api.checkwx.com/v2/metar/lat/${lat}/lon/${lon}/radius/70`;
        const response = await fetch(url, { 

            headers: { "X-API-KEY": process.env.CHECKWX_API_KEY }
        });

        const data = await response.json();

        res.json(data);

    } catch (error) { 

        res.status(500).json({ error: "METAR of nearby airports failed !!"});
    }
});


app.listen(3000, () => {

    console.log ("Server up and running at 3000 !!")
})