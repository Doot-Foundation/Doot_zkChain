import { TestingAppChain } from "@proto-kit/sdk";
import { Field, PrivateKey, Provable } from "o1js";
import { Doot } from "./Doot";

describe("Doot", () => {
  let appChain: TestingAppChain<{
    Doot: typeof Doot;
  }>;
  let doot: Doot;

  const signerPK = PrivateKey.random();
  const signer = signerPK.toPublicKey();

  const oraclePK = PrivateKey.random();
  const oracle = oraclePK.toPublicKey();

  beforeAll(async () => {
    appChain = TestingAppChain.fromRuntime({
      modules: {
        Doot: Doot,
      },
      config: {
        Doot: {},
      },
    });
    appChain.setSigner(signerPK);
    await appChain.start();

    doot = appChain.runtime.resolve("Doot");

    console.log("Signer/Deployer Address :", signer.toBase58());
    console.log("Oracle Address :", oracle.toBase58());
  });

  describe("Init", () => {
    it("Should assign the correct deployer and confirm it", async () => {
      const tx = appChain.transaction(signer, () => {
        const mock = Field.from(0);
        doot.init(mock);
      });
      await tx.sign();
      await tx.send();
      await appChain.produceBlock();

      const key = await appChain.query.runtime.Doot.deployer.get();
      console.log(key?.toBase58());
    });
    it("Should assign the correct oracle address and confirm it", async () => {
      const tx = appChain.transaction(signer, () => {
        doot.setOracle(oracle);
      });
      await tx.sign();
      await tx.send();
      await appChain.produceBlock();

      const key = await appChain.query.runtime.Doot.oracle.get();
      console.log(key?.toBase58());
    });
  });
});
