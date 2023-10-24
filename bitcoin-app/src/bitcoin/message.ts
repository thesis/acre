import { sign } from "bitcoinjs-message";

function signMessage(
  message: string,
  hexPrivateKey: string,
  isCompressed: boolean = true
) {
  return sign(
    message,
    Buffer.from(hexPrivateKey, "hex"),
    isCompressed
  ).toString("hex");
}

// The recover id equal to `2` or `3` is a super rare edge-case- in practice
// only ever be seen in specifically generated examples. In 99.99999999% of the
// cases it is false.
const vToRecoveryIdMap: Record<number, number> = {
  // Uncompressed
  27: 0,
  28: 1,
  29: 2,
  30: 3,
  // Compressed
  31: 0,
  32: 1,
  33: 2,
  34: 3,
};

function splitSignature(signature: string) {
  // First byte.
  const _v = signature.slice(0, 2);
  const v = Number(`0x${_v}`);
  // Next 32 bytes.
  const r = signature.slice(2, 66);
  // Final 32 bytes.
  const s = signature.slice(66, 130);

  return {
    v,
    recoveryId: vToRecoveryIdMap[v],
    r,
    s,
  };
}

export { splitSignature, signMessage };
