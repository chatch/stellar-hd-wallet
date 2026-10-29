import assert from "assert";
import Keypair from "../src/keypair.js";

describe("Keypair", () => {
  it("copies the seed supplied by the caller", () => {
    const seed = new Uint8Array(32).fill(1);
    const keypair = Keypair.fromRawEd25519Seed(seed);
    const secret = keypair.secret();

    seed.fill(2);

    assert.equal(keypair.secret(), secret);
  });

  it("returns a copy of its raw seed", () => {
    const keypair = Keypair.fromRawEd25519Seed(new Uint8Array(32).fill(1));
    const publicKey = keypair.publicKey();
    const secret = keypair.secret();

    keypair.rawSeed().fill(2);

    assert.equal(keypair.publicKey(), publicKey);
    assert.equal(keypair.secret(), secret);
  });
});
