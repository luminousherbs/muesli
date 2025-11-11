console.log("Loaded: script.js");

import { createIcon } from "./assets/scripts/icons.js";

// TODO: add support for unhearting tracks (currently impossible)

// get the tracklist from json data sent by the server (thanks server much appreciated)
const musicData = JSON.parse(document.querySelector("#music-data").textContent);
const trackList = musicData.trackList;
const queue = [];
let nowPlaying = 0; // index into `queue`

// html elements
const audioPlayer = document.querySelector("audio");
const favicon = document.getElementById("favicon");

function playTrack(path) {
    if (queue.includes(path)) {
        nowPlaying = queue.indexOf(path);
    } else {
        queue.push(path);
        nowPlaying = queue.length - 1;
    }
    audioPlayer.src = path;
    audioPlayer.play();
    audioPlayer.focus();
    document.title = `${trackList[path].title} - muesli`;
    setFavicon(createBlobLink(trackList[path].image));
}

function displayTrackAsHearted(trackPath, hearted) {
    const heartButton = document.querySelector(
        // get the first [element with an icon type of heart] that is a child of an [element with a filepath matching the argument]
        // ie. the heart icon of the track we want to like
        `[data-path="${trackPath}"] [data-icon-type="heart"]`
    );
    heartButton.style.color = hearted ? "red" : "white";
    heartButton.style.fill = hearted ? "red" : "none";
    // tracksByPath[trackPath].hearted = hearted;
}

function heartTrack(trackPath) {
    fetch("/api/heart/", {
        method: "POST",
        body: JSON.stringify({
            path: trackPath,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    }).then((res) => {
        console.log(res);
    });
}

function createBlobLink(base64ImageData) {
    return `data:${base64ImageData.format};base64,${base64ImageData.data}`;
}

function setFavicon(imageLink) {
    favicon.href = imageLink;
}

let thisTrackIndex = 0;
for (let [path, track] of Object.entries(trackList)) {
    console.log(path, track);
    //
    // create div which is the track card
    const trackDiv = document.createElement("div");
    trackDiv.className = "track";
    trackDiv.dataset.index = thisTrackIndex;
    trackDiv.dataset.path = path;

    // create secondary div which holds everything that should trigger playback when clicked
    const playbackArea = document.createElement("div");
    playbackArea.className = "track-playback-area";
    playbackArea.onclick = function () {
        playTrack(trackDiv.dataset.path);
    };

    // create tertiary div which holds title and description
    const info = document.createElement("div");
    info.className = "track-info";

    // create title
    const title = document.createElement("p");
    title.className = "track-title";
    title.innerText = track.title;

    // create description
    const description = document.createElement("p");
    description.className = "track-description";
    description.innerText = track.artists[0];

    // create album cover
    const albumCover = document.createElement("img");
    albumCover.className = "track-album-cover";
    albumCover.src = createBlobLink(track.image);

    // create interaction icons
    // TODO: separate function to handle which interactions are created
    const interactionBox = document.createElement("div");
    interactionBox.className = "interaction-box";
    const heart = createIcon("heart");
    heart.onclick = function () {
        heartTrack(track.path);
        displayTrackAsHearted(track.path, !tracksByPath[track.path].hearted);
    };
    heart.dataset.iconType = "heart";

    // create linebreak between cards
    // TODO: this should be replaced with css on a parent div which holds all the cards
    const br = document.createElement("br");

    info.appendChild(title);
    info.appendChild(description);

    playbackArea.appendChild(albumCover);
    playbackArea.appendChild(info);

    interactionBox.appendChild(heart);

    trackDiv.appendChild(playbackArea);
    trackDiv.appendChild(interactionBox);
    document.body.appendChild(trackDiv);
    document.body.appendChild(br);

    queue.push(path);

    thisTrackIndex++;
}

audioPlayer.addEventListener("ended", function () {
    nowPlaying += 1;
    nowPlaying %= queue.length; // start again if we finish the queue
    playTrack(queue[nowPlaying]);
});

displayTrackAsHearted("data/music/funk.m4a", true);
