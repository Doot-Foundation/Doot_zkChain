import {
  RuntimeModule,
  runtimeModule,
  state,
  runtimeMethod,
} from "@proto-kit/module";

import { State, StateMap } from "@proto-kit/protocol";
import assert from "assert";
import {
  CircuitString,
  Field,
  Struct,
  PublicKey,
  Signature,
  Provable,
  PrivateKey,
  Circuit,
} from "o1js";

interface DootConfig {}

class Asset extends Struct({
  price: Field,
  decimal: Field,
  lastUpdated: Field,
  signature: Signature,
  tlsnProof: Field,
  urls: Provable.Array(CircuitString, 11),
  signatures: Provable.Array(Signature, 11),
  prices: Provable.Array(Field, 11),
}) {}

@runtimeModule()
export class Doot extends RuntimeModule<DootConfig> {
  @state() public assetToInfo = StateMap.from<CircuitString, Asset>(
    CircuitString,
    Asset
  );
  @state() public deployer = State.from<PublicKey>(PublicKey);
  @state() public oracle = State.from<PublicKey>(PublicKey);

  @runtimeMethod() init(_signer: PrivateKey) {
    const toSet = _signer.toPublicKey();
    this.deployer.set(toSet);
  }

  @runtimeMethod() public getDeployer(): PublicKey {
    return this.deployer.get().value;
  }

  @runtimeMethod() public setOracle(_address: PublicKey, _signer: PrivateKey) {
    const currentDeployer = this.deployer.get().value;
    assert(
      currentDeployer.toBase58() == _signer.toPublicKey().toBase58(),
      "Public Key Mismatch!"
    );

    this.oracle.set(_address);
  }
}
