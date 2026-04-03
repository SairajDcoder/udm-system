import { createHash } from 'crypto';
import { base32 } from 'multiformats/bases/base32';
import { CID } from 'multiformats/cid';
import * as digest from 'multiformats/hashes/digest';

const hashBytes = createHash('sha256').update("hello").digest();
const d = digest.create(0x12, hashBytes);
const cid = CID.create(1, 0x55, d);
console.log(cid.toString(base32.encoder));
