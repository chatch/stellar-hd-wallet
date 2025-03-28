import bip39 from "bip39";
import { derivePath } from "./hd-key.js";
import { Keypair } from "@stellar/stellar-base";

const ENTROPY_BITS = 256; // = 24 word mnemonic

const INVALID_SEED = "Invalid seed (must be a Buffer or hex string)";
const INVALID_MNEMONIC = "Invalid mnemonic (see bip39)";

interface MnemonicOptions {
  entropyBits?: number;
  language?: string;
  rngFn?: (size: number) => Buffer;
}

/**
 * Class for SEP-0005 key derivation.
 * @see {@link https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0005.md|SEP-0005}
 */
class StellarHDWallet {
  private seedHex: string;

  /**
   * Instance from a BIP39 mnemonic string.
   * @param {string} mnemonic A BIP39 mnemonic
   * @param {string} [password] Optional mnemonic password
   * @param {string} [language='english'] Optional language of mnemonic
   * @throws {Error} Invalid Mnemonic
   */
  static fromMnemonic(mnemonic: string, password?: string, language = "english"): StellarHDWallet {
    if (!StellarHDWallet.validateMnemonic(mnemonic, language)) {
      throw new Error(INVALID_MNEMONIC);
    }
    return new StellarHDWallet(bip39.mnemonicToSeedSync(mnemonic, password).toString("hex"));
  }

  /**
   * Instance from a seed
   * @param {(string|Buffer)} seed binary seed
   * @throws {TypeError} Invalid seed
   */
  static fromSeed(seed: string | Buffer): StellarHDWallet {
    let seedHex: string;

    if (Buffer.isBuffer(seed)) seedHex = seed.toString("hex");
    else if (typeof seed === "string") seedHex = seed;
    else throw new TypeError(INVALID_SEED);

    return new StellarHDWallet(seedHex);
  }

  /**
   * Generate a mnemonic using BIP39
   * @param {Object} props Properties defining how to generate the mnemonic
   * @param {Number} [props.entropyBits=256] Entropy bits
   * @param {string} [props.language='english'] name of a language wordlist as
   *          defined in the 'bip39' npm module. See module.exports.wordlists:
   *          here https://github.com/bitcoinjs/bip39/blob/master/index.js
   * @param {function} [props.rng] RNG function (default is crypto.randomBytes)
   * @throws {TypeError} Language not supported by bip39 module
   * @throws {TypeError} Invalid entropy
   */
  static generateMnemonic({
    entropyBits = ENTROPY_BITS,
    language = "english",
    rngFn
  }: MnemonicOptions = {}): string {
    if (language && !(language in bip39.wordlists))
      throw new TypeError(
        `Language ${language} does not have a wordlist in the bip39 module`
      );
    const wordlist = bip39.wordlists[language];
    return bip39.generateMnemonic(entropyBits, rngFn, wordlist);
  }

  /**
   * Validate a mnemonic using BIP39
   * @param {string} mnemonic A BIP39 mnemonic
   * @param {string} [language='english'] name of a language wordlist as
   *          defined in the 'bip39' npm module. See module.exports.wordlists:
   *          here https://github.com/bitcoinjs/bip39/blob/master/index.js
   * @throws {TypeError} Language not supported by bip39 module
   */
  static validateMnemonic(mnemonic?: string, language = "english"): boolean {
    if (!mnemonic) return false;
    
    if (language && !(language in bip39.wordlists))
      throw new TypeError(
        `Language ${language} does not have a wordlist in the bip39 module`
      );
    const wordlist = bip39.wordlists[language];
    return bip39.validateMnemonic(mnemonic, wordlist);
  }

  /**
   * New instance from seed hex string
   * @param {string} seedHex Hex string
   */
  constructor(seedHex: string) {
    this.seedHex = seedHex;
  }

  /**
   * Derive key given a full BIP44 path
   * @param {string} path BIP44 path string (eg. m/44'/148'/8')
   * @return {Buffer} Key binary as Buffer
   */
  derive(path: string): Buffer {
    const data = derivePath(path, this.seedHex);
    return data.key;
  }

  /**
   * Get Stellar account keypair for child key at given index
   * @param {Number} index Account index into path m/44'/148'/{index}
   * @return {stellar-base.Keypair} Keypair instance for the account
   */
  getKeypair(index: number): Keypair {
    const key = this.derive(`m/44'/148'/${index}'`);
    return Keypair.fromRawEd25519Seed(key);
  }

  /**
   * Get public key for account at index
   * @param {Number} index Account index into path m/44'/148'/{index}
   * @return {string} Public key
   */
  getPublicKey(index: number): string {
    return this.getKeypair(index).publicKey();
  }

  /**
   * Get secret for account at index
   * @param {Number} index Account index into path m/44'/148'/{index}
   * @return {string} Secret
   */
  getSecret(index: number): string {
    return this.getKeypair(index).secret();
  }
}

export default StellarHDWallet;