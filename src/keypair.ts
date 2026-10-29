/**
 * Minimal ed25519 keypair with Stellar strkey encoding.
 *
 * Replaces the `@stellar/stellar-base` dependency (deprecated and rolled
 * into `@stellar/stellar-sdk`, which is too heavy for this library) with
 * direct use of `@noble/ed25519` and the strkey format from the SEP
 * ecosystem:
 *
 *   - secret seed:   version byte 18<<3, base32 payload, prefix "S"
 *   - public key:    version byte  6<<3, base32 payload, prefix "G"
 *
 * Encoded keys are payload + 2-byte CRC16-XMODEM checksum, base32
 * (RFC 4648) encoded.
 */

import { getPublicKey, hashes } from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2.js";
import { base32 } from "@scure/base";

// @noble/ed25519 v3 no longer bundles sha512; plug it in from @noble/hashes
hashes.sha512 = sha512;

const VERSION_BYTE_ED25519_PUBLIC_KEY = 6 << 3; // "G"
const VERSION_BYTE_ED25519_SEED = 18 << 3; // "S"

const crc16Xmodem = (data: Uint8Array): number => {
  let crc = 0;
  for (const byte of data) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc;
};

const encodeStrkey = (versionByte: number, payload: Uint8Array): string => {
  const data = new Uint8Array(1 + payload.length + 2);
  data[0] = versionByte;
  data.set(payload, 1);
  const checksum = crc16Xmodem(data.subarray(0, 1 + payload.length));
  data[data.length - 2] = checksum & 0xff;
  data[data.length - 1] = (checksum >>> 8) & 0xff;
  return base32.encode(data);
};

/**
 * Class for an ed25519 keypair compatible with Stellar accounts.
 */
export class Keypair {
  private readonly seed: Uint8Array;
  private readonly pubKey: Uint8Array;

  private constructor(seed: Uint8Array, pubKey: Uint8Array) {
    this.seed = seed;
    this.pubKey = pubKey;
  }

  /**
   * Create a Keypair from a raw 32-byte ed25519 seed.
   * @param {Uint8Array} seed A 32-byte ed25519 seed
   * @return {Keypair} Keypair instance for the account
   */
  static fromRawEd25519Seed(seed: Uint8Array): Keypair {
    if (seed.length !== 32) {
      throw new Error("Seed must be 32 bytes long");
    }
    const ownedSeed = Uint8Array.from(seed);
    return new Keypair(ownedSeed, getPublicKey(ownedSeed));
  }

  /**
   * Get the raw 32-byte ed25519 seed.
   * @return {Uint8Array} Raw seed bytes
   */
  rawSeed(): Uint8Array {
    return Uint8Array.from(this.seed);
  }

  /**
   * Get the account public key as a Stellar strkey ("G...").
   * @return {string} Public key
   */
  publicKey(): string {
    return encodeStrkey(VERSION_BYTE_ED25519_PUBLIC_KEY, this.pubKey);
  }

  /**
   * Get the account secret seed as a Stellar strkey ("S...").
   * @return {string} Secret seed
   */
  secret(): string {
    return encodeStrkey(VERSION_BYTE_ED25519_SEED, this.seed);
  }
}

export default Keypair;
