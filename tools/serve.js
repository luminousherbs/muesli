import express from "express";
import path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { parseFile } from "music-metadata";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function formatHTML(baseHTML, data) {
    if (!data.music) console.error("no music was supplied");
    // TODO: replace with a POST request
    return baseHTML.toString().replaceAll(
        "<!-- <music> -->",
        JSON.stringify({
            trackList: data.music,
        })
    );
}

app.use(express.json()); // parse json

// heart
app.post("/api/heart/", async (req, res) => {
    // req.body contains the JSON data sent in the request
    const heartData = await fs.readFile("data/heart.json");
    const heartedTracks = JSON.parse(heartData);
    console.log(heartedTracks);
    if (heartedTracks.includes(req.body.path)) {
        res.status(200); // i think this is the correct code to send?
        res.json({ status: "unmodified" });
    } else {
        heartedTracks.push(req.body.path);
        console.log(heartedTracks);
        await fs.writeFile("data/heart.json", JSON.stringify(heartedTracks));
        res.status(200);
        res.json({ status: "success" });
    }
});

// middleware
// this should be placed after POST requests, so POST requests get tried first
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
    const files = {};
    try {
        const filePaths = await fs.readdir(folderPath);
        for (const filePath of filePaths) {
            const fullFilePath = path.join(folderPath, filePath);
            parseFile(fullFilePath).then((fileData) => {
                const trackData = {};
                trackData.path = fullFilePath;
                trackData.date = fileData.format.creationTime;
                trackData.artists = fileData.common.artists;
                trackData.album = fileData.common.album;
                trackData.title = fileData.common.title;

                // binary images aren't supported in json
                // so we have to convert to base 64 first

                // i have no idea why the image is in a 1 element array
                // but it is, so we have to get the 0th and only element of that array
                const binaryImageData = fileData.common.picture[0].data;

                const base64ImageData =
                    Buffer.from(binaryImageData).toString("base64");
                trackData.image = {
                    format: binaryImageData.format,
                    data: base64ImageData,
                };
                files[fullFilePath] = trackData;
            });
        }
    } catch (err) {
        console.error("Error reading folder:", err);
        return;
    }
    return files;
}

const musicFiles = await findFiles("./data/music/");
