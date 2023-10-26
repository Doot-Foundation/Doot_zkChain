import { TestingAppChain } from "@proto-kit/sdk";
import { CircuitString, PrivateKey, PublicKey } from "o1js";
import { DootAsset } from "./DootAsset";
import { log } from "@proto-kit/common";

log.setLevel("ERROR");

describe("Doot", () => {
  it("Should initialize the contract for a specific asset.", async () => {
    const appChain = TestingAppChain.fromRuntime({
      modules: {
        DootAsset,
      },
      config: {
        DootAsset: {
          assetName: CircuitString.fromString("Ethereum"),
        },
      },
    });

    await appChain.start();
    console.log(appChain);

    const alicePrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();

    appChain.setSigner(alicePrivateKey);

    const doot = appChain.runtime.resolve("DootAsset");

    const tx1 = appChain.transaction(alice, () => {
      doot.setOracle(alice);
    });

    await tx1.sign();
    await tx1.send();

    await appChain.produceBlock();

    const key = await appChain.query.runtime.DootAsset.oracleKey.get();
    console.log(key);
  });
});
