const apiKey = "f176354662a71abee3d16d8be9e39ea3";

const searchBtn = document.getElementById("searchBtn");
const movieResult = document.getElementById("movieResult");
const movieCollection = document.getElementById("movieCollection");
const clearBtn = document.getElementById("clearBtn");
const recommendationResult = document.getElementById("recommendationResult");

let lastSearchResults = [];
let currentMovie = null;
let currentGenre = "";
let currentRuntime = 0;

clearBtn.addEventListener("click", clearAll);
searchBtn.addEventListener("click", searchMovie);

document.getElementById("movieInput").addEventListener("keydown", e => {
    if (e.key === "Enter") searchMovie();
});

function searchMovie() {
    const movieName = document.getElementById("movieInput").value;

    if (movieName == "") {
        movieResult.innerHTML = "<h2>Please enter a movie title.</h2>";
        return;
    }

    const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(movieName)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            showResults(data.results);
        })
        .catch(error => {
            movieResult.innerHTML = "<h2>Failed to connect TMDB API.</h2>";
        });
}

function showResults(results) {
    lastSearchResults = results;

    const items = results
        .filter(item =>
            (item.media_type == "movie" || item.media_type == "tv") &&
            item.poster_path
        )
        .slice(0, 10);

    if (items.length == 0) {
        movieResult.innerHTML = "<h2>Movie not found.</h2>";
        return;
    }

    let cards = "";

    items.forEach(item => {
        const poster = "https://image.tmdb.org/t/p/w500" + item.poster_path;
        const type = item.media_type == "tv" ? "📺 Series" : "🎬 Movie";

        cards += `
        <div class="collection-card"
             onclick="showDetails(${item.id}, '${item.media_type}')">
            <img src="${poster}">
            <h4>${item.title || item.name}</h4>
            <p style="text-align:center; padding-bottom:15px; color:#94a3b8;">
                ${type}
            </p>
        </div>
        `;
    });

    movieResult.innerHTML = `
    <div class="collection-grid" style="width:100%">
        ${cards}
    </div>
    `;
}

async function showDetails(id, type) {
    const response = await fetch(
        `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}`
    );

    const detail = await response.json();
    const title = detail.title || detail.name;
    const date = detail.release_date || detail.first_air_date || "N/A";
    const genre = detail.genres.map(g => g.name).join(", ");

    currentGenre = genre;

    currentMovie = {
        title: title,
        poster_path: detail.poster_path,
        vote_average: detail.vote_average,
        release_date: date
    };

    let recommendation = "";

    if (genre.includes("Horror")) {
        recommendation = "👻 Recommended for horror fans.";
    } else if (genre.includes("Comedy")) {
        recommendation = "😆 Great choice for relaxing.";
    } else if (genre.includes("Animation")) {
        recommendation = "🎨 Perfect for family watching.";
    } else if (genre.includes("Action")) {
        recommendation = "🔥 Great for action lovers.";
    } else {
        recommendation = "🎬 Recommended for movie enthusiasts.";
    }

    const posterUrl = "https://image.tmdb.org/t/p/w500" + detail.poster_path;

    movieResult.innerHTML = `
    <div class="movie-card">

        <button class="close-btn" onclick="closeDetails()"> ✕ </button>

        <img src="${posterUrl}" class="poster">

        <div class="movie-info">

            <h2>${title}</h2>

            <span class="badge">🎭 ${genre}</span>
            <span class="badge">⭐ ${detail.vote_average.toFixed(1)}</span>
            <span class="badge">📅 ${date}</span>

            <div class="overview">
                <h3>Overview</h3>
                <p>${detail.overview || "No overview available."}</p>
            </div>

            <div class="recommendation">
                <h3>🤖 Smart Recommendation</h3>
                <p>${recommendation}</p>
            </div>

            <div class="button-container">
                <button class="watchlist-btn" onclick="addToWatchlist()">
                    ➕ Add To Watchlist
                </button>
            </div>

        </div>

    </div>
    `;

    movieResult.scrollIntoView({ behavior: "smooth" });
}

loadMovieCollection();

function loadMovieCollection() {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayCollection(data.results);
        });
}

function displayCollection(movies) {
    let cards = "";

    movies.forEach(movie => {
        const poster = "https://image.tmdb.org/t/p/w500" + movie.poster_path;

        cards += `
        <div class="collection-card"
             onclick="showDetails(${movie.id}, 'movie')">
            <img src="${poster}">
            <h4>${movie.title}</h4>
        </div>
        `;
    });

    movieCollection.innerHTML = `
    <h2 class="section-title">Movie Collection</h2>

    <div class="collection-grid">
        ${cards}
    </div>
    `;
}

function addToWatchlist() {
    if (currentMovie == null) {
        return;
    }

    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    const movieData = {
        title: currentMovie.title,
        genre: currentGenre,
        poster: currentMovie.poster_path,
        rating: currentMovie.vote_average,
        releaseDate: currentMovie.release_date,
        status: "Plan To Watch"
    };

    watchlist.push(movieData);

    localStorage.setItem("watchlist", JSON.stringify(watchlist));

    alert("Movie added to watchlist!");
}

function getRuntime(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            currentRuntime = data.runtime;
            console.log(data.runtime);
        });
}

async function moviePlanner() {
    const mood = document.getElementById("plannerMood").value;
    const time = Number(document.getElementById("plannerTime").value);

    recommendationResult.innerHTML =
        `<h2 class="section-title">⏳ Finding movies...</h2>`;

    let genreId;

    if (mood == "Horror") {
        genreId = 27;
    } else if (mood == "Comedy") {
        genreId = 35;
    } else if (mood == "Romance") {
        genreId = 10749;
    } else if (mood == "Action") {
        genreId = 28;
    } else if (mood == "Drama") {
        genreId = 18;
    } else if (mood == "Animation") {
        genreId = 16;
    } else if (mood == "Sci-Fi") {
        genreId = 878;
    } else {
        genreId = 9648;
    }

    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&page=1`;

    const response = await fetch(url);
    const data = await response.json();

    let cards = "";

    for (const movie of data.results) {
        const detailResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`
        );

        const detail = await detailResponse.json();

        if (detail.runtime && detail.runtime <= time) {
            const poster = "https://image.tmdb.org/t/p/w500" + movie.poster_path;

            cards += `
            <div class="collection-card">
                <img src="${poster}">
                <h4>${movie.title}</h4>
                <p>⭐ ${movie.vote_average.toFixed(1)}</p>
                <p>📅 ${movie.release_date}</p>
                <p>⏱ ${detail.runtime} min</p>
            </div>
            `;
        }
    }

    if (cards == "") {
        cards = `<p style="grid-column:1/-1; text-align:center; color:#94a3b8;">
                    No movie fits within ${time} min. Try a longer time.
                 </p>`;
    }

    recommendationResult.innerHTML = `
    <h2 class="section-title">🎬 Your Recommendations</h2>

    <p style="text-align:center; margin-bottom:20px;">
        Mood: ${mood} | Available Time: ${time} min
    </p>

    <div class="collection-grid">
        ${cards}
    </div>
    `;

    recommendationResult.scrollIntoView({ behavior: "smooth" });
}

function analyzeMovie() {
    const movieName = document.getElementById("worthMovie").value;

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${movieName}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {

            if (data.results.length == 0) {
                document.getElementById("worthResult").innerHTML = `
                <h3>❌ No Suitable Suggestion Available</h3>
                <p>The movie could not be found.</p>
                `;
                return;
            }

            const movie = data.results[0];
            const posterUrl = "https://image.tmdb.org/t/p/w500" + movie.poster_path;

            fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`)
                .then(response => response.json())
                .then(detail => {

                    const rating = detail.vote_average;
                    const popularity = detail.popularity;
                    const runtime = detail.runtime;

                    let score = (rating * 10) + (popularity / 10) - (runtime / 10);

                    if (score > 100) { score = 100; }

                    let verdict;
                    let comment;

                    if (score >= 85) {
                        verdict = "🔥 Must Watch";

                        const comments = [
                            "Add this to your watchlist now.",
                            "Definitely worth your time.",
                            "Don't miss this one.",
                            "One of the best picks available.",
                            "Worth every minute."
                        ];

                        comment = comments[Math.floor(Math.random() * comments.length)];
                    } else if (score >= 70) {
                        verdict = "✅ Worth Watching";

                        const comments = [
                            "Worth giving a chance.",
                            "A solid movie choice.",
                            "Solid entertainment.",
                            "Likely to be enjoyable.",
                            "A safe pick for tonight."
                        ];

                        comment = comments[Math.floor(Math.random() * comments.length)];
                    } else if (score >= 50) {
                        verdict = "👍 Average Choice";

                        const comments = [
                            "Only if the genre interests you.",
                            "Give it a try.",
                            "Depends on your taste.",
                            "A casual viewing option.",
                            "May appeal to specific viewers."
                        ];

                        comment = comments[Math.floor(Math.random() * comments.length)];
                    } else {
                        verdict = "👎 Skip";

                        const comments = [
                            "There are better alternatives.",
                            "Not strongly recommended.",
                            "Viewer response is underwhelming.",
                            "Better options exist.",
                            "Might not be worth your time."
                        ];

                        comment = comments[Math.floor(Math.random() * comments.length)];
                    }

                    document.getElementById("worthResult").innerHTML = `
                    <img src="${posterUrl}" class="worth-poster">

                    <h1>${detail.title}</h1>

                    <h2>${score.toFixed(0)}/100</h2>

                    <h3>${verdict}</h3>

                    <p>⭐ Rating : ${rating.toFixed(1)}</p>
                    <p>🔥 Popularity : ${popularity.toFixed(0)}</p>
                    <p>⏱ Runtime : ${runtime} min</p>
                    <p>💬 ${comment}</p>
                    `;
                });
        });
}

function clearAll() {
    document.getElementById("movieInput").value = "";
    document.getElementById("worthMovie").value = "";
    document.getElementById("worthResult").innerHTML = "";

    movieResult.innerHTML = "";
    recommendationResult.innerHTML = "";
    lastSearchResults = [];

    loadMovieCollection();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeDetails() {
    if (lastSearchResults.length > 0) {
        showResults(lastSearchResults);
    } else {
        movieResult.innerHTML = "";
    }

    movieResult.scrollIntoView({ behavior: "smooth" });
}
