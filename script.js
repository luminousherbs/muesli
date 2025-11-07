console.log("Loaded: script.js");

// get the tracklist from json data sent by the server (thanks server much appreciated)
const musicData = JSON.parse(document.querySelector("#music-data").textContent);
const trackList = musicData.trackList;

const audioPlayer = document.querySelector("audio");

let trackIndex = 0;

function playTrack(trackName) {
    audioPlayer.src = trackName;
    audioPlayer.play();
    audioPlayer.focus();
    trackIndex = trackList.indexOf(trackName);
}

for (let trackName of trackList) {
    const track = document.createElement("div");
    track.className = "track";
    track.innerText = trackName;
    track.onclick = function () {
        playTrack(trackName);
    };
    const br = document.createElement("br");
    document.body.appendChild(track);
    document.body.appendChild(br);
}

audioPlayer.addEventListener("ended", function () {
    trackIndex++;
    trackIndex %= trackList.length;
    playTrack(trackList[trackIndex]);
});
