console.log("Loaded: script.js");

// get the tracklist from json data sent by the server (thanks server much appreciated)
const musicData = JSON.parse(document.querySelector("#music-data").textContent);
const trackList = musicData.trackList;

const audioPlayer = document.querySelector("audio");

let trackIndex = 0;

function playTrack(trackLocation) {
    audioPlayer.src = trackLocation;
    audioPlayer.play();
    audioPlayer.focus();
}

function createBlobLink(base64ImageData) {
    return `data:${base64ImageData.format};base64,${base64ImageData.data}`;
}

let thisTrackIndex = 0;
for (let track of trackList) {
    //
    const trackDiv = document.createElement("div");
    trackDiv.className = "track";
    trackDiv.dataset.index = thisTrackIndex;
    trackDiv.onclick = function () {
        trackIndex = trackDiv.dataset.index;
        playTrack(trackList[trackIndex].path);
    };

    const info = document.createElement("div");
    info.className = "track-info";

    const title = document.createElement("p");
    title.className = "track-title";
    title.innerText = track.title;

    const description = document.createElement("p");
    description.className = "track-description";
    description.innerText = track.artists[0];

    const icon = document.createElement("img");
    icon.className = "track-icon";
    icon.src = createBlobLink(track.image);

    const br = document.createElement("br");

    info.appendChild(title);
    info.appendChild(description);

    trackDiv.appendChild(icon);
    trackDiv.appendChild(info);
    document.body.appendChild(trackDiv);
    document.body.appendChild(br);

    thisTrackIndex++;
}

audioPlayer.addEventListener("ended", function () {
    trackIndex++;
    trackIndex %= trackList.length;
    playTrack(trackList[trackIndex].path);
});

/* 
const blob = new Blob([trackList[0].image.data], {
    type: trackList[0].image.format,
});
const url = URL.createObjectURL(blob);

// Display the image
const img = document.createElement("img");
img.src = url;
document.body.appendChild(img);
 */
