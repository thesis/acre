import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";

const ECPair = ECPairFactory(ecc);

function getPublicKey(privateKey: string) {
  const keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, "hex"), {
    compressed: true,
  });

  const pubKey = keyPair.publicKey.toString("hex");
  const uncompressedPubKey = ECPair.fromPublicKey(Buffer.from(pubKey, "hex"), {
    compressed: false,
  }).publicKey.toString("hex");

  const publicKeyX = uncompressedPubKey.slice(2, 66);
  const publicKeyY = uncompressedPubKey.slice(66, 130);

  return {
    x: publicKeyX,
    y: publicKeyY,
    compressed: pubKey,
    uncompressed: uncompressedPubKey,
  };
}

export { getPublicKey };
