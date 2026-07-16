const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.static("public"));

app.use(express.json());


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




// api endpoint to wire nearby METAR of nearby airport in the city with lat / lon of 120 mile radius ( getting metar with city input )
app.get ("/api/metar-nearby", async (req, res) => { 

    const { lat, lon } = req.query;

    if (!lat || !lon) { 

        return res.status(400).json({ error: "Location info is required !!!"});

    }

    try { 

        const url = `https://api.checkwx.com/v2/metar/lat/${lat}/lon/${lon}/radius/120`;
        const response = await fetch(url, { 

            headers: { "X-API-KEY": process.env.CHECKWX_API_KEY }
        });

        const data = await response.json();

        res.json(data);

    } catch (error) { 

        res.status(500).json({ error: "METAR of nearby airports failed !!"});
    }
});



// endpoint for AI response for weather summary to explain in paragraph
app.post ("/api/summary", async (req, res) => {

    const { weather, metar } = req.body;

    if (!weather) {

        return res.status(400).json ({ error: "Weather data not available !!"});
    }

    const userContent = metar && metar.length 
        ? `Weather data: ${JSON.stringify(weather)}\n\nRaw METAR reports: ${JSON.stringify(metar)}`
        : `Weather data: ${JSON.stringify(weather)}\n\nNO METAR reports available !!`;

    try { 
        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {

            method: "POST", 
            headers: {

                "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
                "Content-Type": "application/json"
            },

            body: JSON.stringify ({

                model: "meta/llama-3.1-8b-instruct",
                messages: [

                    {role: "system", content: "You are a weather assistant. Your job is to write exactly two paragraph seperated by a blank line. FIRST paragraph: describe the current city weather in plain language in about 4-5 sentences. Second paragraph: Decode the raw METAR report and then in simple English language, explain what it says and their meaning in short. If no METAR data is provided, say that you could not get nearby airports data. You should not include any markdown, no lists, no headings at all !"},
                    { role: "user", content: userContent }
                ],

                temperature: 0.4,
                max_tokens: 450
            })
        });

        const data = await response.json();

        const summary = data.choices[0].message.content;

        res.json({ summary });

    } catch (error) { 

        res.status(500).json ({ error: "AI summary failed !! "});
    }

 });


 module.exports = app;

app.listen(3000, () => {

    console.log ("Server up and running at 3000 !!")
})