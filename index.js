const express = require('express')
const fileUpload = require('express-fileupload');
const { Web3Storage, getFilesFromPath  } = require('web3.storage');
const app = express();
app.use(express.static(__dirname));
app.use(
  fileUpload({
    extended: true,
  })
);
app.use(express.json());
const path = require("path");

// require('dotenv').config();

const ethers = require('ethers')
var post = 3000;

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"))
});
app.get("/index.html", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"))
});
app.post("/uploadData", async (req, res) => {
    var name = req.body.filename;
    var sampleFile = req.files.file1;
    var filename = req.files.file1.name;

    async function moveFileToServer() {
        sampleFile.mv(__dirname, +`/${filename}`, err => {
            if (err) {
                return res.status(500).send(err);
            }
            console.log("file added to the server successfully")
        })
    }
    async function uploaddatatoIPFS() {
        const token = ""
    }
})