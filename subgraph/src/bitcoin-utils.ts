/* eslint-disable max-classes-per-file */
import { log, BigInt, ByteArray, crypto } from "@graphprotocol/graph-ts"

// A Copy of the tbtcscan.com source code.
// https://github.com/suntzu93/threshold-tBTC/blob/master/src/utils/bitcoin_utils.ts

class VarIntTuple {
  dataLength: BigInt

  number: BigInt
}

class TupleScriptSig {
  dataLength: BigInt

  scriptSigLen: BigInt
}

export function safeSlice(
  buf: Uint8Array,
  first: i32 = 0,
  last: i32 = buf.length,
): Uint8Array {
  let start: i32
  let end: i32

  if (first === 0) {
    start = 0
  }
  if (last === buf.length) {
    end = buf.length
  }

  if (first > i64.MAX_VALUE) {
    log.error("BigInt argument out of safe number range", [])
  }
  if (last > i64.MAX_VALUE) {
    log.error("BigInt argument out of safe number range", [])
  }

  start = first
  end = last

  if (end > buf.length) {
    log.error("Tried to slice past end of array", [])
  }
  if (start < 0 || end < 0) {
    log.error("Slice must not use negative indexes", [])
  }
  if (start >= end) {
    log.error("Slice must not have 0 length", [])
  }
  return buf.slice(start, end)
}

/**
 *
 * Changes the endianness of a byte array
 * Returns a new, backwards, byte array
 */
function reverseEndianness(uint8Arr: Uint8Array): Uint8Array {
  const newArr = safeSlice(uint8Arr)
  return newArr.reverse()
}

export function bytesToUint(b: Uint8Array): i32 {
  let number: i32 = 0

  for (let i: i32 = 0; i < b.length; i = +i) {
    number += i32(b[i]) * i32(2) ** (8 * (b.length - (i + 1)))
  }

  return number
}

/**
 *
 * Determines the length of a VarInt in bytes
 * A VarInt of >1 byte is prefixed with a flag indicating its length
 */
function determineVarIntDataLengthAt(data: Uint8Array, flag: u32): u32 {
  if (data[flag] === 0xff) {
    return 8 // one-byte flag, 8 bytes data
  }
  if (data[flag] === 0xfe) {
    return 4 // one-byte flag, 4 bytes data
  }
  if (data[flag] === 0xfd) {
    return 2 // one-byte flag, 2 bytes data
  }

  return 0 // flag is data
}

export function parseVarIntAt(b: Uint8Array, index: u32): VarIntTuple {
  const dataLength = determineVarIntDataLengthAt(b, index)
  if (dataLength === 0) {
    return {
      dataLength: BigInt.fromI32(0),
      number: BigInt.fromI32(b[index]),
    }
  }
  if (b.length < 1 + dataLength + index) {
    log.error("Read overrun during VarInt parsing", [])
  }

  const number = bytesToUint(
    reverseEndianness(safeSlice(b, 1, 1 + dataLength + index)),
  )

  return {
    dataLength: BigInt.fromI32(dataLength),
    number: BigInt.fromI64(number),
  }
}

export function parseVarInt(b: Uint8Array): VarIntTuple {
  return parseVarIntAt(b, 0)
}

/**
 *
 * Extracts the value bytes from the output in a tx
 * Value is an 8-byte little-endian number
 */
function extractValueLEAt(output: Uint8Array, index: BigInt): Uint8Array {
  return safeSlice(output, index.toI32(), 8)
}

/**
 *
 * Extracts the outpoint tx id from an input
 * 32 byte tx id
 * */
export function extractInputTxIdLEAt(
  input: Uint8Array,
  inputStartingIndex: BigInt,
): Uint8Array {
  return safeSlice(
    input,
    inputStartingIndex.toI32(),
    inputStartingIndex.toI32() + 32,
  )
}

/**
 *
 * Extracts the LE tx input index from the input in a tx
 * 4 byte tx index
 */
export function extractTxIndexLEAt(
  input: Uint8Array,
  inputStartingIndex: BigInt,
): Uint8Array {
  return safeSlice(
    input,
    inputStartingIndex.toI32() + 32,
    inputStartingIndex.toI32() + 32 + 4,
  )
}

/**
 *
 * Extracts the LE tx input index from the input in a tx
 * 4 byte tx index
 *
 */
export function extractTxIndexAt(
  input: Uint8Array,
  inputStartingIndex: BigInt,
): BigInt {
  const leIndex = extractTxIndexLEAt(input, inputStartingIndex)
  const beIndex = reverseEndianness(leIndex)
  return BigInt.fromI64(bytesToUint(beIndex))
}

/**
 *
 * Determines the length of a scriptSig in an input
 * Will return 0 if passed a witness input
 */
export function extractScriptSigLenAt(
  input: Uint8Array,
  inputStartingIndex: BigInt,
): TupleScriptSig {
  if (input.length < 37) {
    throw new Error("Read overrun")
  }
  const varIntTuple = parseVarInt(
    safeSlice(input, inputStartingIndex.toI32() + 36),
  )
  return {
    dataLength: varIntTuple.dataLength,
    scriptSigLen: varIntTuple.number,
  }
}

/**
 *  Determines the length of an input from its scriptsig
 *  36 for outpoint, 1 for scriptsig length, 4 for sequence
 */
export function determineInputLengthAt(
  input: Uint8Array,
  inputStartingIndex: BigInt,
): BigInt {
  const tupleScriptSig = extractScriptSigLenAt(input, inputStartingIndex)
  return BigInt.fromI32(41)
    .plus(tupleScriptSig.dataLength)
    .plus(tupleScriptSig.scriptSigLen)
}

export function determineOutputLengthAt(
  output: Uint8Array,
  outputStartingIndex: BigInt,
): BigInt {
  if (output.length < 9) {
    throw new Error("Read overrun")
  }

  const varIntTuple = parseVarIntAt(output, 8 + outputStartingIndex.toU32())

  // 8 byte value, 1 byte for len itself
  return BigInt.fromI64(8 + 1)
    .plus(varIntTuple.dataLength)
    .plus(varIntTuple.number)
}

function determineOutputLength(output: Uint8Array): i32 {
  if (output.length < 9) {
    throw new RangeError("Read overrun")
  }

  const data = parseVarInt(safeSlice(output, 8))

  // 8 byte value, 1 byte for len itself
  return 8 + 1 + data.dataLength.toU32() + data.number.toU32()
}

export function extractOutputAtIndex(vout: Uint8Array, index: i32): Uint8Array {
  const data = parseVarInt(vout)

  if (index >= data.number.toI32()) {
    log.error("Vin read overrun", [])
  }

  let len = 0
  let offset = BigInt.fromI32(1).plus(data.dataLength)

  for (let i = 0; i <= index; i += 1) {
    const remaining = safeSlice(vout, offset.toI32(), vout.length)
    len = determineOutputLength(remaining)
    if (i !== index) {
      offset = offset.plus(BigInt.fromI32(len))
    }
  }
  return safeSlice(
    vout,
    offset.toI32(),
    offset.plus(BigInt.fromI32(len)).toI32(),
  )
}

export function extractValueAt(output: Uint8Array, index: BigInt): BigInt {
  const leValue = extractValueLEAt(output, index)
  const beValue = reverseEndianness(leValue)
  return BigInt.fromI32(bytesToUint(beValue))
}

export function calculateOutputScriptHash(
  redemptionTxOutputVector: Uint8Array,
  outputScriptStart: i32,
  scriptLength: i32,
): ByteArray {
  const outputScriptData = redemptionTxOutputVector.subarray(
    outputScriptStart,
    outputScriptStart + scriptLength,
  )
  const byteArray = new ByteArray(outputScriptData.length)
  for (let i = 0; i < outputScriptData.length; i += 1) {
    byteArray[i] = outputScriptData[i]
  }
  return crypto.keccak256(byteArray)
}
