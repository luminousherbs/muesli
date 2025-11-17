console.log("Loaded: script.js");

import { createIcon } from "./assets/scripts/icons.js";

// get the tracklist from json data sent by the server (thanks server much appreciated)
const musicData = JSON.parse(document.querySelector("#music-data").textContent);
const trackList = musicData.trackList;
let queue = [];
const history = [];

// html elements
const audioPlayer = document.querySelector("audio");
const favicon = document.getElementById("favicon");
const trackContainer = document.getElementById("trackContainer");

async function post(url, data) {
    return await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    });
}

function playTrack(path) {
    history.push(queue[0]);
    audioPlayer.src = path;
    audioPlayer.play();
    audioPlayer.focus();
    document.title = `${trackList[path].title} - muesli`;
    setFavicon(createBlobLink(trackList[path].image));
    drawQueue();
}

function playChosenTrack(path) {
    if (queue.includes(path)) {
        queue = queue.filter((item) => item !== path);
    }
    queue.unshift(path);
    playTrack(queue[0]);
}

function playNextTrack() {
    queue.push(queue.shift()); // move the first element to the end
    playTrack(queue[0]);
}

function drawQueue() {
    let index = 0;
    for (let q of queue) {
        const trackDiv = document.querySelector(`[data-path="${q}"]`);
        trackContainer.insertBefore(trackDiv, null);
        if (index === 0) trackDiv.classList.add("playing");
        else trackDiv.classList.remove("playing");
        index++;
    }
}

function updateHeartIcon(path) {
    const heartButton = document.querySelector(
        // get the first [element with an icon type of heart] that is a child of an [element with a filepath matching the argument]
        // ie. the heart icon of the track we want to heart
        `[data-path="${path}"] [data-icon-type="heart"]`
    );

    if (trackList[path].hearted) {
        heartButton.classList.add("active");
    } else {
        heartButton.classList.remove("active");
    }
}

function updateHeartFile(path) {
    post("/api/heart/", {
        path: path,
        hearted: trackList[path].hearted,
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
        playChosenTrack(trackDiv.dataset.path);
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
        trackList[path].hearted = !trackList[path].hearted;
        if (trackList[path].hearted) {
            heart.classList.remove("shrink");
            heart.classList.add("grow");
        } else {
            heart.classList.remove("grow");
            heart.classList.add("shrink");
        }
        updateHeartIcon(path);
        updateHeartFile(path);
    };
    heart.dataset.iconType = "heart";

    info.appendChild(title);
    info.appendChild(description);

    playbackArea.appendChild(albumCover);
    playbackArea.appendChild(info);

    interactionBox.appendChild(heart);

    trackDiv.appendChild(playbackArea);
    trackDiv.appendChild(interactionBox);
    trackContainer.appendChild(trackDiv);

    queue.push(path);

    updateHeartIcon(path);

    thisTrackIndex++;
}

audioPlayer.addEventListener("ended", function () {
    history.push(queue[0]);
    playNextTrack();
});
window.playNextTrack = playNextTrack;
window.queue = function () {
    return queue;
};

// handle keybinds

navigator.mediaSession.setActionHandler("play", () => {
    audioPlayer.play();
});

navigator.mediaSession.setActionHandler("pause", () => {
    audioPlayer.pause();
});

navigator.mediaSession.setActionHandler("previoustrack", () => {
    history.pop();
    playChosenTrack(history.pop());
});

navigator.mediaSession.setActionHandler("nexttrack", () => {
    playNextTrack();
});
