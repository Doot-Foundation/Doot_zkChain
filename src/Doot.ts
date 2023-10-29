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
} from "o1js";

interface DootConfig {}

class Asset extends Struct({
  price: Field,
  decimal: Field,
  lastUpdated: Field,
  signature: Signature,
  active: Bool,
  urls: Provable.Array(CircuitString, 11),
  signatures: Provable.Array(Signature, 11),
  prices: Provable.Array(Field, 11),
  tlsnProofs: Provable.Array(CircuitString, 11),
}) {}

@runtimeModule()
export class Doot extends RuntimeModule<DootConfig> {
  @state() public assetToInfo = StateMap.from<CircuitString, Asset>(
    CircuitString,
    Asset
  );
  @state() public deployer = State.from<PublicKey>(PublicKey);
  @state() public oracle = State.from<PublicKey>(PublicKey);

  // -------------- DEPLOYER METHODS

  @runtimeMethod() public init(mock: Field) {
    const toSet = this.transaction.sender;
    this.deployer.set(toSet);
  }

  @runtimeMethod() public initAsset(_name: CircuitString) {
    const caller = this.transaction.sender;
    assert(caller.equals(this.deployer.get().value), "Public Key Mistmatch!");

    const dummySignature = Signature.fromBase58("");
    const dummyString = CircuitString.fromString("");
    const dummyField = Field.from(0);

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

  @runtimeMethod() public setOracle(_address: PublicKey) {
    const caller = this.transaction.sender;
    assert(caller.equals(this.deployer.get().value), "Public Key Mismatch!");

    this.oracle.set(_address);
  }

  // -------------- ORACLE METHODS

  // @runtimeMethod() public updateAsset(
  //   name: CircuitString,
  //   price: Field,
  //   decimal: Field,
  //   lastUpdated: Field,
  //   signature: Signature,
  //   urls: ProvableExtendedPure<CircuitString, 11>,
  //   signatures: ProvableExtendedPure<Signature, 11>,
  //   prices: ProvableExtendedPure<Field, 11>,
  //   tlsnProofs: ProvableExtendedPure<CircuitString, 11>
  // ) {
  //   const caller = this.transaction.sender;
  //   assert(caller.equals(this.oracle.get().value));

  //   const currentAsset = this.assetToInfo.get(name).value;
  //   assert(currentAsset.active, "Asset Not Active!");

  //   currentAsset.price = price;
  //   currentAsset.decimal = decimal;
  //   currentAsset.lastUpdated = lastUpdated;
  //   currentAsset.signature = signature;
  //   currentAsset.urls = urls;
  //   currentAsset.signatures = signatures;
  //   currentAsset.prices = prices;
  //   currentAsset.tlsnProofs = tlsnProofs;
  // }
}
