/**
 * BLSEngine — BLS12-381 aggregate signature operations using mcl-wasm.
 *
 * Usage:
 *   await blsEngine.init();
 *   const { secretKey, publicKey } = blsEngine.generateKeyPair();
 *   const sig  = blsEngine.sign(secretKey, message);
 *   const agg  = blsEngine.aggregate([sig1, sig2]);
 *   const ok   = blsEngine.verify(agg, [pk1, pk2], message);
 *
 * Cryptographic scheme (BLS12-381):
 *   - Secret key  : sk  ∈ Fr  (random scalar)
 *   - Public key  : pk  = g2 · sk  ∈ G2
 *   - Hash-to-G1  : H(m) = hashAndMapToG1(m)  ∈ G1
 *   - Sign        : σ_i  = H(m) · sk_i  ∈ G1
 *   - Aggregate   : σ_agg = Σ σ_i  ∈ G1
 *   - Verify      : e(σ_agg, g2) == e(H(m), Σ pk_i)
 */

// mcl-wasm is loaded via dynamic import so the module can be imported in
// environments where the WASM binary is not yet available (e.g. during
// Next.js build-time static analysis). Call `blsEngine.init()` before use.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MclModule = any;

/**
 * A fixed, deterministic seed used to derive the G2 generator point.
 * All parties must use the same seed to agree on the same generator.
 */
const G2_GENERATOR_SEED = new Uint8Array(
  Buffer.from("UniChain BLS12-381 G2 generator v1")
);

export class BLSEngine {
  private mcl: MclModule | null = null;
  private g2Generator: unknown = null;
  private initialised = false;

  /** Initialise mcl-wasm with the BLS12-381 curve. Idempotent. */
  async init(): Promise<void> {
    if (this.initialised) return;

    // Dynamic import so the module compiles even when mcl-wasm is absent.
    const mcl: MclModule = await import("mcl-wasm");
    await mcl.init(mcl.BLS12_381);

    // Derive a deterministic G2 generator via setHashOf.
    const g2 = new mcl.G2();
    g2.setHashOf(G2_GENERATOR_SEED);

    this.mcl = mcl;
    this.g2Generator = g2;
    this.initialised = true;
  }

  private assertReady(): MclModule {
    if (!this.mcl || !this.initialised) {
      throw new Error(
        "BLSEngine not initialised — call await blsEngine.init() first"
      );
    }
    return this.mcl;
  }

  private getG2(): unknown {
    return this.g2Generator;
  }

  /**
   * Hash a message byte-array to a G1 point.
   * H(m) — the base element used in signing.
   *
   * @param message  Arbitrary-length message bytes
   * @returns        Serialised G1 point
   */
  hashToG1(message: Uint8Array): Uint8Array {
    const mcl = this.assertReady();
    const g1 = mcl.hashAndMapToG1(message);
    return g1.serialize() as Uint8Array;
  }

  /**
   * Sign a message with a secret key.
   * σ_i = H(m) · sk_i
   *
   * @param secretKey  Serialised Fr scalar (secret key)
   * @param message    Arbitrary-length message bytes
   * @returns          Serialised G1 signature point
   */
  sign(secretKey: Uint8Array, message: Uint8Array): Uint8Array {
    const mcl = this.assertReady();

    const sk = new mcl.Fr();
    sk.deserialize(secretKey);

    const hm = mcl.hashAndMapToG1(message);
    const sig = mcl.mul(hm, sk);
    return sig.serialize() as Uint8Array;
  }

  /**
   * Aggregate individual G1 signatures into a single compact signature.
   * σ_agg = Σ σ_i
   *
   * @param signatures  Array of serialised G1 signature points (≥1)
   * @returns           Serialised aggregated G1 point
   */
  aggregate(signatures: Uint8Array[]): Uint8Array {
    const mcl = this.assertReady();

    if (signatures.length === 0) {
      throw new Error("aggregate: at least one signature required");
    }

    // Start from the first signature and add the rest.
    const first = new mcl.G1();
    first.deserialize(signatures[0]);
    let agg = first;

    for (let i = 1; i < signatures.length; i++) {
      const sig = new mcl.G1();
      sig.deserialize(signatures[i]);
      agg = mcl.add(agg, sig);
    }

    return agg.serialize() as Uint8Array;
  }

  /**
   * Verify an aggregate signature using a single pairing check.
   * e(σ_agg, g2) == e(H(m), Σ pk_i)
   *
   * @param aggSig      Serialised aggregated G1 signature
   * @param publicKeys  Array of serialised G2 public key points (≥1)
   * @param message     The message that was signed
   * @returns           true if the signature is valid, false otherwise
   */
  verify(
    aggSig: Uint8Array,
    publicKeys: Uint8Array[],
    message: Uint8Array
  ): boolean {
    const mcl = this.assertReady();

    if (publicKeys.length === 0) return false;

    try {
      // Deserialise aggregate signature
      const sig = new mcl.G1();
      sig.deserialize(aggSig);

      // Sum all public keys: Σ pk_i
      const firstPk = new mcl.G2();
      firstPk.deserialize(publicKeys[0]);
      let aggPk = firstPk;

      for (let i = 1; i < publicKeys.length; i++) {
        const pk = new mcl.G2();
        pk.deserialize(publicKeys[i]);
        aggPk = mcl.add(aggPk, pk);
      }

      // H(m)
      const hm = mcl.hashAndMapToG1(message);

      // Pairing check: e(σ_agg, g2) == e(H(m), aggPk)
      const g2 = this.getG2();
      const lhs = mcl.pairing(sig, g2);
      const rhs = mcl.pairing(hm, aggPk);

      return lhs.isEqual(rhs) as boolean;
    } catch {
      return false;
    }
  }

  /**
   * Generate a BLS key pair.
   *
   * @returns  { secretKey: serialised Fr, publicKey: serialised G2 }
   */
  generateKeyPair(): { secretKey: Uint8Array; publicKey: Uint8Array } {
    const mcl = this.assertReady();

    const sk = new mcl.Fr();
    sk.setByCSPRNG();

    const pk = mcl.mul(this.getG2(), sk);

    return {
      secretKey: sk.serialize() as Uint8Array,
      publicKey: pk.serialize() as Uint8Array,
    };
  }
}

/** Singleton instance — call `await blsEngine.init()` before first use. */
export const blsEngine = new BLSEngine();
