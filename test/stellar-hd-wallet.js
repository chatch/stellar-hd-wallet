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
    describe('entropy', () => {
      const assertInvalidEntropy = entropy => {
        try {
          StellarHDWallet.generateMnemonic({entropyBits: entropy})
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
        const mnemonic = StellarHDWallet.generateMnemonic({entropyBits: 128})
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

    describe('language', () => {
      it('supports bip39 languages', () => {
        const chineseWordlist = bip39.wordlists['chinese_traditional']
        const mnemonic = StellarHDWallet.generateMnemonic({
          language: 'chinese_traditional',
        })

        const mnemonicWords = mnemonic.split(' ')
        assert.equal(mnemonicWords.length, 24)

        const wordsInDict = mnemonicWords.filter(
          w => chineseWordlist.indexOf(w) !== -1
        )
        assert.equal(wordsInDict.length, 24)
      })

      // issue #1
      it('supports korean language', () => {
        const koreanWordlist = bip39.wordlists['korean']
        const mnemonic = StellarHDWallet.generateMnemonic({
          language: 'korean',
        })

        const mnemonicWords = mnemonic.split(' ')
        assert.equal(mnemonicWords.length, 24)

        const wordsInDict = mnemonicWords.filter(
          w => koreanWordlist.indexOf(w) !== -1
        )
        assert.equal(wordsInDict.length, 24)
      })

      it('rejects unsupported bip39 languages with meaningful message', () => {
        try {
          StellarHDWallet.generateMnemonic({language: 'toki_pona'})
          assert.fail(`expected error`)
        } catch (err) {
          assert.equal(
            err.message,
            'Language toki_pona does not have a wordlist in the bip39 module'
          )
        }
      })
    })
  })

  describe('validateMnemonic', () => {
    const val = StellarHDWallet.validateMnemonic

    it('passes valid mnemonic input', () => {
      // 24 word
      assert.equal(val(MNEMONIC), true)
      // 12 word
      assert.equal(
        val(StellarHDWallet.generateMnemonic({entropyBits: 128})),
        true
      )
    })

    it('rejects empty mnemonic input', () => {
      assert.equal(val(), false)
      assert.equal(val(null), false)
      assert.equal(val(''), false)
      assert.equal(val('', 'korean'), false)
      assert.equal(val(null, 'korean'), false)
    })

    it('rejects short mnemonic input', () => {
      assert.equal(val('phrase'), false)
      assert.equal(val('phrase mass barrel'), false)
      assert.equal(val('phrase mass barrel', 'korean'), false)
    })

    it('rejects mnemonic with word not in wordlist', () => {
      const mnemonic = MNEMONIC.split(' ').slice(1)
      mnemonic.push('stellar')
      assert.equal(val(mnemonic.join(' ')), false)
    })

    it("rejects mnemonic input that isn't a multiple of 32 bits", () => {
      // 23 words
      const twentyThreeWords = StellarHDWallet.generateMnemonic()
        .split(' ')
        .slice(1)
        .join(' ')
      assert.equal(twentyThreeWords.split(' ').length, 23)
      assert.equal(val(twentyThreeWords), false)
    })
  })
})
