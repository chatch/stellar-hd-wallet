import bip39 from 'bip39'
import {derivePath, getMasterKeyFromSeed, getPublicKey} from 'ed25519-hd-key'
import {Keypair} from 'stellar-base'

const ENTROPY_BITS = 256 // = 24 word mnemonic

const INVALID_SEED = 'Invalid seed (must be a Buffer or hex string)'

/**
 * Class for SEP-0005 key derivation.
 * @see {@link https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0005.md|SEP-0005}
 */
class StellarHDWallet {
  /**
   * Instance from a BIP39 mnemonic string.
   * @param {string} mnemonic A BIP39 mnemonic
   * @param {string} [password] Optional mnemonic password
   */
  static fromMnemonic(mnemonic, password = undefined) {
    return new StellarHDWallet(bip39.mnemonicToSeedHex(mnemonic, password))
  }

  /**
   * Instance from a seed
   * @param {(string|Buffer)} binary seed
   */
  static fromSeed(seed) {
    let seedHex

    if (Buffer.isBuffer(seed)) seedHex = seed.toString('hex')
    else if (typeof seed === 'string') seedHex = seed
    else throw new TypeError(INVALID_SEED)

    return new StellarHDWallet(seedHex)
  }

  /**
   * Generate a mnemonic using BIP39
   * @param {Number} [entropyBits=256] Entropy bits
   */
  static generateMnemonic(entropyBits = ENTROPY_BITS) {
    return bip39.generateMnemonic(entropyBits)
  }

  /**
   * New instance from seed hex string
   * @param {string} seedHex Hex string
   */
  constructor(seedHex) {
    this.seedHex = seedHex
  }

  /**
   * Derive key given a full BIP44 path
   * @param {string} path BIP44 path string (eg. m/44'/148'/8')
   * @return {Buffer} Key binary as Buffer
   */
  derive(path) {
    const data = derivePath(path, this.seedHex)
    return data.key
  }

  /**
   * Get Stellar account keypair for child key at given index
   * @param {Number} index Account index into path m/44'/148'/{index}
   * @return {stellar-base.Keypair} Keypair instance for the account
   */
  getKeypair(index) {
    const key = this.derive(`m/44'/148'/${index}'`)
    return Keypair.fromRawEd25519Seed(key)
  }

  /**
   * Get public key for account at index
   * @param {Number} index Account index into path m/44'/148'/{index}
   * @return {string} Public key
   */
  getPublicKey(index) {
    return this.getKeypair(index).publicKey()
  }

  /**
   * Get secret for account at index
   * @param {Number} index Account index into path m/44'/148'/{index}
   * @return {string} Secret
   */
  getSecret(index) {
    return this.getKeypair(index).secret()
  }
}

export default StellarHDWallet
