console.log("Loaded: script.js");

import { createIcon } from "./assets/scripts/icons.js";

// get the tracklist from json data sent by the server (thanks server much appreciated)
const musicData = JSON.parse(document.querySelector("#music-data").textContent);
const trackList = musicData.trackList;
let queue = [];
// let nowPlaying = 0; // index into `queue`

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
    audioPlayer.src = path;
    audioPlayer.play();
    audioPlayer.focus();
    document.title = `${trackList[path].title} - muesli`;
    setFavicon(createBlobLink(trackList[path].image));
    console.log(queue);
    drawQueue();
}

function playChosenTrack(path) {
    // if (queue.includes(path)) {
    //     nowPlaying = queue.indexOf(path);
    // } else {
    //     queue.push(path);
    //     nowPlaying = queue.length - 1;
    // }
    // audioPlayer.src = path;
    // audioPlayer.play();
    // audioPlayer.focus();
    // document.title = `${trackList[path].title} - muesli`;
    // setFavicon(createBlobLink(trackList[path].image));
    // console.log(queue);
    // drawQueue();
    console.log("playing arbitrary track");
    console.log("old queue", queue);
    if (queue.includes(path)) {
        queue = queue.filter((item) => item !== path);
    }
    queue.unshift(path);
    console.log("new queue", queue);
    playTrack(queue[0]);
}

function playNextTrack() {
    console.log("playing next track");
    console.log("old queue", queue);
    queue.push(queue.shift()); // move the first element to the end
    console.log("new queue", queue);
    playTrack(queue[0]);
}

function drawQueue() {
    // let index = 0;
    // for (let q of queue) /* this is not confusing at all */ {
    //     console.log("looping for", q);
    //     const trackDiv = document.querySelector(`[data-path="${q}"]`);
    //     trackDiv.classList.add("slide-up");
    //     trackDiv.dataset.index = index;
    //     trackDiv.addEventListener(
    //         "animationend",
    //         function () {
    //             // wait until the animation is finished to move it
    //             console.log("finished");
    //             trackDiv.classList.remove("slide-up");
    //             if (trackDiv.dataset.index == 0) {
    //                 console.log("0th item");
    //                 trackContainer.moveBefore(trackDiv, null);
    //             }
    //         }
    //         // false
    //     );
    //     index++;
    // console.log(queue);
    // for (let q of queue) {
    //     const trackDiv = document.querySelector(`[data-path="${q}"]`);
    //     trackDiv.dataset.index = index;
    //     trackDiv.classList.add("slide-up");
    //     // trackDiv.addEventListener("animationend", function () {
    //     setTimeout(function () {
    //         void trackContainer.offsetHeight;
    //         trackDiv.classList.remove("slide-up");
    //     }, 201);
    //     // if (queue.indexOf(q) === 0) {
    //     // }/
    //     //
    //     // });
    //     if (index === 0) {
    //         trackDiv.addEventListener("animationend", function () {
    //             console.log("finished");
    //             trackContainer.moveBefore(trackDiv, null);
    //         });
    //     }
    //     index++;
    // }
    // index = 0;
    // for (let track of trackContainer.children) {
    //     track.dataset.index = index;
    //     index++;
    // }
    // setTimeout(function () {
    //     void trackContainer.offsetHeight;
    //     trackContainer.moveBefore(document.querySelector(".track"), null);
    //     for (let q of queue) {
    //         const trackDiv = document.querySelector(`[data-path="${q}"]`);
    //         trackDiv.classList.remove("slide-up");
    //     }
    // }, 200);
    console.log(queue);

    let index = 0;
    // this would work
    for (let q of queue) {
        const trackDiv = document.querySelector(`[data-path="${q}"]`);
        // trackDiv.classList.add("slide-up");
        // trackDiv.addEventListener("animationend", function () {
        //     trackDiv.classList.remove("slide-up");
        // });
        trackContainer.moveBefore(trackDiv, null);
        if (index === 0) trackDiv.classList.add("playing");
        else trackDiv.classList.remove("playing");
        index++;
    }
    // const finishedTrack = trackContainer.children[0];
    // for (let trackDiv of trackContainer.children) {
    //     // console.log(trackDiv);
    //     trackDiv.classList.add("slide-up");
    //     trackDiv.addEventListener("animationend", function () {
    //         // console.log(trackDiv.dataset.path, "finished");
    //         trackDiv.classList.remove("slide-up");
    //         if (trackDiv === finishedTrack) {
    //             // console.log(trackDiv.dataset.path, "favorite child");
    //             trackContainer.moveBefore(trackDiv, null);
    //         }
    //     });
    // }
}

function updateHeartIcon(path) {
    const heartButton = document.querySelector(
        // get the first [element with an icon type of heart] that is a child of an [element with a filepath matching the argument]
        // ie. the heart icon of the track we want to like
        `[data-path="${path}"] [data-icon-type="heart"]`
    );
    heartButton.style.color = trackList[path].hearted
        ? "var(--tertiary)"
        : "white";
    heartButton.style.fill = trackList[path].hearted
        ? "var(--tertiary)"
        : "none";

    // heartTrackOnServer(path);
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
    trackContainer.appendChild(trackDiv);
    // trackContainer.appendChild(br);

    queue.push(path);

    updateHeartIcon(path);

    thisTrackIndex++;
}

audioPlayer.addEventListener("ended", function () {
    // nowPlaying += 1;
    // nowPlaying %= queue.length; // start again if we finish the queue
    // playTrack(queue[nowPlaying]);
    console.log("track ended");
    playNextTrack();
});
window.playNextTrack = playNextTrack;
window.queue = function () {
    return queue;
};
