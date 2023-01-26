/* eslint-disable no-console */
const Web3 = require('web3')
const config = require('../config.json');

const web3 = new Web3();


/*
User signs assetID with pvk
User generates QR for asset which encodes: 
- the asset ID
- the signed assetID
Client queries API for assetID and gets ownerID_A
Client recovers from signature ownerID_B
if (ownerID_A == ownerID_B)
  we're good!
*/



const sign_message = (assetID) => {

  const sig = web3.eth.accounts.sign(assetID, config.user_privateKey);
  console.log(assetID);
  console.log(sig.signature);
  return sig.signature;
}

const recover_message = (assetID, sig) => {
  const recovered = web3.eth.accounts.recover(assetID, sig);
  return recovered;
}


exports.sign_message = sign_message;
exports.recover_message = recover_message;