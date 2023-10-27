import { TestingAppChain } from "@proto-kit/sdk";
import { PrivateKey, PublicKey } from "o1js";
import { Doot } from "./Doot";
import { log } from "@proto-kit/common";
import assert from "assert";

log.setLevel("ERROR");

describe("Doot", () => {
  let appChain: any;
  let doot: any;
  let signer: PrivateKey;
  let oracle: PrivateKey;

  beforeAll(async () => {
    const appchain = TestingAppChain.fromRuntime({
      modules: {
        Doot,
      },
      config: {
        Doot: {},
      },
    });

    await appchain.start();
    appChain = appchain;

    doot = appChain.runtime.resolve("Doot");

    signer = PrivateKey.random();
    appChain.setSigner(signer);

    oracle = PrivateKey.random();
  });

  describe("Init", () => {
    it("Should assign the correct deployer", async () => {
      const tx = appChain.transaction(signer.toPublicKey(), () => {
        doot.init(signer);
      });

      await tx.sign();
      await tx.send();

      await appChain.produceBlock();
    });

    it("Should return the correct deployer", async () => {
      const key = await appChain.query.runtime.Doot.deployer.get();
      assert(key.toBase58() == signer.toPublicKey().toBase58());
    });

    it("Should assign the oracle", async () => {
      const tx = appChain.transaction(signer.toPublicKey(), () => {
        doot.setOracle(oracle.toPublicKey(), signer);
      });

      await tx.sign();
      await tx.send();

      await appChain.produceBlock();
    });

    it("Should return the correct oracle", async () => {
      const key = await appChain.query.runtime.Doot.oracle.get();
      assert(key.toBase58() == oracle.toPublicKey().toBase58());
    });
  });
});
