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

require('dotenv').config();

const ethers = require('ethers')
var port = 3000;

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
        sampleFile.mv(__dirname +`/${filename}`, err => {
            if (err) {
                return res.status(500).send(err);
            }
            console.log("file added to the server successfully")
        })
    }
    async function uploaddatatoIPFS() {
        const token = "z6Mkp2zwq6s4rBYatnxp8rgb4NCs8Ey6TPKme8SYjDZoYzrL"
        const storage = new Web3Storage({token: token});
        const files = await getFilesFromPath(__dirname + `/${filename}`)
        console.log("Uploading files to IPFS, please wait !!")
        const cid = await storage.put(files);
        console.log(`IPFS CID: ${cid}`);
        return(cid)
    }
    async function storeDataInBlockchain(hash) {
        const API_URL = process.env.API_URL;
        const PRIVATE_KEY = process.env.PRIVATE_KEY;
        const CONTRACT_ADDRESS_1 = process.env.CONTRACT_ADDRESS;
        // Contract ABI
        const { abi } = require("./artifacts/contracts/IPFShashStorage.sol/IPFShashStorage.json");
        const provider = new ethers.providers.JsonRpcProvider(API_URL);
        // It calculates the blockchain address from private key
        const signer = new ethers.Wallet(PRIVATE_KEY, provider);
        //console.log(signer)
        const StorageContract = new ethers.Contract(CONTRACT_ADDRESS_1, abi, signer);

        let _hash = hash.toString();
        const isStored = await StorageContract.isFileStored(name);

        if(isStored == false) {
            console.log("storing the IPFS hash...");
            const tx = await StorageContract.upload(name, _hash);
            await tx.wait();
            const storedhash = await StorageContract.getIPFSHash(name);
            res.send(`IPFS has is stored in the smart contract: ${storedhash}`);
        }
        else {
            console.log("data is already stored for this file name");
            const IPFShash = await StorageContract.getIPFSHash(name);
            res.send(`the stored hash is: ${IPFShash}`)
        }
    }
    await moveFileToServer();
    await new Promise(resolve => setTimeout(resolve, 3000));
    let hash = await uploaddatatoIPFS();

    await storeDataInBlockchain(hash);
})
app.listen(port, function() {
    console.log('App is listening on port 3000');
})