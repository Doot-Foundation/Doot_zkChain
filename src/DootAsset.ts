import {
  RuntimeModule,
  runtimeModule,
  state,
  runtimeMethod,
} from "@proto-kit/module";

import { State } from "@proto-kit/protocol";
import { CircuitString, Field, PublicKey, Signature } from "o1js";

interface DootAssetConfig {
  assetName: CircuitString;
}

@runtimeModule()
export class DootAsset extends RuntimeModule<DootAssetConfig> {
  @state() public price = State.from<Field>(Field);
  @state() public decimals = State.from<Field>(Field);
  @state() public timestamp = State.from<Field>(Field);
  @state() public signature = State.from<Signature>(Signature);
  @state() public tokenPair = State.from<CircuitString>(CircuitString);
  @state() public oracleKey = State.from<PublicKey>(PublicKey);

  @runtimeMethod()
  public updateInformation(
    _price: Field,
    _decimals: Field,
    _timestamp: Field
  ) {}

  @runtimeMethod() public setOracle(_address: PublicKey) {
    this.oracleKey.set(_address);
  }
}
