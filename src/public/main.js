let data;
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const Http = new XMLHttpRequest();
const url = "/leaderboard"
Http.open("GET", url);
Http.send();

Http.onreadystatechange = () => {
    if (Http.responseText != "") {
        data = JSON.parse(Http.responseText);
        updateLeaderboards();
    }
}

function updateLeaderboards() {
    updateTodaysLeaderboard();
    updateTopTimesLeaderboard();
    updateLongestTimesLeaderboard();
    updateAverageTimes();
    updateGamesPlayed();
    createChart();
}

function updateTodaysLeaderboard() {
    let dateElement = document.getElementById("todays-date");
    let date = new Date();
    dateElement.innerText = `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

    let scoreboard = document.getElementById("today-leaderboard-placements");
    scoreboard.innerHTML = "";

    let scores = [];

    for (let player of data) {
        const date = new Date();
        const formattedDate = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
        const timeInSeconds = player.times.filter(s => s.date == formattedDate)[0]?.timeInSeconds;
        const formattedTime = getFormattedTime(timeInSeconds);
        if (timeInSeconds == null) continue;

        scores.push({ name: player.name, formattedTime, timeInSeconds });
    }

    scores = scores.sort((a, b) => {return a.timeInSeconds - b.timeInSeconds});

    let placement = 1;
    scores.forEach(time => {
        let scoreHtml = `<div class="placement-container">
                            <p class="placement">${placement}</p>
                            <p>${time.name}</p>
                            <p class="time">${time.formattedTime}</span>
                        </div>
                        <hr/>`;

        placement++;
        scoreboard.innerHTML += scoreHtml;
    });

    if (scores.length === 0) {
        scoreboard.innerHTML += "<p>No results found.</p><br/>";
    }
    
    scoreboard.innerHTML += `<a href="https://www.nytimes.com/crosswords/game/mini">Play Game</a>`;
}

function updateTopTimesLeaderboard() {
    let scoreboard = document.getElementById("top-times-leaderboard-placements");
    scoreboard.innerHTML = "";

    let times = [];

    for (let player of data) {
        
        for (let s of player.times) {
            let timeInSeconds = s.timeInSeconds;
            let formattedTime = getFormattedTime(timeInSeconds);

            times.push({ name: player.name, formattedTime, timeInSeconds, date: s.date });
        }
    }

    times = times.sort((a, b) => {return a.timeInSeconds - b.timeInSeconds});
    times = times.splice(0, 5);

    let placement = 1;
    times.forEach(time => {
        let scoreHtml = `<div class="placement-container">
                            <p class="placement">${placement}</p>
                            <p>${time.name}</p>
                            <p class="date">${time.date}</p>
                            <p class="time">${time.formattedTime}</span>
                        </div>
                        <hr/>`;

        placement++;
        scoreboard.innerHTML += scoreHtml;
    });
}

function updateLongestTimesLeaderboard() {
    let scoreboard = document.getElementById("longest-times-leaderboard-placements");
    scoreboard.innerHTML = "";

    let times = [];

    for (let player of data) {
        for (let s of player.times) {
            let timeInSeconds = s.timeInSeconds;
            let formattedTime = getFormattedTime(timeInSeconds);

            times.push({ name: player.name, formattedTime, timeInSeconds, date: s.date });
        }
    }

    times = times.sort((a, b) => {return a.timeInSeconds - b.timeInSeconds}).reverse();
    times = times.splice(0, 5);

    let placement = 1;
    times.forEach(time => {
        let scoreHtml = `<div class="placement-container">
                            <p class="placement">${placement}</p>
                            <p>${time.name}</p>
                            <p class="date">${time.date}</p>
                            <p class="time">${time.formattedTime}</span>
                        </div>
                        <hr/>`;

        placement++;
        scoreboard.innerHTML += scoreHtml;
    });
}

function updateAverageTimes() {
    let scoreboard = document.getElementById("average-times-leaderboard");
    scoreboard.innerHTML = "";

    let times = [];

    for (let player of data) {
        const averageSeconds = player.times.reduce((total, next) => total + next.timeInSeconds, 0) / player.times.length;
        let formattedTime = getFormattedTime(averageSeconds);

        times.push({ name: player.name, formattedTime, timeInSeconds: averageSeconds });
    }

    times = times.sort((a, b) => {return a.timeInSeconds - b.timeInSeconds});

    let placement = 1;
    times.forEach(time => {
        let scoreHtml = `<div class="placement-container">
                            <p class="placement">${placement}</p>
                            <p>${time.name}</p>
                            <p class="time">${time.formattedTime}</span>
                        </div>
                        <hr/>`;

        placement++;
        scoreboard.innerHTML += scoreHtml;
    });
}

function updateGamesPlayed() {
    let scoreboard = document.getElementById("games-played-leaderboard");
    scoreboard.innerHTML = "";

    let gamesPlayed = [];

    for (let player of data) {
        let numOfGames = player.times.length;
        gamesPlayed.push({ name: player.name, numOfGames });
    }

    gamesPlayed = gamesPlayed.sort((a, b) => {return a.numOfGames - b.numOfGames}).reverse();

    let placement = 1;
    gamesPlayed.forEach(player => {
        let scoreHtml = `<div class="placement-container">
                            <p class="placement">${placement}</p>
                            <p>${player.name}</p>
                            <p class="time">${player.numOfGames}</span>
                        </div>
                        <hr/>`;

        placement++;
        scoreboard.innerHTML += scoreHtml;
    });
}

function createChart() {
    let series = [];

    for (let player of data) {
        let points = [];

        for (let time of player.times) {
            points.push({x: time.date, y: time.timeInSeconds});
        }

        series.push({name: player.name, points});
    }

    JSC.Chart('chartDiv', {
        xAxis_label_text: "Date",
        yAxis_label_text: "Time (seconds)",
        series
    });
}

function getFormattedTime(timeInSeconds) {
    let mins = Math.floor(timeInSeconds / 60);
    let seconds = timeInSeconds % 60;
    return `${mins}:${Math.floor(seconds).toLocaleString("en-US", {minimumIntegerDigits: 2})}`;
}