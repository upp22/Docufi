const express = require("express");
const Users = require("../models/users");
const Files = require("../models/Files");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const pdf = require("pdf-extraction");
const fs = require('fs');
const azureAnalyzeText = require('../models/textAnalysis');
const {raw} = require("express");


router.use(express.json());

router.get("/", (req, res) => {
    res.json({message: "File Controller"});
})

// Get pending files
router.get("/processing",  (req, res) => {
    Files.getFilesInProcess(3).then(result => {
        res.json(result);
    })
    .catch(err => {
        res.json({message: err});
    })
})

// Endpoint for text analysis. Sample JSON request body = {documents = ["sentence 1", "sentence 2"]}
router.post("/", upload.array("files"), async (req, res) => {
    const user = await Users.getUserByEmail(req.session.email)
    const uploadedItems = [];

    // Iterate over each file
    for (let file of req.files) {
        const { originalname, filename, path, size, mimetype } = file;
        const fileInfo = {
            'FileName' : filename,
            'OriginalName' : originalname,
            'FilePath' : path,
            'FileSize' : size,
            'FileFormat' : mimetype,
            'DateUploaded' : new Date(Date.now()).toISOString(),
            'UserId' : user.id
        };

        let dataBuf = fs.readFileSync(file.path);
        const extractedData = await pdf(dataBuf);

        // Write fileInfo to the db after getting file information
        const dbResult = await Files.addFile(fileInfo);
        uploadedItems.push(fileInfo);

        // Call API / Analyse Text
        analyzeAndProcessDocuments(extractedData.text).then(res => {
            fileInfo.TextAnalysis = res;
            fileInfo.Processed = true;

            // Flag file in db as completed
            Files.updateFileById(fileInfo, dbResult[0].id).then(async res => {
                req.io.emit('fileAnalysisComplete', {"file": fileInfo});

                // check for additional files processing
                const processChecker = await Files.getFilesInProcess(user.id);
                if (processChecker < 1) {
                    // Notify client all uploads have processed
                    req.io.emit('allFilesAnalysed');
                }
            });
        })



    }

    // verify # uploaded files were processed
    if (uploadedItems.length == Object.values(req.files).length) {
        res.json({
            message: "Uploaded successfully",
            fileInfo: uploadedItems
        });

    } else {
        res.status(406).json();
    }
});

async function analyzeAndProcessDocuments(text) {
    // split extracted text to conform to AzureCS requirements
    text = text.replace(/(\s+)/gm, " ");
    const textArr = text.match(/.{1,5000}/g);

    // Call AAT Service
    const rawResult = await azureAnalyzeText(textArr);

    // Output the raw result into the database
    return rawResult;
}

module.exports = router;