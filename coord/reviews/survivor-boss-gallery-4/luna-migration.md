verdict: approve
68e2a8e0528658c3bec0d1b91810c27d47255849

This is approval of the exact migration-only patch against this base; it does not claim the base contains Boss 4 code, and it is not approval of Boss 4 gameplay, the whole PR, UI, or card acceptance.

Patch SHA-256: `8ff56592199f582070c7797a5efc5e317de8adf2445983235e1310d9f0fa6ab2` (7,931 bytes). Allowed changed paths are `games/survivor/data/schema.js` and the new `games/survivor/tests/boss-gallery-4.cjs`.

Independent source review: the validator matches saved Boss records by known ID, rejects unknown and duplicate IDs, accepts only complete current rosters or the exact historical 1/3/4-ID sets, and emits entries in default order. Existing records pass through the normal strict field validation; only missing current defaults are copied. The new test covers preservation of edited nested values, reordering, invalid partial rosters and identities, schema-1 arena conversion, input/default non-mutation, save/load idempotence, and a clearly labeled synthetic seven-ID roster. The synthetic roster is migration coverage only; it does not test or imply implementation of the three new Bosses.

Exact application followed a clean-base check, matching schema preimage, absent-test check, and successful `git apply --check`. Both postimages matched the declared hashes and byte counts. Targeted Mac checks passed: `node games/survivor/tests/boss-gallery-4.cjs` (synthetic 1/3/4-to-4/7 migration coverage only), `node games/survivor/tests/boss-gallery-2.cjs`, `node games/survivor/tests/boss-gallery-3.cjs`, `node --check` on both changed source/test files, and `git diff --check`.

This increment does not implement any of the three Bosses, update existing gallery count assertions for a future seven-Boss defaults change, run the full `--layout` suite, synchronize game version/cache files, or provide browser/three-size/cloud gameplay acceptance. Those remain later gates.
