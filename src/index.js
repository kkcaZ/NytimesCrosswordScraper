require("dotenv").config();
const https = require("https");
const jsdom = require("jsdom");
const cron = require("node-cron");
const { MongoClient } = require("mongodb");
const { JSDOM } = jsdom;
const express = require("express");
const app = express();
const port = 3000;

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/";
const client = new MongoClient(mongoUrl);
const dbName = "NYTCrossword";

const cookie = process.env.COOKIE;
if (!cookie || cookie === "") {
    throw "ERROR: Cookie value not set, please set the value in the Dockerfile";
}

cron.schedule("0 22 * * *", async () => await getLeaderboard(cookie, null));

app.get("/leaderboard", async (req, res) => {
    await getLeaderboard(cookie, res);
})

app.listen(port, () => {
    console.log("Now listening on port " + port + "\nMongo URL: " + mongoUrl + "\nCookie: " + cookie);
})

async function getLeaderboard(cookie, res) {
    // Connection options for Nytimes Crossword Leaderboard
    const options = {
        hostname: "www.nytimes.com",
        port: 443,
        path: "/puzzles/leaderboards",
        method: "GET",
        headers: {
            "Cookie": cookie.toString()
        }
    }

    // Create request
    const request = https.request(options, (response) => {
        let data = "";

        // Read chunked data
        response.on("data", d => {
            data += d;
        })

        // When all data is read, parse & upload to mongodb
        response.on("end", async () => {
            const dom = new JSDOM(data);
            let nameElements = dom.window.document.querySelectorAll(".lbd-score__name");
            let scoreElements = dom.window.document.querySelectorAll(".lbd-score__time");
            let html = "";

            try {
                await client.connect();
            }
            catch (err) {
                console.log("Unable to connect to database - " + err);
                throw err;
            }

            const db = client.db(dbName);
            const collection = db.collection("Scores");

            // Get all players on leaderboard
            for (let i = 0; i < nameElements.length; i++) {
                // Get player info
                let playerName = nameElements[i].innerHTML.replace(`<span class="lbd-score__you">(you)</span>`, "").trimEnd();
                let playerTime = scoreElements[i]?.innerHTML;
                let timeInSeconds = getTimeInSeconds(playerTime);
                let date = new Date();
                let year = date.getFullYear();
                let month = date.getMonth()+1;
                let day = date.getDate();
                let formattedDate = `${day}-${month}-${year}`;

                let playerTimeObj = {
                    timeInSeconds,
                    date: formattedDate
                }

                record = await collection.findOne({name: playerName});

                // Only insert if completed crossword
                if (playerTime != null && playerTime != "--") {
                    // Update record if already have record in db
                    if (record) {
                        if (!record.times.filter(e => e.date == formattedDate).length > 0) {
                            let tempTimes = record.times;
                            tempTimes.push(playerTimeObj);
                            
                            await collection.updateOne(
                                { name: playerName },
                                { $set: { scores: tempTimes } }
                            );
                        }
                    }
                    // Insert new record
                    else {
                        collection.insertOne({name: playerName, times: [playerTimeObj]});
                    }
                }
            }

            // Return player data
            if (res) {
                let playerData = [];
                let cursor = await collection.find();

                await cursor.forEach(item => {
                    if (item != null) {
                        playerData.push(item);
                    }
                });
                res.setHeader('content-type', 'application/json');
                res.send(JSON.stringify(playerData));
            }
        })
    })

    request.on("error", error => {
        console.error(error);
    })

    request.end();
}

function getTimeInSeconds(time) {
    let splitTime = time.split(":");
    return parseInt(splitTime[0]) * 60 + parseInt(splitTime[1]);
}

app.use(express.static("public"));
