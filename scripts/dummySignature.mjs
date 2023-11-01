import Client from "mina-signer";
const client = new Client({ network: "testnet" });

// Generate keys
let keypair = client.genKeys();

let signed = client.signMessage("hello", keypair.privateKey);
console.log(signed.signature);
