import {
  RuntimeModule,
  runtimeModule,
  state,
  runtimeMethod,
} from "@proto-kit/module";

import { StateMap } from "@proto-kit/protocol";
import { CircuitString, PublicKey, UInt64 } from "o1js";

interface DootRegistryConfig {}

@runtimeModule()
export class DootRegistry extends RuntimeModule<DootRegistryConfig> {
  @state() public chainIdToAssetName = StateMap.from<UInt64, CircuitString>(
    UInt64,
    CircuitString
  );
  @state() public chainIdToModuleAddress = StateMap.from<UInt64, PublicKey>(
    UInt64,
    PublicKey
  );

  @runtimeMethod()
  public addAsset(
    runtimeModuleIdentifier: PublicKey,
    chainId: UInt64,
    assetName: CircuitString
  ) {
    this.chainIdToAssetName.set(chainId, assetName);
    this.chainIdToModuleAddress.set(chainId, runtimeModuleIdentifier);
  }
}
