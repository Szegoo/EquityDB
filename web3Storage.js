import { Web3Storage, getFilesFromPath } from 'web3.storage';
import fs from 'fs';
import https from 'https';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEIzMDYwMzk0ZjYwMjA1ZGIyMzcxNEZBMjFENDk4MDdGRTYzNTgxZDMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2MzEzNDczODIyODAsIm5hbWUiOiJteVRlc3RUb2tlbiJ9.licjLmWbejRo53lF5-MHuwEvIuxnkBbpLtTAUUXwi1Y";
export const uploadFile = async function uploadFile() {
    const storage = new Web3Storage({ token })
    const files = []

    const pathFiles = await getFilesFromPath("./data")
    files.push(...pathFiles)
    console.log(`Uploading ${files.length} files`)
    const cid = await storage.put(files)
    console.log('Content added with CID:', cid)
}
async function downloadFile(cid) {
    let url = `https://${cid}.ipfs.dweb.link/hello.txt`;
    var file = fs.createWriteStream('hello2.txt');
    const request = https.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            console.log('file downloaded');
            file.close();
        })
    }).on('error', (err) => {
        fs.unlink('hello2.txt');
        console.log(err);
    })
}
async function getFile(cid) {
    const client = new Web3Storage({token});
    const res = await client.get(cid);
    console.log(`Got a response! [${res.status}] ${res.statusText}\n`);
    const files = await res.files();
    for (const file of files) {
        console.log(`CID:${file.cid} -- PATH:${file.path} -- ${file.size}B`)
    }
}
export const getAllFiles = async function getAllFiles() {
    const client = new Web3Storage({token});
    for await (const upload of client.list()) {
        getFile(upload.cid);
        downloadFile(upload.cid)
    }
}


downloadFile("bafybeic6svhkwl3y2wvkj33weshyjjs5cbvgijh7yo3kjasyglrdwe2l74");