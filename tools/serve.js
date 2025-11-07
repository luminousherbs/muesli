const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const app = express();

const port = 8000;

// common mime types
// this allows content to be sent as the correct file type
const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
};

function createMusicElements(musicFiles) {
    if (!Array.isArray(musicFiles))
        console.error("createMusicElements expected array but got non-array");

    let elements = "";

    for (let file of musicFiles) {
        // we shouldnt be writing functions inside strings
        // this is just placeholder logic
        elements += `<span onclick="const audio = document.querySelector('audio'); audio.src = '${file}'; audio.play(); audio.focus();">${file}</span><br>`;
    }

    return elements;
}

function formatHTML(baseHTML, data) {
    if (!data.music) console.error("no music was supplied");
    return baseHTML
        .toString()
        .replaceAll(
            "<!-- <music> -->",
            JSON.stringify({
                trackList: data.music,
            }) /* createMusicElements(data.music) */
        );
}

app.use(express.json()); // parse json

// middleware
app.use(async (req, res, next) => {
    try {
        const filePath = path.join(
            __dirname,
            "../", // serve from one level up, since we're in a folder
            req.url === "/" ? "index.html" : req.url // default to index.html if no path is provided
        );
        const fileContent = await fs.readFile(filePath);

        // set mime type based on extension
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || "application/octet-stream";
        res.setHeader("Content-Type", contentType);

        // send text files as strings and binary files as buffers
        if (
            contentType.startsWith("text/") ||
            contentType.includes("json") ||
            ext === ".js"
        ) {
            console.log("sending text");
            res.send(formatHTML(fileContent, { music: musicFiles }));
        } else {
            console.log("sending binary file");
            res.send(fileContent);
        }
    } catch (error) {
        next(error);
    }
});

// handle errors
app.use((err, req, res, next) => {
    console.error(err);
    res.status(404).json({ status: "error", message: "File not found" });
});

app.listen(port, () => {
    console.log(`Serving on ${port}`);
});

// load all songs
async function findFiles(folderPath) {
    const foundFiles = [];
    try {
        const files = await fs.readdir(folderPath);
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            foundFiles.push(filePath);
        }
    } catch (err) {
        console.error("Error reading folder:", err);
        return;
    }
    return foundFiles;
}

let musicFiles;
findFiles("./data/music/dark-synth").then((res) => {
    musicFiles = res;
});
