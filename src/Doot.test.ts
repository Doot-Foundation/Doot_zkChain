import { TestingAppChain } from "@proto-kit/sdk";
import { PrivateKey, PublicKey } from "o1js";
import { Doot } from "./Doot";
import { log } from "@proto-kit/common";

log.setLevel("ERROR");

describe("Doot", () => {
  it("Should initialize the oracle public key.", async () => {
    const appChain = TestingAppChain.fromRuntime({
      modules: {
        Doot,
      },
      config: {
        Doot: {},
      },
    });

    await appChain.start();

    const alicePrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();

    appChain.setSigner(alicePrivateKey);

    const doot = appChain.runtime.resolve("Doot");

    const tx1 = appChain.transaction(alice, () => {
      doot.setOracle(alice);
    });

    await tx1.sign();
    await tx1.send();

    await appChain.produceBlock();

    const key = await appChain.query.runtime.Doot.oracleKey.get();
    console.log(key);
  });
});
