# stellar-hd-wallet

[![NPM Package](https://img.shields.io/npm/v/stellar-hd-wallet.svg?style=flat-square)](https://www.npmjs.org/package/stellar-hd-wallet)
[![Node.js CI](https://github.com/chatch/stellar-hd-wallet/actions/workflows/ci.yml/badge.svg)](https://github.com/chatch/stellar-hd-wallet/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/chatch/stellar-hd-wallet/badge)](https://scorecard.dev/viewer/?uri=github.com/chatch/stellar-hd-wallet)
[![Code Coverage](https://codecov.io/gh/chatch/stellar-hd-wallet/branch/master/graph/badge.svg)](https://codecov.io/gh/chatch/stellar-hd-wallet)

Key derivation for Stellar ([SEP-0005](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0005.md))

**Requirements:** Node.js >= 20.19. This is an **ESM-only** package
(`"type": "module"`), so `import` syntax is required. CommonJS consumers can
`require()` it directly on Node.js >= 20.19 (which supports `require()` of
ESM modules) or use `await import(...)`.

## Usage

```ts
import StellarHDWallet from "stellar-hd-wallet";

const mnemonic = StellarHDWallet.generateMnemonic();
const wallet = StellarHDWallet.fromMnemonic(mnemonic);

wallet.getPublicKey(0); // => GDKYMXOAJ5MK4EVIHHNWRGAAOUZMNZYAETMHFCD6JCVBPZ77TUAZFPKT
wallet.getSecret(0); // => SCVVKNLBHOWBNJYHD3CNROOA2P3K35I5GNTYUHLLMUHMHWQYNEI7LVED
wallet.getKeypair(0); // => Keypair for account 0
wallet.derive(`m/44'/148'/0'`); // => raw key for account 0 as a Buffer

// wallet instance from seeds
const seedHex =
  "794fc27373add3ac7676358e868a787bcbf1edfac83edcecdb34d7f1068c645dbadba563f3f3a4287d273ac4f052d2fc650ba953e7af1a016d7b91f4d273378f";
const seedBuffer = Buffer.from(seedHex, "hex");
StellarHDWallet.fromSeed(seedHex);
StellarHDWallet.fromSeed(seedBuffer);
// mnemonics with different lengths
StellarHDWallet.generateMnemonic(); // 24 words
StellarHDWallet.generateMnemonic({ entropyBits: 224 }); // 21 words
StellarHDWallet.generateMnemonic({ entropyBits: 160 }); // 18 words
StellarHDWallet.generateMnemonic({ entropyBits: 128 }); // 12 words

// validate a mnemonic
StellarHDWallet.validateMnemonic("too short and non wordlist words"); // false
```

## Keypair

This library's minimal `Keypair` class is exported from the package entry
(its constructor is private; the only public factory is
`fromRawEd25519Seed`):

```ts
import StellarHDWallet, { Keypair } from "stellar-hd-wallet";

const wallet = StellarHDWallet.fromMnemonic(mnemonic);
const kp = wallet.getKeypair(0); // Keypair for account 0

// or construct one directly from a raw 32-byte ed25519 seed
const kp2 = Keypair.fromRawEd25519Seed(kp.rawSeed());

kp2.rawSeed(); // => raw 32-byte ed25519 seed as Uint8Array
kp2.publicKey(); // => "G..." public key
kp2.secret(); // => "S..." secret seed
```

## Interoperability with @stellar/stellar-sdk / @stellar/stellar-base

`getKeypair()` returns this library's own minimal `Keypair` (with
`publicKey()`, `secret()` and `rawSeed()` accessors) so that no Stellar
network dependency is bundled. To continue with the full SDK API —
signing, transaction building, Horizon, etc. — convert to a SDK keypair
in one line:

```ts
import { Keypair as SdkKeypair } from "@stellar/stellar-sdk"; // or @stellar/stellar-base
// note: this is the *SDK's* Keypair, not this library's — hence the alias

const sdkKeypair = SdkKeypair.fromSecret(wallet.getSecret(0));
// or, from the raw seed without the strkey round-trip:
const sdkKeypair2 = SdkKeypair.fromRawEd25519Seed(
  wallet.getKeypair(0).rawSeed(),
);
```

## Mnemonic Language

Mnemonics can be generated in any language supported by the underlying [bip39 npm module](https://github.com/bitcoinjs/bip39).

The full list of language keys are under exports 'wordlists' [here](https://github.com/bitcoinjs/bip39/blob/master/index.js).

### Usage

```ts
import StellarHDWallet from "stellar-hd-wallet";

// traditional chinese - 24 words
StellarHDWallet.generateMnemonic({
  language: "chinese_traditional",
});
// => '省 从 唯 芽 激 顿 埋 愤 碳 它 炸 如 青 领 涨 骤 度 牲 朱 师 即 姓 讲 蒋'

// french - 12 words
StellarHDWallet.generateMnemonic({ language: "french", entropyBits: 128 });
// => 'directif terrible légume dérober science vision venimeux exulter abrasif vague mutuel innocent'
```

## Randomness

- NodeJs: crypto.randomBytes
- Browser: window.crypto.getRandomValues

(using [randombytes npm module](https://github.com/crypto-browserify/randombytes))

## Development

### Setup

```bash
pnpm install
```

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

## Tests

All [SEP-0005 test cases](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0005.md#test-cases) are exercised [here](https://github.com/chatch/stellar-hd-wallet/blob/master/test/sep0005.ts) against [these](https://github.com/chatch/stellar-hd-wallet/tree/master/test/data).
