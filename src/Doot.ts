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
  Bool,
  Scalar,
} from "o1js";

interface DootConfig {}

export class Asset extends Struct({
  price: Field,
  decimal: Field,
  lastUpdated: Field,
  signature: Signature,
  active: Bool,
  urls: Provable.Array(CircuitString, 11),
  prices: Provable.Array(Field, 11),
  signatures: Provable.Array(Signature, 11),
  tlsnProofs: Provable.Array(CircuitString, 11),
}) {}

@runtimeModule()
export class Doot extends RuntimeModule<DootConfig> {
  @state() public assetToInfo = StateMap.from<CircuitString, Asset>(
    CircuitString,
    Asset
  );
  @state() public oracle = State.from<PublicKey>(PublicKey);
  @state() public deployer = State.from<PublicKey>(PublicKey);

  // -------------- DEPLOYER METHODS

  @runtimeMethod() public init(_mock: Field) {
    const toSet = this.transaction.sender;
    this.deployer.set(toSet);
  }

  @runtimeMethod() public setOracle(_address: PublicKey) {
    const caller = this.transaction.sender;
    assert(caller.equals(this.deployer.get().value), "Public Key Mismatch.");

    this.oracle.set(_address);
  }

  @runtimeMethod() public initAsset(_name: CircuitString) {
    const caller = this.transaction.sender;
    assert(caller.equals(this.oracle.get().value), "Public Key Mistmatch!");

    const dummyField = Field.from(0);

    const r: Field = Field.from(
      "3453242529435300249475913149188572083347436792222851800488732972770575089231"
    );
    const s: Scalar = Scalar.from(
      "12534608709379221111311551915926877686194576342348043105277077603381034183837"
    );

    const dummySignature = Signature.fromObject({
      r,
      s,
    });

    const dummyString = CircuitString.fromString("");

    const toSet: Asset = new Asset({
      price: dummyField,
      decimal: dummyField,
      lastUpdated: dummyField,
      signature: dummySignature,
      active: Bool(true),
      urls: [
        dummyString,
        dummyString,
        dummyString,
        dummyString,
        dummyString,
        dummyString,
        dummyString,
        dummyString,
        dummyString,
        dummyString,
        dummyString,
      ],
      signatures: [
        dummySignature,
        dummySignature,
        dummySignature,
        dummySignature,
        dummySignature,
        dummySignature,
        dummySignature,
        dummySignature,
        dummySignature,
        dummySignature,
        dummySignature,
      ],
      prices: [
        dummyField,
        dummyField,
        dummyField,
        dummyField,
        dummyField,
        dummyField,
        dummyField,
        dummyField,
        dummyField,
        dummyField,
        dummyField,
      ],
      tlsnProofs: [
        dummyString,
        dummyString,
        dummyString,
        dummyString,
        dummyString,
        dummyString,
        dummyString,
        dummyString,
        dummyString,
        dummyString,
        dummyString,
      ],
    });

    this.assetToInfo.set(_name, toSet);
  }

  @runtimeMethod() public updateAsset(_name: CircuitString, _info: Asset) {
    const caller = this.transaction.sender;
    assert(caller.equals(this.oracle.get().value));

    const currentAsset = this.assetToInfo.get(_name).value;
    assert(currentAsset.active, "Asset Not Active!");

    this.assetToInfo.set(_name, _info);
  }
}
