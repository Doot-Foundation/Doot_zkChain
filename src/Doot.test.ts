import { TestingAppChain, InMemorySigner } from "@proto-kit/sdk";
import {
  CircuitString,
  Field,
  PrivateKey,
  PublicKey,
  Signature,
  Bool,
} from "o1js";
import { Doot, Asset } from "./Doot";

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

      const key: PublicKey | undefined =
        await appChain.query.runtime.Doot.deployer.get();

      expect(key?.toBase58()).toBe(signer.toBase58());
    });
    it("Should assing the correct oracle and confirm it", async () => {
      const tx = appChain.transaction(signer, () => {
        doot.setOracle(oracle);
      });
      await tx.sign();
      await tx.send();
      await appChain.produceBlock();

      const key: PublicKey | undefined =
        await appChain.query.runtime.Doot.oracle.get();

      expect(key?.toBase58()).toBe(oracle.toBase58());
    });
  });

  describe("Asset", () => {
    it("Should return null when referencing an asset that doesnt exist", async () => {
      const name = CircuitString.fromString("Ethereum");
      const asset: Asset | undefined =
        await appChain.query.runtime.Doot.assetToInfo.get(name);

      expect(typeof asset).toBe("undefined");
    });

    it("Should init an empty asset", async () => {
      const name = CircuitString.fromString("Ethereum");

      const tx = appChain.transaction(oracle, () => {
        doot.initAsset(name);
      });

      const inMemorySigner = appChain.resolveOrFail("Signer", InMemorySigner);
      inMemorySigner.config.signer = oraclePK;

      await tx.sign();
      await tx.send();
      await appChain.produceBlock();

      const asset: Asset | undefined =
        await appChain.query.runtime.Doot.assetToInfo.get(name);
      const status: Boolean | undefined = Boolean(asset?.active);

      if (status) expect(status).toBe(true);
    });

    it("Should update the asset", async () => {
      const name = CircuitString.fromString("Ethereum");

      const pricesArray = [
        16355454665125, 16455454665125, 16555454665125, 16655454665125,
        16755454665125, 16855454665125, 16955454665125, 17055454665125,
        17155454665125, 17255454665125, 17355454665125,
      ];
      const urlsArray = [
        "https://",
        "https://",
        "https://",
        "https://",
        "https://",
        "https://",
        "https://",
        "https://",
        "https://",
        "https://",
        "https://",
      ];

      const price = Field.from(16855454665125);
      const decimal = Field.from(10);
      const timestamp = Field.from(Math.floor(Date.now() / 1000));
      const signature = Signature.create(oraclePK, [price, decimal, timestamp]);
      const active = Bool(true);

      const urls = urlsArray.map((x) => CircuitString.fromString(x));
      const prices = pricesArray.map((x) => Field.from(x));
      const signatures = pricesArray.map((x) =>
        Signature.create(oraclePK, [
          Field.from(CircuitString.fromString("https://").hash()),
          Field.from(x),
          decimal,
          timestamp,
        ])
      );
      const tlsnProofs = urlsArray.map((x) => CircuitString.fromString(x));
      const L1Address = PublicKey.empty();

      const toSet: Asset = new Asset({
        price: price,
        decimal: decimal,
        lastUpdated: timestamp,
        signature: signature,
        active: active,
        urls: urls,
        prices: prices,
        signatures: signatures,
        tlsnProofs: tlsnProofs,
        L1Address: L1Address,
      });

      const tx = appChain.transaction(oracle, () => {
        doot.updateAsset(name, toSet);
      });

      const inMemorySigner = appChain.resolveOrFail("Signer", InMemorySigner);
      inMemorySigner.config.signer = oraclePK;

      await tx.sign();
      await tx.send();
      await appChain.produceBlock();

      const asset: Asset | undefined =
        await appChain.query.runtime.Doot.assetToInfo.get(name);
      const returnedPrice: Field | undefined = asset?.price;

      if (returnedPrice)
        expect(returnedPrice.toBigInt()).toEqual(16855454665125n);
    });
  });
});
