/**
 * This key derivation code was copied and adapted from:
 *   https://github.com/alepop/ed25519-hd-key/blob/master/src/index.ts
 * in order to remove js-nacl dependency which caused browser errors with
 * content-security-policy - see #12 for details. This modified implementation
 * is a pure JS implementation.
 *
 * The original ed25519-hd-key module is licensed under "GPL-3".
 */

const createHmac = require("create-hmac/browser");

const ED25519_CURVE = 'ed25519 seed';
const HARDENED_OFFSET = 0x80000000;

export const derivePath = (path, seed) => {
    if (!isValidPath(path)) {
        throw new Error('Invalid derivation path');
    }
    const { key, chainCode } = getMasterKeyFromSeed(seed);
    const segments = path
        .split('/')
        .slice(1)
        .map(replaceDerive)
        .map(el => parseInt(el, 10));
    return segments.reduce(
        (parentKeys, segment) =>
            CKDPriv(parentKeys, segment + HARDENED_OFFSET),
        { key, chainCode }
    );
};

const getMasterKeyFromSeed = (seed) => {
    const hmac = createHmac('sha512', ED25519_CURVE);
    const I = hmac.update(Buffer.from(seed, 'hex')).digest();
    const IL = I.slice(0, 32);
    const IR = I.slice(32);
    return {
        key: IL,
        chainCode: IR,
    };
};

const CKDPriv = ({ key, chainCode }, index) => {
    const indexBuffer = Buffer.allocUnsafe(4);
    indexBuffer.writeUInt32BE(index, 0);
    const data = Buffer.concat([Buffer.alloc(1, 0), key, indexBuffer]);
    const I = createHmac('sha512', chainCode)
        .update(data)
        .digest();
    const IL = I.slice(0, 32);
    const IR = I.slice(32);
    return {
        key: IL,
        chainCode: IR,
    };
};

const replaceDerive = (val) => val.replace("'", '');
const pathRegex = new RegExp("^m(\\/[0-9]+')+$");
const isValidPath = (path) => {
    if (!pathRegex.test(path)) {
        return false;
    }
    return !path
        .split('/')
        .slice(1)
        .map(replaceDerive)
        .some(isNaN);
};
