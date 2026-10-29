/**
 * This key derivation code was copied and adapted from:
 *   https://github.com/alepop/ed25519-hd-key/blob/master/src/index.ts
 * in order to remove js-nacl dependency which caused browser errors with
 * content-security-policy - see #12 for details. This modified implementation
 * is a pure JS implementation.
 *
 * The original ed25519-hd-key module is licensed under "GPL-3".
 */

import { hmac } from "@noble/hashes/hmac.js";
import { sha512 } from "@noble/hashes/sha2.js";

const ED25519_CURVE = "ed25519 seed";
const HARDENED_OFFSET = 0x80000000;
const MAX_HARDENED_INDEX = HARDENED_OFFSET - 1;

export interface KeyData {
  key: Uint8Array;
  chainCode: Uint8Array;
}

export const derivePath = (path: string, seed: string): KeyData => {
  if (!isValidPath(path)) {
    throw new Error("Invalid derivation path");
  }
  const { key, chainCode } = getMasterKeyFromSeed(seed);
  const segments = path
    .split("/")
    .slice(1)
    .map(replaceDerive)
    .map((el) => parseInt(el, 10));
  return segments.reduce(
    (parentKeys, segment) => CKDPriv(parentKeys, segment + HARDENED_OFFSET),
    { key, chainCode },
  );
};

const getMasterKeyFromSeed = (seed: string): KeyData => {
  const I = hmac(sha512, Buffer.from(ED25519_CURVE), Buffer.from(seed, "hex"));
  const IL = I.slice(0, 32);
  const IR = I.slice(32);
  return {
    key: IL,
    chainCode: IR,
  };
};

const CKDPriv = ({ key, chainCode }: KeyData, index: number): KeyData => {
  const indexBuffer = Buffer.allocUnsafe(4);
  indexBuffer.writeUInt32BE(index, 0);
  const data = Buffer.concat([Buffer.alloc(1, 0), key, indexBuffer]);
  const I = hmac(sha512, chainCode, data);
  const IL = I.slice(0, 32);
  const IR = I.slice(32);
  return {
    key: IL,
    chainCode: IR,
  };
};

const replaceDerive = (val: string): string => val.replace(/'/g, "");
const pathRegex = new RegExp("^m(\\/[0-9]+')+$");
const isValidPath = (path: string): boolean => {
  if (!pathRegex.test(path)) {
    return false;
  }
  return path
    .split("/")
    .slice(1)
    .map(replaceDerive)
    .map((el) => parseInt(el, 10))
    .every(
      (segment) =>
        Number.isSafeInteger(segment) &&
        segment >= 0 &&
        segment <= MAX_HARDENED_INDEX,
    );
};
