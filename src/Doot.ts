import {
  RuntimeModule,
  runtimeModule,
  state,
  runtimeMethod,
} from "@proto-kit/module";

import { State, StateMap, assert } from "@proto-kit/protocol";

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

  @runtimeMethod() public init(mock: Field) {
    const toSet: PublicKey = this.transaction.sender;
    this.deployer.set(toSet);
  }

  @runtimeMethod() public setOracle(_address: PublicKey) {
    const currentDeployer = this.deployer.get();
    assert(
      currentDeployer.value.equals(this.transaction.sender),
      "Public Key Mismatch!"
    );

    this.oracle.set(_address);
  }

  @runtimeMethod() public getCaller(): PublicKey {
    return this.transaction.sender;
  }
}
