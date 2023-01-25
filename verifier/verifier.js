/* eslint-disable no-console */
const identity = require('freeverse-crypto-js');
const Utils = require('web3-utils');
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
  return sig.signature;
}

const recover_message = (assetID, sig) => {
  const recovered = web3.eth.accounts.recover(assetID, sig);
  return recovered;
}



const test_round_trip = async () => {
  // Client wants to send data to User, encrypted so that only User can decrypt.
  // User publishes his publicKey. Client encrypts using it.
  const UserPublicKey = identity.publicKeyFromPrivateKey(user_privateKey);
  console.log(UserPublicKey);
  console.log(user_address);

  // First client encrypts the message, the hash of which is stored on the server somewhere
  // This is json object that Client wants to send:
  const jsonObject = { msg: hashed_message };
  console.log('Object that Client wants to send to User: ', jsonObject);

  //Client now encrypts this
  const encryptedString = await identity.encryptWithPublicKey(
    JSON.stringify(jsonObject),
    UserPublicKey,
  );
  console.log('Client actually sends this string: ', encryptedString);

  //User decrypts the message, only they can
  const UserPrivateKey = user_privateKey;

  const decryptedString = await identity.decryptWithPrivateKey(encryptedString, UserPrivateKey);
  const decryptedJson = JSON.parse(decryptedString);
  console.log('User recovers the original json: ', decryptedJson);
  if (decryptedJson.msg === hashed_message) {
    console.log("SUCCESS: " +decryptedJson.msg);
  }
  else {
    console.log("message was not as expected!");
  }
};

exports.sign_message = sign_message;
exports.recover_message = recover_message;