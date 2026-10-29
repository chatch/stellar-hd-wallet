# Security Policy

## Supported Versions

Security updates are applied to the latest published major version.

| Version | Supported |
| ------- | --------- |
| 2.x     | ✅        |
| 1.x     | ❌        |
| < 1.0   | ❌        |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

This project has [private vulnerability reporting](https://github.com/chatch/stellar-hd-wallet/security/advisories/new) enabled. Use the **Report a vulnerability** button there to submit a report privately to the maintainer. You may also report via [GitHub's security advisory form](https://github.com/chatch/stellar-hd-wallet/security/advisories) — reports stay private until a fix is published.

### What to include

- A description of the vulnerability and its impact
- Steps to reproduce (a minimal code snippet is ideal)
- Affected version(s)
- Any known workarounds

### Scope

Issues in scope include anything affecting key security or correctness of this library's derivation logic:

- Mnemonic-to-key derivation (SEP-0005, BIP-39/44, SLIP-0010)
- Key material leakage or unexpected persistence
- Signature or strkey encoding/decoding errors
- Dependency-introduced vulnerabilities in the runtime dependencies

Not in scope: vulnerabilities in applications _using_ this library (e.g. how seed phrases are stored or displayed), or in the Stellar protocol itself.

### Response expectations

- Acknowledgement within **7 days**
- Triage outcome (accepted / needs more info / declined) within **14 days**
- Accepted vulnerabilities are fixed and disclosed via a [GitHub security advisory](https://github.com/chatch/stellar-hd-wallet/security/advisories) once a patched release is available, with credit to the reporter unless anonymity is requested

This project is maintained by a single maintainer on a best-effort basis; timelines may be longer for complex issues.

## Security features of this project

- Dependencies are kept up to date via Dependabot (including security updates)
- Static analysis (CodeQL, `security-extended`) runs on every push and PR
- Releases are published to npm with [provenance attestation](https://docs.npmjs.com/generating-provenance-statements) via OIDC — verify with `npm audit attestations` or on [npmjs.com](https://www.npmjs.com/package/stellar-hd-wallet)
- A CycloneDX SBOM is attached to every GitHub release
- Derivation is verified against the official [SEP-0005 test vectors](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0005.md)
