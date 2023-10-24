import { signMessage, splitSignature, getPublicKey } from "./bitcoin";

const hexPrivateKey =
  "9bedb7781511d3b3072fcc14b963610ae0fd23712085fafac1117c9b6e9bd589";

function messageToSignTemplate(publicKeyX: string, publicKeyY: string) {
  return `CLAIM_TO:${publicKeyX}${publicKeyY}`;
}

function main() {
  const { x, y, uncompressed, compressed } = getPublicKey(hexPrivateKey);

  console.log("Compressed public key: ", compressed);
  console.log("Uncompressed public key: ", uncompressed);
  console.log("Public key x: ", x);
  console.log("Public key y: ", y);

  const messageToSign = messageToSignTemplate(x, y);

  const signature = signMessage(messageToSign, hexPrivateKey);

  console.log("Bitcoin message signature: ", signature);

  const { v, r, s, recoveryId } = splitSignature(signature);
  console.log(`Signature parameters:\n
  - v: ${v}\n
  - recovery id: ${recoveryId} \n
  - r: ${r}\n
  - s: ${s}\n
  `);
}

main();
