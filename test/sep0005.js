import assert from 'assert'
import has from 'lodash/has'
import StellarHDWallet from '../src/stellar-hd-wallet'

const assertKeypair = (actualKeypair, expectedPublicKey, expectedSecret) => {
  assert.equal(actualKeypair.publicKey(), expectedPublicKey)
  assert.equal(actualKeypair.secret(), expectedSecret)
}

const specTestCase = num => () => {
  const testCase = require(`./data/sep0005-testcase-${num}.json`)

  const wallet = has(testCase, 'passphrase')
    ? StellarHDWallet.fromMnemonic(testCase.seedWords, testCase.passphrase)
    : StellarHDWallet.fromMnemonic(testCase.seedWords)

  it('derives expected parent key', () => {
    assert.equal(
      wallet.derive(`m/44'/148'`).toString('hex'),
      testCase.parentKey
    )
  })

  it('derives expected child keys', () => {
    testCase.keypairs.forEach(([publicKey, secret], index) =>
      assertKeypair(wallet.getKeypair(index), publicKey, secret)
    )
  })
}

describe('SEP-0005', () => {
  describe('Test Case 1', specTestCase(1))
  describe('Test Case 2', specTestCase(2))
  describe('Test Case 3', specTestCase(3))
  describe('Test Case 4', specTestCase(4))
  describe('Test Case 5', specTestCase(5))
})
