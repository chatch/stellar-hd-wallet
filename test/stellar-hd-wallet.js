import assert from 'assert'
import bip39 from 'bip39'
import StellarHDWallet from '../src/stellar-hd-wallet'

const MNEMONIC_ENGLISH =
  'asthma blouse security reform bread mesh roast garage ' +
  'win clock aerobic gauge emotion slender frozen profit ' +
  'duck uphold time perfect giggle drop turn movie'
const MNEMONIC_KOREAN =
  '한쪽 공개 학점 거액 재빨리 주민 해군 조절 종로 여론 성당 송아지'

const FROM_MNEMONIC_ENGLISH_PUBLIC_KEY_0 =
  'GBJCYUFJA7VA4GOZV7ZFVB7FGZTLVQTNS7JWJOWQVK6GN7DBUW7L5I5O'
const FROM_MNEMONIC_ENGLISH_SECRET_KEY_0 =
  'SC4SPBMTO3FAKHIW5EGMOX6UR6ILGBKHFWUPKN4QHEU426UBU4CKFNHW'

describe('StellarHDWallet', () => {
  describe('fromMnemonic', () => {
    it('creates wallet from mnemonic with defaults', () => {
      const wallet = StellarHDWallet.fromMnemonic(MNEMONIC_ENGLISH)
      assert.equal(wallet.getPublicKey(0), FROM_MNEMONIC_ENGLISH_PUBLIC_KEY_0)
      assert.equal(wallet.getSecret(0), FROM_MNEMONIC_ENGLISH_SECRET_KEY_0)
    })

    it('creates wallet from mnemonic with specific language', () => {
      const expectedPublic =
        'GCFWJRACE5TMTPAOF2DCOJXARZT23LW47C3YW22CAMWFJJJ25NYLCXND'
      const expectedSecret =
        'SBLSO6PNV55E7N3KEP5EML6L3BQT35F3LUKZL4ZY5T3UXWZZJW6DHQAO'
      const wallet = StellarHDWallet.fromMnemonic(
        MNEMONIC_KOREAN,
        undefined,
        'korean'
      )
      assert.equal(wallet.getPublicKey(0), expectedPublic)
      assert.equal(wallet.getSecret(0), expectedSecret)
    })

    it('creates wallet from mnemonic with password', () => {
      const expectedPublic =
        'GCQR32FP47DBS2TESSTXWGI5ZAEYV43SD45QNMTB6R7Q4CBONEMBMCC6'
      const expectedSecret =
        'SB3XPQZ5JMINM2VECDHH5YQWFH2RGMDC54JUHSLZZ2OAN4TNTZ4NDJMB'
      const wallet = StellarHDWallet.fromMnemonic(MNEMONIC_ENGLISH, 'password')
      assert.equal(wallet.getPublicKey(0), expectedPublic)
      assert.equal(wallet.getSecret(0), expectedSecret)
    })

    it('creates wallet from mnemonic with password AND specific language', () => {
      const expectedPublic =
        'GDHHKYVBHPMAQ7LEUXZSV5SJD67RRJNGTSVSQ5G76633XYYYMFYJG6DW'
      const expectedSecret =
        'SDMDPWEW2JXUH7CZMGZTHWYAV25JKV4QJCM44II5XYUBYBHKQUZVBTFF'
      const wallet = StellarHDWallet.fromMnemonic(
        MNEMONIC_KOREAN,
        '스텔라',
        'korean'
      )
      assert.equal(wallet.getPublicKey(0), expectedPublic)
      assert.equal(wallet.getSecret(0), expectedSecret)
    })

    const expectInvalidMnemonicFailure = mnemonic => {
      try {
        StellarHDWallet.fromMnemonic(mnemonic)
        assert.fail(`expected error`)
      } catch (err) {
        assert.equal(err.message, 'Invalid mnemonic (see bip39)')
      }
    }

    it('empty mnemonic throws', () => {
      expectInvalidMnemonicFailure()
      expectInvalidMnemonicFailure('')
      expectInvalidMnemonicFailure(null)
      expectInvalidMnemonicFailure(undefined, 'password', 'italian')
      expectInvalidMnemonicFailure('', 'password', 'italian')
    })

    it('invalid mnemonic throws', () => {
      expectInvalidMnemonicFailure('phrase') // short
      expectInvalidMnemonicFailure('stellar') // invalid word AND short
    })
  })

  describe('fromSeed', () => {
    it('creates wallet from seed hex string', () => {
      const seedHex = bip39.mnemonicToSeedHex(MNEMONIC_ENGLISH)
      const wallet = StellarHDWallet.fromSeed(seedHex)
      assert.equal(wallet.getPublicKey(0), FROM_MNEMONIC_ENGLISH_PUBLIC_KEY_0)
      assert.equal(wallet.getSecret(0), FROM_MNEMONIC_ENGLISH_SECRET_KEY_0)
    })

    it('creates wallet from seed Buffer', () => {
      const seedBuffer = bip39.mnemonicToSeed(MNEMONIC_ENGLISH)
      const wallet = StellarHDWallet.fromSeed(seedBuffer)
      assert.equal(wallet.getPublicKey(0), FROM_MNEMONIC_ENGLISH_PUBLIC_KEY_0)
      assert.equal(wallet.getSecret(0), FROM_MNEMONIC_ENGLISH_SECRET_KEY_0)
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
      assert.equal(val(MNEMONIC_ENGLISH), true)
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
      const mnemonic = MNEMONIC_ENGLISH.split(' ').slice(1)
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
