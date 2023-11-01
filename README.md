**Quick start:**

```zsh
npx degit proto-kit/starter-kit#develop my-chain
cd my-chain
npm install
npm run test:watch
```

# TODO

Assign a way to automatically check for oracle key access at the end of each day as a zkProof.
If failed a new key will be requested from the signer.

Create a zkProof using a PrivateKey, and use the zkProof to initiate txns later for the oracle.
