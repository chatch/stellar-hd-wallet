# stellar-hd-wallet

[![NPM Package](https://img.shields.io/npm/v/stellar-hd-wallet.svg?style=flat-square)](https://www.npmjs.org/package/stellar-hd-wallet)
[![Build Status](https://img.shields.io/travis/chatch/stellar-hd-wallet.svg?branch=master&style=flat-square)](https://travis-ci.org/chatch/stellar-hd-wallet)

Key derivation for Stellar ([SEP-0005](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0005.md))

## Usage

```js
import StellarHDWallet from 'stellar-hd-wallet'

const mnemonic = StellarHDWallet.generateMnemonic()
const wallet = StellarHDWallet.fromMnemonic(mnemonic)

wallet.getPublicKey(0) // => GDKYMXOAJ5MK4EVIHHNWRGAAOUZMNZYAETMHFCD6JCVBPZ77TUAZFPKT
wallet.getSecret(0) // => SCVVKNLBHOWBNJYHD3CNROOA2P3K35I5GNTYUHLLMUHMHWQYNEI7LVED
wallet.getKeypair(0) // => StellarBase.Keypair for account 0
wallet.derive(`m/44'/148'/7'`) // => key for account 0 as a Buffer

// wallet instance from seeds
const seedHex =
  '794fc27373add3ac7676358e868a787bcbf1edfac83edcecdb34d7f1068c645dbadba563f3f3a4287d273ac4f052d2fc650ba953e7af1a016d7b91f4d273378f'
const seedBuffer = Buffer.from(seedHex)
StellarHDWallet.fromSeed(seedHex)
StellarHDWallet.fromSeed(seedBuffer)

// mnemonics with different lengths
StellarHDWallet.generateMnemonic() // 24 words
StellarHDWallet.generateMnemonic(224) // 21 words
StellarHDWallet.generateMnemonic(160) // 18 words
StellarHDWallet.generateMnemonic(128) // 12 words
```
