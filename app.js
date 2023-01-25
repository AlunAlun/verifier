const express = require('express')
const verifier = require('./verifier/verifier.js')
const bp = require("body-parser");
const qr = require("qrcode");
const { request, gql } = require('graphql-request');
const config = require('./config.json');


const app = express()

app.set("view engine", "ejs");
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());

app.get('/', (req, res) => {

    res.render("index");

})

app.post("/scan", (req, res) => {

    const src_url = req.protocol + '://' + req.get('host');

    const assetID = req.body.assetID;

    if (assetID.length === 0) res.send("Empty Data!");

    const verify_url = src_url + "/verify/?assetID=" + assetID + "&sig=" + verifier.sign_message(assetID); 

    qr.toDataURL(verify_url, (err, src) => {
        if (err) res.send("Error occured");
      
        res.render("scan", { data: { src: src, verify_url: verify_url } });
        
    });
});

app.get('/verify', async (req, res) => {
    const reqAssetID = req.query.assetID;
    const reqSig = req.query.sig;
    const sigOwnerID = verifier.recover_message(reqAssetID, reqSig);
    
    const endpoint = 'https://api.staging.blackhole.gorengine.com/';

    const query = gql`query($assetID:String!){assetById(id:$assetID){ownerId}}`;
    
    const result = await request(endpoint, query, {
        assetID: reqAssetID
    });
    
    if (!result) {
        res.send("Error getting data from Freeverse API");
        return;
    }
    if (!result.assetById) {
        res.send("This asset does not exist!");
        return;
    }

    const apiOwnerID = result.assetById.ownerId;
    const serverAgreesWithSig = (apiOwnerID === sigOwnerID) ? true : false;
    
    console.log(serverAgreesWithSig);


    res.render("verify", { data: { assetID: reqAssetID, sigOwnerID: sigOwnerID, apiOwnerID: apiOwnerID, serverAgrees: serverAgreesWithSig } });

})

app.listen(process.env.PORT || config.port, () => {
  console.log(`Example app listening on port ${config.port}`)
})