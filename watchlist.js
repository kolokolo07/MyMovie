const watchlistContainer =
document.getElementById(
    "watchlistContainer"
);

loadWatchlist();

function loadWatchlist()
{
    const movies =
    JSON.parse(
        localStorage.getItem(
            "watchlist"
        )
    ) || [];

    displayWatchlist(movies);
}

function displayWatchlist(movies)
{
    let html = "";

    movies.forEach((movie,index)=>{

        const posterUrl =
        "https://image.tmdb.org/t/p/w500" +
        movie.poster;

        html +=

        `
        <div class="watch-card">

            <img
                src="${posterUrl}"
                class="watch-poster">

            <h2>
                ${movie.title}
            </h2>

            <div class="watch-info">

                <span class="watch-badge">
                    Genre: ${movie.genre || "Unknown"}
                </span>

                <span class="watch-badge">
                    Rating: ${movie.rating.toFixed(1)}
                </span>

                <div class="status-buttons">

    <button
        onclick="updateStatus(${index},'Plan To Watch')"
        class="status-btn">

        Plan
    </button>

    <button
        onclick="updateStatus(${index},'Watching')"
        class="status-btn">

        Watching
    </button>

    <button
        onclick="updateStatus(${index},'Completed')"
        class="status-btn">

        Completed
    </button>

</div>

<p class="current-status">

    Current :
    ${movie.status}

</p>

</select>

            </div>

            <div class="watch-actions">

                <button
                    onclick="deleteMovie(${index})"
                    class="delete-btn">

                    Delete

                </button>

            </div>

        </div>
        `;

    });

    watchlistContainer.innerHTML = html;
}

function deleteMovie(index)
{
    const movies =
    JSON.parse(
        localStorage.getItem(
            "watchlist"
        )
    ) || [];

    movies.splice(index,1);

    localStorage.setItem(
        "watchlist",
        JSON.stringify(movies)
    );

    loadWatchlist();
}

function updateStatus(index,status)
{
    const movies =
    JSON.parse(
        localStorage.getItem("watchlist")
    ) || [];

    movies[index].status =
    status;

    localStorage.setItem(
        "watchlist",
        JSON.stringify(movies)
    );

    loadWatchlist();
}