console.log("Loaded: script.js");

// get the tracklist from json data sent by the server (thanks server much appreciated)
const musicData = JSON.parse(document.querySelector("#music-data").textContent);
const trackList = musicData.trackList;

const audioPlayer = document.querySelector("audio");

for (let trackName of trackList) {
    const track = document.createElement("div");
    track.className = "track";
    track.innerText = trackName;
    track.onclick = function () {
        audioPlayer.src = trackName;
        audioPlayer.play();
    };
    const br = document.createElement("br");
    document.body.appendChild(track);
    document.body.appendChild(br);
}
