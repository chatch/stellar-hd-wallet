import assert from 'assert'
import bip39 from 'bip39'
import StellarHDWallet from '../src/stellar-hd-wallet'

const MNEMONIC =
  'asthma blouse security reform bread mesh roast garage ' +
  'win clock aerobic gauge emotion slender frozen profit ' +
  'duck uphold time perfect giggle drop turn movie'

const SEED_BUFFER = bip39.mnemonicToSeed(MNEMONIC)
const SEED_HEX = bip39.mnemonicToSeedHex(MNEMONIC)

const PUBLIC_KEY_0 = 'GBJCYUFJA7VA4GOZV7ZFVB7FGZTLVQTNS7JWJOWQVK6GN7DBUW7L5I5O'
const SECRET_KEY_0 = 'SC4SPBMTO3FAKHIW5EGMOX6UR6ILGBKHFWUPKN4QHEU426UBU4CKFNHW'

describe('StellarHDWallet', () => {
  describe('fromMnemonic', () => {
    it('creates wallet from mnemonic', () => {
      const wallet = StellarHDWallet.fromMnemonic(MNEMONIC)
      assert.equal(PUBLIC_KEY_0, wallet.getPublicKey(0))
      assert.equal(SECRET_KEY_0, wallet.getSecret(0))
    })
  })

  describe('fromSeed', () => {
    it('creates wallet from seed hex string', () => {
      const wallet = StellarHDWallet.fromSeed(SEED_HEX)
      assert.equal(PUBLIC_KEY_0, wallet.getPublicKey(0))
      assert.equal(SECRET_KEY_0, wallet.getSecret(0))
    })

    it('creates wallet from seed Buffer', () => {
      const wallet = StellarHDWallet.fromSeed(SEED_BUFFER)
      assert.equal(PUBLIC_KEY_0, wallet.getPublicKey(0))
      assert.equal(SECRET_KEY_0, wallet.getSecret(0))
    })
  })

  describe('generateMnemonic', () => {
    const assertInvalidEntropy = entropy => {
      try {
        StellarHDWallet.generateMnemonic(entropy)
        assert.fail(`expected error`)
      } catch (err) {
        assert.equal(err.message, 'Invalid entropy')
      }
    }

    it('generates a 24 word seed by default', () => {
      const mnemonic = StellarHDWallet.generateMnemonic()
      assert.equal(mnemonic.split(' ').length, 24)
    })

    it('generates a 12 word seed for 128 bits entropy', () => {
      const mnemonic = StellarHDWallet.generateMnemonic(128)
      assert.equal(mnemonic.split(' ').length, 12)
    })

    it('rejects entropy if not a multiple of 32', () => {
      assertInvalidEntropy(129)
      assertInvalidEntropy(200)
    })

    it('rejects entropy if out of range [128 - 256]', () => {
      assertInvalidEntropy(129)
      assertInvalidEntropy(257)
    })
  })
})
