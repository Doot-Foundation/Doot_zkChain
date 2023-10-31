import { TestingAppChain } from "@proto-kit/sdk";
import { CircuitString, Field, PrivateKey, Bool, PublicKey } from "o1js";
import { Doot, Asset } from "./Doot";
import { assert } from "@proto-kit/protocol";

describe("Doot", () => {
  let appChain: TestingAppChain<{
    Doot: typeof Doot;
  }>;
  let doot: Doot;

  const signerPK = PrivateKey.random();
  const signer = signerPK.toPublicKey();

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

      const key: PublicKey | undefined =
        await appChain.query.runtime.Doot.deployer.get();

      console.log(key?.toBase58());
    });
  });

  describe("Asset", () => {
    it("Should return null when referencing an asset that doesnt exist", async () => {
      const name = CircuitString.fromString("Ethereum");
      const asset: Asset | undefined =
        await appChain.query.runtime.Doot.assetToInfo.get(name);

      console.log(typeof asset);
    });

    it("Should init an empty asset", async () => {
      const name = CircuitString.fromString("Ethereum");

      const tx = appChain.transaction(signer, () => {
        doot.initAsset(name);
      });
      await tx.sign();
      await tx.send();
      await appChain.produceBlock();

      const asset: Asset | undefined =
        await appChain.query.runtime.Doot.assetToInfo.get(name);
      console.log(asset);
    });

    it("Should update the asset", async () => {});
  });
});
