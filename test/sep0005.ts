import assert from 'assert';
import lodash from 'lodash';
const { has } = lodash;
import { Keypair } from '@stellar/stellar-base';
import StellarHDWallet from '../src/stellar-hd-wallet.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestCase {
  seedWords: string;
  passphrase?: string;
  parentKey: string;
  keypairs: [string, string][];
}

const assertKeypair = (actualKeypair: Keypair, expectedPublicKey: string, expectedSecret: string) => {
  assert.equal(actualKeypair.publicKey(), expectedPublicKey);
  assert.equal(actualKeypair.secret(), expectedSecret);
};

const specTestCase = (num: number) => () => {
  const testCaseJson = fs.readFileSync(path.join(__dirname, `./data/sep0005-testcase-${num}.json`), 'utf-8');
  const testCase = JSON.parse(testCaseJson) as TestCase;

  const wallet = has(testCase, 'passphrase')
    ? StellarHDWallet.fromMnemonic(testCase.seedWords, testCase.passphrase)
    : StellarHDWallet.fromMnemonic(testCase.seedWords);

  it('derives expected parent key', () => {
    assert.equal(
      wallet.derive(`m/44'/148'`).toString('hex'),
      testCase.parentKey
    );
  });

  it('derives expected child keys', () => {
    testCase.keypairs.forEach(([publicKey, secret], index) =>
      assertKeypair(wallet.getKeypair(index), publicKey, secret)
    );
  });
};

describe('SEP-0005', () => {
  describe('Test Case 1', specTestCase(1));
  describe('Test Case 2', specTestCase(2));
  describe('Test Case 3', specTestCase(3));
  describe('Test Case 4', specTestCase(4));
  describe('Test Case 5', specTestCase(5));
});