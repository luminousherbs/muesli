// load all songs
async function listFiles(folderPath) {
    try {
        const files = await fs.readdir(folderPath);
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            console.log("Found file:", filePath);
        }
    } catch (err) {
        console.error("Error reading folder:", err);
    }
}

listFiles("./data/music/dark synth");
