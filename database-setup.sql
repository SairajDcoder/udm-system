-- UniChain Master Relational Schema Translation
-- Paste this script directly into your Supabase project's 'SQL Editor' and click 'Run'.

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  "id" TEXT PRIMARY KEY,
  "role" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "institutionalEmail" TEXT UNIQUE NOT NULL,
  "personalEmail" TEXT,
  "phone" TEXT,
  "dateOfBirth" TEXT,
  "gender" TEXT,
  "department" TEXT,
  "programme" TEXT,
  "joinYear" TEXT,
  "did" TEXT UNIQUE,
  "walletAddress" TEXT UNIQUE,
  "attributes" TEXT[],
  "mfaEnabled" BOOLEAN DEFAULT FALSE,
  "mfaSecret" TEXT,
  "enrollmentId" TEXT,
  "governmentIdVerified" BOOLEAN DEFAULT FALSE,
  "graduationFeeCleared" BOOLEAN DEFAULT FALSE,
  "keyStatus" TEXT DEFAULT 'active',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "lastLoginAt" TIMESTAMPTZ
);

-- COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "term" TEXT NOT NULL,
  "credits" INTEGER NOT NULL,
  "facultyId" TEXT REFERENCES public.users("id"),
  "studentIds" TEXT[] DEFAULT '{}'
);

-- BLOCKS TABLE
CREATE TABLE IF NOT EXISTS public.blocks (
  "blockHash" TEXT PRIMARY KEY,
  "blockchain" TEXT NOT NULL,
  "blockNumber" INTEGER NOT NULL,
  "previousHash" TEXT NOT NULL,
  "validatorId" TEXT NOT NULL,
  "validatorSignatures" TEXT[],
  "transactionIds" TEXT[],
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  "id" TEXT PRIMARY KEY,
  "blockchain" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "actorId" TEXT REFERENCES public.users("id"),
  "contractName" TEXT NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "transactionHash" TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "blockNumber" INTEGER,
  "gasUsed" INTEGER
);

-- VALIDATORS TABLE
CREATE TABLE IF NOT EXISTS public.validators (
  "id" TEXT PRIMARY KEY,
  "blockchain" TEXT NOT NULL,
  "stake" INTEGER NOT NULL,
  "status" TEXT DEFAULT 'active',
  "joinedAt" TIMESTAMPTZ DEFAULT NOW(),
  "lastActive" TIMESTAMPTZ DEFAULT NOW()
);

-- CREDENTIALS TABLE
CREATE TABLE IF NOT EXISTS public.credentials (
  "id" TEXT PRIMARY KEY,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "issuerId" TEXT REFERENCES public.users("id"),
  "issuedTo" TEXT REFERENCES public.users("id"),
  "issuedAt" TIMESTAMPTZ DEFAULT NOW(),
  "expiresAt" TIMESTAMPTZ,
  "status" TEXT DEFAULT 'valid',
  "contentHash" TEXT NOT NULL,
  "signature" TEXT NOT NULL,
  "linkedRecordId" TEXT
);

-- ACCESS GRANTS TABLE
CREATE TABLE IF NOT EXISTS public.accessGrants (
  "id" TEXT PRIMARY KEY,
  "targetId" TEXT REFERENCES public.users("id"),
  "resourceType" TEXT NOT NULL,
  "recordId" TEXT,
  "grantedBy" TEXT REFERENCES public.users("id"),
  "grantedAt" TIMESTAMPTZ DEFAULT NOW(),
  "expiresAt" TIMESTAMPTZ,
  "permissions" TEXT[] DEFAULT '{}',
  "status" TEXT DEFAULT 'active'
);

-- TRANSCRIPT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.transcriptRequests (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT REFERENCES public.users("id"),
  "purpose" TEXT NOT NULL,
  "destination" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "copies" INTEGER DEFAULT 1,
  "format" TEXT NOT NULL,
  "notes" TEXT,
  "fee" INTEGER DEFAULT 0,
  "status" TEXT DEFAULT 'pending',
  "requestDate" TIMESTAMPTZ DEFAULT NOW(),
  "readyAt" TIMESTAMPTZ,
  "cid" TEXT,
  "hashId" TEXT,
  "qrData" TEXT
);

-- Disable Row Level Security temporarily to safely emulate the JSON mock bridging behavior server-side
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.validators DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessGrants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcriptRequests DISABLE ROW LEVEL SECURITY;
