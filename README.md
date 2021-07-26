# stellar-hd-wallet

[![NPM Package](https://img.shields.io/npm/v/stellar-hd-wallet.svg?style=flat-square)](https://www.npmjs.org/package/stellar-hd-wallet)
[![Build Status](https://img.shields.io/travis/chatch/stellar-hd-wallet.svg?branch=master&style=flat-square)](https://travis-ci.com/chatch/stellar-hd-wallet)

Key derivation for Stellar ([SEP-0005](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0005.md))

## Usage

```js
import StellarHDWallet from 'stellar-hd-wallet'

const mnemonic = StellarHDWallet.generateMnemonic()
const wallet = StellarHDWallet.fromMnemonic(mnemonic)

wallet.getPublicKey(0) // => GDKYMXOAJ5MK4EVIHHNWRGAAOUZMNZYAETMHFCD6JCVBPZ77TUAZFPKT
wallet.getSecret(0) // => SCVVKNLBHOWBNJYHD3CNROOA2P3K35I5GNTYUHLLMUHMHWQYNEI7LVED
wallet.getKeypair(0) // => StellarBase.Keypair for account 0
wallet.derive(`m/44'/148'/0'`) // => raw key for account 0 as a Buffer

// wallet instance from seeds
const seedHex =
  '794fc27373add3ac7676358e868a787bcbf1edfac83edcecdb34d7f1068c645dbadba563f3f3a4287d273ac4f052d2fc650ba953e7af1a016d7b91f4d273378f'
const seedBuffer = Buffer.from(seedHex)
StellarHDWallet.fromSeed(seedHex)
StellarHDWallet.fromSeed(seedBuffer)

// mnemonics with different lengths
StellarHDWallet.generateMnemonic() // 24 words
StellarHDWallet.generateMnemonic({entropyBits: 224}) // 21 words
StellarHDWallet.generateMnemonic({entropyBits: 160}) // 18 words
StellarHDWallet.generateMnemonic({entropyBits: 128}) // 12 words

// validate a mnemonic
StellarHDWallet.validateMnemonic('too short and non wordlist words') // false
```

## Mnemonic Language

Mnemonics can be generated in any language supported by the underlying [bip39 npm module](https://github.com/bitcoinjs/bip39).

The full list of language keys are under exports 'wordlists' [here](https://github.com/bitcoinjs/bip39/blob/master/index.js).

### Usage

```js
import StellarHDWallet from 'stellar-hd-wallet'

// traditional chinese - 24 words
StellarHDWallet.generateMnemonic({
  language: 'chinese_traditional',
})
// => '省 从 唯 芽 激 顿 埋 愤 碳 它 炸 如 青 领 涨 骤 度 牲 朱 师 即 姓 讲 蒋'

// french - 12 words
StellarHDWallet.generateMnemonic({language: 'french', entropyBits: 128})
// => 'directif terrible légume dérober science vision venimeux exulter abrasif vague mutuel innocent'
```

## Randomness

* NodeJs: crypto.randomBytes
* Browser: window.crypto.getRandomValues

(using [randombytes npm module](https://github.com/crypto-browserify/randombytes))

## Tests

All [SEP-0005 test cases](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0005.md#test-cases) are exercised [here](https://github.com/chatch/stellar-hd-wallet/blob/master/test/sep0005.js) against [these](https://github.com/chatch/stellar-hd-wallet/tree/master/test/data).
