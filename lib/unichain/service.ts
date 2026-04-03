import "server-only"

import { promises as fs } from "fs"
import path from "path"
import { createHash, randomUUID } from "crypto"
import { Wallet, JsonRpcProvider, Contract } from "ethers"
import * as speakeasy from "speakeasy"
import { base32 } from "multiformats/bases/base32"
import { CID } from "multiformats/cid"
import * as digest from "multiformats/hashes/digest"
import { existsSync, readFileSync } from "fs"
import { decryptWithPolicy, encryptWithPolicy, policyMatches, rekeyWithPolicy } from "@/lib/crypto/abe"
import {
  DEMO_USER_IDS,
  type AccessGrant,
  type AuditLog,
  type BlockchainKey,
  type Course,
  type Credential,
  type CreditTransferRequest,
  type GradeRecord,
  type LedgerBlock,
  type LedgerTransaction,
  type Notification,
  type ResearchDocument,
  type SmartContractRecord,
  type StoredDocument,
  type TranscriptRequest,
  type TranscriptStatus,
  type UniChainDb,
  type User,
  type UserRole,
  type ValidatorNode,
  type VerificationLog,
  type OtpChallenge,
  type VerificationMethod,
  type VerificationReport,
  type VerifierApiKey,
} from "@/lib/unichain/types"

const DATA_DIR = path.join(process.cwd(), ".data")
const DB_PATH = path.join(DATA_DIR, "unichain-db.json")
const DEFAULT_INSTITUTION = "MIT Academy of Engineering"
const NETWORK_LABEL = "Permissioned Ethereum Consortium"
const DEFAULT_ISSUANCE_WINDOW_DAYS = 3650
const OTP_TTL_MINUTES = 5
const MAX_DOCUMENT_BODY_BYTES = 5 * 1024 * 1024
const ALLOWED_DOCUMENT_TYPES: StoredDocument["type"][] = [
  "degree-certificate",
  "academic-transcript",
  "grade-sheet",
  "research-paper",
  "admission-document",
  "fee-receipt",
  "course-material",
]

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

function txHash(value: string) {
  return `0x${sha256(value)}`
}

function cidFrom(value: string) {
  const hashBytes = createHash("sha256").update(value).digest()
  const d = digest.create(0x12, hashBytes)
  const cid = CID.createV1(0x55, d)
  return cid.toString(base32.encoder)
}

function makeDid(role: UserRole, id: string) {
  return `did:unichain:${role}:${id.toLowerCase()}`
}

function nowIso() {
  return new Date().toISOString()
}

function plusMinutes(baseIso: string, minutes: number) {
  const date = new Date(baseIso)
  date.setUTCMinutes(date.getUTCMinutes() + minutes)
  return date.toISOString()
}

function otpHash(code: string, email: string) {
  return sha256(`${code}:${email.toLowerCase()}:${getOtpSecret()}`)
}

function getOtpSecret() {
  return (
    process.env.AUTH_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "unichain-dev-otp-secret"
  )
}

function plusDays(baseIso: string, days: number) {
  const date = new Date(baseIso)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}

function gradeFromTotal(total: number) {
  if (total >= 90) return "A+"
  if (total >= 85) return "A"
  if (total >= 80) return "A-"
  if (total >= 75) return "B+"
  if (total >= 70) return "B"
  if (total >= 65) return "B-"
  if (total >= 60) return "C+"
  if (total >= 55) return "C"
  if (total >= 50) return "C-"
  if (total >= 45) return "D"
  return "F"
}

function base64Encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64")
}

function aggregateSignature(hashId: string, signerIds: string[]) {
  return `bls_agg_${sha256(`${hashId}:${signerIds.sort().join(":")}`)}`
}

function buildMerkleRoot(leaves: string[]) {
  if (leaves.length === 0) {
    return txHash("empty-merkle-root")
  }

  let level = leaves.map((leaf) => sha256(leaf))
  while (level.length > 1) {
    const next: string[] = []
    for (let index = 0; index < level.length; index += 2) {
      const left = level[index]
      const right = level[index + 1] ?? left
      next.push(sha256(`${left}${right}`))
    }
    level = next
  }

  return `0x${level[0]}`
}

function normalizeAttributeToken(attribute: string) {
  return attribute.trim().toLowerCase()
}

function attributesForUser(user: User | null, extras: string[] = []) {
  const attributes = new Set<string>(extras.map(normalizeAttributeToken))

  if (!user) {
    return Array.from(attributes)
  }

  attributes.add(`role=${user.role}`)
  attributes.add(`email=${user.institutionalEmail}`)
  attributes.add(`student_id=${user.id}`)
  attributes.add(`did=${user.did}`)

  if (user.personalEmail) {
    attributes.add(`email=${user.personalEmail}`)
  }

  if (user.role === "admin") {
    attributes.add("role=registrar")
  }

  if (user.attributes.some((attribute) => normalizeAttributeToken(attribute) === "role=verifier")) {
    attributes.add("role=verifier")
  }

  return Array.from(attributes)
}

function createEncryptedPayload(
  plaintext: string,
  policy: string,
  metadata: Record<string, string | number | boolean | null> = {}
) {
  const { envelope } = encryptWithPolicy(plaintext, policy, metadata)
  return {
    encryptedPayload: envelope,
  }
}

function validateDocumentInput(type: string, body: string) {
  if (!ALLOWED_DOCUMENT_TYPES.includes(type as StoredDocument["type"])) {
    throw new Error("Unsupported document type")
  }

  if (Buffer.byteLength(body, "utf8") > MAX_DOCUMENT_BODY_BYTES) {
    throw new Error("Document exceeds the maximum allowed size")
  }

  if (!body.trim()) {
    throw new Error("Document body is required")
  }
}

function createOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function readDecryptedPayload(
  encryptedPayload: string,
  attributes?: string[]
) {
  return decryptWithPolicy(encryptedPayload, attributes)
}

function getContractInventory(): SmartContractRecord[] {
  return [
    {
      name: "DIDRegistry.sol",
      blockchain: "institutional",
      version: "1.2.0",
      proxy: true,
      status: "healthy",
      address: "0x6f5a4f10dca8f8377cb18d4cc4d8e054d61e8a11",
    },
    {
      name: "CredentialIssuance.sol",
      blockchain: "institutional",
      version: "1.4.1",
      proxy: true,
      status: "healthy",
      address: "0x8584f5e9546e2b5990ba7e68a44abf51eb580202",
    },
    {
      name: "TranscriptManager.sol",
      blockchain: "student",
      version: "1.3.0",
      proxy: true,
      status: "healthy",
      address: "0x55f3179b6dce143f97f5f539d4480d720cfd2af0",
    },
    {
      name: "GradeRegistry.sol",
      blockchain: "faculty",
      version: "1.5.2",
      proxy: true,
      status: "healthy",
      address: "0x49b726ee8e2d86f18f0dc2ec01d3f8618900ac3c",
    },
    {
      name: "AccessControl.sol",
      blockchain: "student",
      version: "1.1.0",
      proxy: true,
      status: "healthy",
      address: "0x0b6120ce3ba757a3f9cc89c33f4f8a76cb61f0d2",
    },
    {
      name: "AuditLogger.sol",
      blockchain: "institutional",
      version: "1.0.8",
      proxy: false,
      status: "healthy",
      address: "0xc561cbab2dbcc8153cf127772edce9c423f32bf1",
    },
    {
      name: "CrossChainBridge.sol",
      blockchain: "institutional",
      version: "1.0.5",
      proxy: false,
      status: "healthy",
      address: "0x28f24425cfcf4f9d42ecb79d6ddb385b86b7013e",
    },
    {
      name: "ValidatorRegistry.sol",
      blockchain: "institutional",
      version: "1.2.3",
      proxy: false,
      status: "healthy",
      address: "0x7e9b8bf16d0ab4e0327a163dbfa124d67629e7e0",
    },
    {
      name: "CreditTransfer.sol",
      blockchain: "institutional",
      version: "1.1.7",
      proxy: true,
      status: "healthy",
      address: "0xecc95a8f76803f8b2e2540645d67f303df962c08",
    },
  ]
}

function bumpVersion(version: string) {
  const normalized = version.startsWith("v") ? version.slice(1) : version
  const parts = normalized.split(".").map((part) => Number.parseInt(part, 10))
  const major = Number.isFinite(parts[0]) ? parts[0] : 1
  const minor = Number.isFinite(parts[1]) ? parts[1] : 0
  const patch = Number.isFinite(parts[2]) ? parts[2] : 0
  return `v${major}.${minor + 1}.${patch + 1}`
}

function buildSeedDb(): UniChainDb {
  const seedTime = "2026-04-02T08:30:00.000Z"
  const users: User[] = [
    {
      id: DEMO_USER_IDS.student,
      role: "student",
      fullName: "Alice Johnson",
      institutionalEmail: "alice.johnson@mitaoe.ac.in",
      personalEmail: "alice.johnson@gmail.com",
      department: "CSE",
      programme: "B.Tech",
      joinYear: "2022",
      did: makeDid("student", DEMO_USER_IDS.student),
      walletAddress: "0x7f8c7C8d9D6e3A17B36fd1CC7DB66A37c8B53a1B",
      attributes: ["role=student", "dept=CSE", "clearance=student-self"],
      mfaEnabled: true,
      enrollmentId: "2022CSE001",
      governmentIdVerified: true,
      graduationFeeCleared: true,
      keyStatus: "active",
      createdAt: seedTime,
    },
    {
      id: "STU002",
      role: "student",
      fullName: "Bob Wilson",
      institutionalEmail: "bob.wilson@mitaoe.ac.in",
      department: "CSE",
      programme: "B.Tech",
      joinYear: "2022",
      did: makeDid("student", "STU002"),
      walletAddress: "0x8a03A29bA7e8b38897AA29e53dE65B5711E3A6d2",
      attributes: ["role=student", "dept=CSE", "clearance=student-self"],
      mfaEnabled: true,
      enrollmentId: "2022CSE002",
      governmentIdVerified: true,
      graduationFeeCleared: true,
      keyStatus: "active",
      createdAt: seedTime,
    },
    {
      id: DEMO_USER_IDS.faculty,
      role: "faculty",
      fullName: "Dr. Priya Deshmukh",
      institutionalEmail: "priya.deshmukh@mitaoe.ac.in",
      department: "CSE",
      did: makeDid("faculty", DEMO_USER_IDS.faculty),
      walletAddress: "0xf3861AbC8f8dd95dC8bA311cf79d46Ddc3f6B2B4",
      attributes: ["role=faculty", "dept=CSE", "clearance=grade-entry"],
      mfaEnabled: true,
      keyStatus: "active",
      createdAt: seedTime,
    },
    {
      id: DEMO_USER_IDS.admin,
      role: "admin",
      fullName: "Registrar Office",
      institutionalEmail: "registrar@mitaoe.ac.in",
      department: "Administration",
      did: makeDid("admin", DEMO_USER_IDS.admin),
      walletAddress: "0x669dB0d84e37ab3A34349795F2a1C0c6D7EE8AeC",
      attributes: ["role=admin", "dept=Admin", "clearance=super-admin"],
      mfaEnabled: true,
      keyStatus: "active",
      createdAt: seedTime,
    },
    {
      id: DEMO_USER_IDS.verifier,
      role: "verifier",
      fullName: "Stanford University Admissions",
      institutionalEmail: "admissions@stanford.edu",
      department: "Graduate Admissions",
      did: makeDid("verifier", DEMO_USER_IDS.verifier),
      walletAddress: "0xDC02a02D40ABdc703466dB0F1B35f76881FdB9EA",
      attributes: ["role=verifier", "institution=stanford", "clearance=degree-verification"],
      mfaEnabled: false,
      keyStatus: "active",
      createdAt: seedTime,
    },
  ]

  const courses: Course[] = [
    {
      id: "COURSE-CS401",
      code: "CS401",
      title: "Machine Learning",
      term: "Spring 2026",
      credits: 4,
      facultyId: DEMO_USER_IDS.faculty,
      studentIds: [DEMO_USER_IDS.student, "STU002"],
    },
    {
      id: "COURSE-CS402",
      code: "CS402",
      title: "Distributed Systems",
      term: "Spring 2026",
      credits: 3,
      facultyId: DEMO_USER_IDS.faculty,
      studentIds: [DEMO_USER_IDS.student, "STU002"],
    },
    {
      id: "COURSE-MA301",
      code: "MA301",
      title: "Linear Algebra",
      term: "Autumn 2025",
      credits: 3,
      facultyId: DEMO_USER_IDS.faculty,
      studentIds: [DEMO_USER_IDS.student, "STU002"],
    },
  ]

  const grades: GradeRecord[] = [
    {
      id: "GRADE-1",
      studentId: DEMO_USER_IDS.student,
      courseId: "COURSE-CS401",
      term: "Spring 2026",
      internal: 35,
      external: 52,
      total: 87,
      grade: "A",
      status: "approved",
      submittedBy: DEMO_USER_IDS.faculty,
      submittedAt: "2026-03-25T08:00:00.000Z",
      approvedBy: DEMO_USER_IDS.admin,
      approvedAt: "2026-03-26T09:00:00.000Z",
    },
    {
      id: "GRADE-2",
      studentId: DEMO_USER_IDS.student,
      courseId: "COURSE-CS402",
      term: "Spring 2026",
      internal: 30,
      external: 49,
      total: 79,
      grade: "B+",
      status: "approved",
      submittedBy: DEMO_USER_IDS.faculty,
      submittedAt: "2026-03-25T08:30:00.000Z",
      approvedBy: DEMO_USER_IDS.admin,
      approvedAt: "2026-03-26T09:05:00.000Z",
    },
    {
      id: "GRADE-3",
      studentId: DEMO_USER_IDS.student,
      courseId: "COURSE-MA301",
      term: "Autumn 2025",
      internal: 38,
      external: 55,
      total: 93,
      grade: "A+",
      status: "approved",
      submittedBy: DEMO_USER_IDS.faculty,
      submittedAt: "2025-12-15T08:30:00.000Z",
      approvedBy: DEMO_USER_IDS.admin,
      approvedAt: "2025-12-16T09:05:00.000Z",
    },
    {
      id: "GRADE-4",
      studentId: "STU002",
      courseId: "COURSE-CS401",
      term: "Spring 2026",
      internal: 28,
      external: 44,
      total: 72,
      grade: "B",
      status: "approved",
      submittedBy: DEMO_USER_IDS.faculty,
      submittedAt: "2026-03-25T08:00:00.000Z",
      approvedBy: DEMO_USER_IDS.admin,
      approvedAt: "2026-03-26T09:00:00.000Z",
    },
    {
      id: "GRADE-5",
      studentId: "STU002",
      courseId: "COURSE-CS402",
      term: "Spring 2026",
      internal: 26,
      external: 45,
      total: 71,
      grade: "B",
      status: "approved",
      submittedBy: DEMO_USER_IDS.faculty,
      submittedAt: "2026-03-25T08:30:00.000Z",
      approvedBy: DEMO_USER_IDS.admin,
      approvedAt: "2026-03-26T09:05:00.000Z",
    },
  ]

  const transcriptText = [
    "Unofficial academic transcript snapshot",
    "Student: Alice Johnson",
    "Programme: B.Tech CSE",
    "CGPA: 3.86",
    "Credits earned: 154",
  ].join("\n")
  const transcriptHash = txHash(transcriptText)
  const transcriptCid = cidFrom(transcriptText)

  const documents: StoredDocument[] = [
    {
      id: "DOC-TRANSCRIPT-1",
      ownerId: DEMO_USER_IDS.student,
      type: "academic-transcript",
      title: "Spring 2026 Transcript",
      cid: transcriptCid,
      sha256: transcriptHash,
      sizeKb: 192,
      encryptedPayload: base64Encode(transcriptText),
      plaintextPreview: "Academic transcript for Alice Johnson, Spring 2026",
      policy: "(student_id=STU001) AND (role=registrar OR role=verifier)",
      pinned: true,
      uploadedAt: "2026-03-28T11:30:00.000Z",
      metadata: {
        format: "Official PDF",
        studentId: DEMO_USER_IDS.student,
      },
    },
  ]

  const credentialMerkleRoot = buildMerkleRoot([transcriptHash, "degree-seed"])
  const transcriptCredential: Credential = {
    id: "CRED-TRANSCRIPT-1",
    studentId: DEMO_USER_IDS.student,
    type: "transcript",
    title: "Official Academic Transcript",
    issuer: DEFAULT_INSTITUTION,
    issueDate: "2026-03-28T11:30:00.000Z",
    expiryDate: null,
    status: "active",
    vScore: 96,
    hashId: transcriptHash,
    cid: transcriptCid,
    sha256: transcriptHash,
    blockchain: "student",
    contractName: "TranscriptManager.sol",
    aggregateSignature: aggregateSignature(transcriptHash, [DEMO_USER_IDS.admin, DEMO_USER_IDS.faculty]),
    signatoryIds: [DEMO_USER_IDS.admin, DEMO_USER_IDS.faculty],
    merkleRoot: credentialMerkleRoot,
    issuanceWindowEnd: plusDays("2026-03-28T11:30:00.000Z", DEFAULT_ISSUANCE_WINDOW_DAYS),
    linkedRecordId: "TR-2026-0042",
    policy: "(student_id=STU001) AND permission=granted",
    description: "Digitally signed transcript anchored to the student blockchain.",
  }

  const transcriptRequests: TranscriptRequest[] = [
    {
      id: "TR-2026-0042",
      studentId: DEMO_USER_IDS.student,
      purpose: "Graduate School Application",
      destination: "Stanford University",
      address: "admissions@stanford.edu",
      copies: 2,
      format: "Official PDF",
      notes: "Send before April 10",
      fee: 15,
      status: "ready",
      requestDate: "2026-03-28T10:30:00.000Z",
      readyAt: "2026-03-28T11:30:00.000Z",
      cid: transcriptCid,
      hashId: transcriptHash,
      qrData: `unichain://verify/${transcriptHash}`,
    },
    {
      id: "TR-2026-0038",
      studentId: DEMO_USER_IDS.student,
      purpose: "Employment Verification",
      destination: "Google",
      address: "hr@google.com",
      copies: 1,
      format: "Certified Digital",
      notes: "",
      fee: 15,
      status: "processing",
      requestDate: "2026-03-20T08:30:00.000Z",
    },
  ]

  const accessGrants: AccessGrant[] = [
    {
      id: "ACCESS-1",
      studentId: DEMO_USER_IDS.student,
      verifierEmail: "admissions@stanford.edu",
      verifierName: "Stanford University",
      verifierType: "Academic Institution",
      recordType: "Transcripts & Credentials",
      permissionScope: "transcript,degree",
      grantedDate: "2026-03-15T10:00:00.000Z",
      expiryDate: "2026-06-15T10:00:00.000Z",
      status: "active",
      accessCount: 3,
      policy: "(role=verifier AND institution=stanford)",
    },
    {
      id: "ACCESS-2",
      studentId: DEMO_USER_IDS.student,
      verifierEmail: "hr@google.com",
      verifierName: "Google Inc.",
      verifierType: "Corporate Employer",
      recordType: "Degree & GPA Only",
      permissionScope: "degree,gpa",
      grantedDate: "2026-02-15T10:00:00.000Z",
      expiryDate: "2026-03-15T10:00:00.000Z",
      status: "expired",
      accessCount: 1,
      policy: "(role=verifier AND institution=employer)",
    },
  ]

  const creditTransfers: CreditTransferRequest[] = [
    {
      id: "CT-2026-0012",
      studentId: DEMO_USER_IDS.student,
      sourceInstitution: DEFAULT_INSTITUTION,
      destinationInstitution: "National Institute of Technology",
      creditsRequested: 6,
      courseCodes: ["CS402", "MA301"],
      reason: "Semester exchange mapping",
      status: "pending",
      requestedAt: "2026-03-30T08:00:00.000Z",
    },
  ]

  const researchDocuments: ResearchDocument[] = [
    {
      id: "RES-001",
      facultyId: DEMO_USER_IDS.faculty,
      title: "Blockchain-enabled Academic Credential Integrity",
      department: "CSE",
      cid: cidFrom("research-paper-1"),
      sha256: txHash("research-paper-1"),
      visibility: "shared",
      uploadedAt: "2026-03-18T06:00:00.000Z",
    },
  ]

  const notifications: Notification[] = [
    {
      id: "NOTIF-1",
      userId: DEMO_USER_IDS.student,
      title: "Transcript ready for download",
      message: "Your transcript request TR-2026-0042 has been generated and pinned to IPFS.",
      type: "credential",
      createdAt: "2026-03-28T11:35:00.000Z",
      read: false,
      link: "/student-portal/transcript-request",
    },
    {
      id: "NOTIF-2",
      userId: DEMO_USER_IDS.student,
      title: "Accessed by Stanford University",
      message: "Stanford University used your active transcript access grant.",
      type: "access",
      createdAt: "2026-03-29T09:15:00.000Z",
      read: false,
      link: "/student-portal/access-control",
    },
  ]

  const validators: ValidatorNode[] = [
    {
      id: "VAL-STU-1",
      blockchain: "student",
      name: "Student Validator 1",
      stake: 1600,
      uptime: 99.91,
      status: "active",
      walletAddress: "0xA1186714B86168a7612d4894D11dA91df5a1F751",
    },
    {
      id: "VAL-STU-2",
      blockchain: "student",
      name: "Student Validator 2",
      stake: 1200,
      uptime: 99.65,
      status: "active",
      walletAddress: "0xA2186714B86168a7612d4894D11dA91df5a1F752",
    },
    {
      id: "VAL-FAC-1",
      blockchain: "faculty",
      name: "Faculty Validator 1",
      stake: 1750,
      uptime: 99.88,
      status: "active",
      walletAddress: "0xB1186714B86168a7612d4894D11dA91df5a1F751",
    },
    {
      id: "VAL-FAC-2",
      blockchain: "faculty",
      name: "Faculty Validator 2",
      stake: 1400,
      uptime: 99.45,
      status: "syncing",
      walletAddress: "0xB2186714B86168a7612d4894D11dA91df5a1F752",
    },
    {
      id: "VAL-INS-1",
      blockchain: "institutional",
      name: "Institutional Validator 1",
      stake: 2200,
      uptime: 99.96,
      status: "active",
      walletAddress: "0xC1186714B86168a7612d4894D11dA91df5a1F751",
    },
    {
      id: "VAL-INS-2",
      blockchain: "institutional",
      name: "Institutional Validator 2",
      stake: 1800,
      uptime: 99.72,
      status: "degraded",
      walletAddress: "0xC2186714B86168a7612d4894D11dA91df5a1F752",
    },
  ]

  const blocks: LedgerBlock[] = [
    {
      blockchain: "student",
      blockNumber: 0,
      blockHash: txHash("student-genesis"),
      previousHash: "0x0",
      validatorId: "VAL-STU-1",
      validatorSignatures: ["seed-signature"],
      transactionIds: [],
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      blockchain: "faculty",
      blockNumber: 0,
      blockHash: txHash("faculty-genesis"),
      previousHash: "0x0",
      validatorId: "VAL-FAC-1",
      validatorSignatures: ["seed-signature"],
      transactionIds: [],
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      blockchain: "institutional",
      blockNumber: 0,
      blockHash: txHash("institutional-genesis"),
      previousHash: "0x0",
      validatorId: "VAL-INS-1",
      validatorSignatures: ["seed-signature"],
      transactionIds: [],
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ]

  const transactions: LedgerTransaction[] = []
  const auditLogs: AuditLog[] = []

  const verificationLogs: VerificationLog[] = [
    {
      id: "VERIFY-LOG-1",
      verifierId: DEMO_USER_IDS.verifier,
      hash: transcriptHash,
      holderName: "Alice Johnson",
      result: "valid",
      vScore: 96,
      method: "hash",
      reasonCodes: [],
      checkedAt: "2026-03-29T09:15:00.000Z",
    },
  ]

  const verifierApiKeys: VerifierApiKey[] = [
    {
      id: "APIKEY-1",
      verifierId: DEMO_USER_IDS.verifier,
      label: "Stanford ATS Integration",
      keyPreview: "vk_live_stanford_7a2c...91d0",
      scopes: ["verify:read", "history:read"],
      createdAt: "2026-03-01T07:00:00.000Z",
      lastUsedAt: "2026-03-29T09:15:00.000Z",
      status: "active",
    },
  ]

  return {
    version: 1,
    lastUpdatedAt: seedTime,
    users,
    courses,
    grades,
    documents,
    credentials: [transcriptCredential],
    transcriptRequests,
    accessGrants,
    creditTransfers,
    researchDocuments,
    notifications,
    validators,
    transactions,
    blocks,
    auditLogs,
    verificationLogs,
    otpChallenges: [],
    verifierApiKeys,
    smartContracts: getContractInventory(),
  }
}

async function ensureDb() {
  await fs.mkdir(DATA_DIR, { recursive: true })

  try {
    await fs.access(DB_PATH)
  } catch {
    const seed = buildSeedDb()
    await fs.writeFile(DB_PATH, JSON.stringify(seed, null, 2), "utf8")
  }
}

async function readDb() {
  await ensureDb()
  const data = await fs.readFile(DB_PATH, "utf8")
  const parsed = JSON.parse(data) as Partial<UniChainDb>
  return {
    ...parsed,
    otpChallenges: parsed.otpChallenges ?? [],
  } as UniChainDb
}

async function writeDb(db: UniChainDb) {
  db.lastUpdatedAt = nowIso()
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8")
}

async function mutateDb<T>(fn: (db: UniChainDb) => T | Promise<T>) {
  const db = await readDb()
  const result = await fn(db)
  await writeDb(db)
  return result
}

function getUser(db: UniChainDb, userId: string) {
  return db.users.find((user) => user.id === userId) ?? null
}

export async function getUserByEmail(email: string) {
  const db = await readDb()
  return (
    db.users.find(
      (user) =>
        user.institutionalEmail.toLowerCase() === email.toLowerCase() ||
        user.personalEmail?.toLowerCase() === email.toLowerCase()
    ) ?? null
  )
}

function selectValidator(db: UniChainDb, blockchain: BlockchainKey, seed: string) {
  const validators = db.validators.filter((validator) => validator.blockchain === blockchain)
  if (validators.length === 0) {
    throw new Error(`No validators found for ${blockchain} blockchain`)
  }

  const totalStake = validators.reduce((sum, validator) => sum + validator.stake, 0)
  const needle = parseInt(sha256(seed).slice(0, 12), 16) % totalStake
  let cursor = 0
  for (const validator of validators) {
    cursor += validator.stake
    if (needle < cursor) {
      return validator
    }
  }

  return validators[0]
}

const LOCAL_RPC_URL = "http://127.0.0.1:8545";
const SYSTEM_DEPLOYER_PKEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
let auditLoggerContract: Contract | null = null;

function getAuditLoggerContract() {
  if (!auditLoggerContract) {
    try {
      const provider = new JsonRpcProvider(LOCAL_RPC_URL);
      const wallet = new Wallet(SYSTEM_DEPLOYER_PKEY, provider);
      const addrPath = path.join(process.cwd(), ".data", "contract-addresses.json");
      if (!existsSync(addrPath)) return null;
      
      const addrs = JSON.parse(readFileSync(addrPath, "utf8"));
      const abiPath = path.join(process.cwd(), "blockchain", "artifacts", "contracts", "AuditLogger.sol", "AuditLogger.json");
      if (!existsSync(abiPath)) return null;
      
      const { abi } = JSON.parse(readFileSync(abiPath, "utf8"));
      auditLoggerContract = new Contract(addrs.AuditLogger, abi, wallet);
    } catch(e) {
      console.warn("Failed to initialize AuditLogger RPC connection");
      return null;
    }
  }
  return auditLoggerContract;
}

function createLedgerEvent(
  db: UniChainDb,
  input: {
    blockchain: BlockchainKey
    actorId: string
    contractName: string
    type: string
    payload: Record<string, unknown>
  }
) {
  const payloadHash = txHash(JSON.stringify(input.payload))
  const transactionHash = txHash(`${input.type}:${payloadHash}:${nowIso()}`)
  const previousBlock = [...db.blocks]
    .filter((block) => block.blockchain === input.blockchain)
    .sort((left, right) => right.blockNumber - left.blockNumber)[0]

  const validator = selectValidator(db, input.blockchain, transactionHash)
  const blockNumber = (previousBlock?.blockNumber ?? -1) + 1
  const transactionId = randomUUID()
  const gasUsed = 110000 + (parseInt(payloadHash.slice(2, 10), 16) % 70000)

  const transaction: LedgerTransaction = {
    id: transactionId,
    blockchain: input.blockchain,
    type: input.type,
    actorId: input.actorId,
    contractName: input.contractName,
    payloadHash,
    transactionHash,
    createdAt: nowIso(),
    blockNumber,
    gasUsed,
  }

  const validatorSet = db.validators
    .filter((candidate) => candidate.blockchain === input.blockchain)
    .sort((left, right) => right.stake - left.stake)
    .slice(0, Math.max(1, Math.ceil((2 / 3) * db.validators.filter((candidate) => candidate.blockchain === input.blockchain).length)))

  const blockHash = txHash(
    `${input.blockchain}:${blockNumber}:${previousBlock?.blockHash ?? "0x0"}:${transactionHash}`
  )
  const block: LedgerBlock = {
    blockchain: input.blockchain,
    blockNumber,
    blockHash,
    previousHash: previousBlock?.blockHash ?? "0x0",
    validatorId: validator.id,
    validatorSignatures: validatorSet.map((candidate) => txHash(`${candidate.id}:${blockHash}`)),
    transactionIds: [transactionId],
    createdAt: transaction.createdAt,
  }

  // Real Blockchain Integration
  try {
     const logger = getAuditLoggerContract();
     if (logger) {
        logger.createLog(input.type, "payload", input.actorId, payloadHash)
          .then((tx: any) => console.log("✅ Blockchain Hash:", tx.hash))
          .catch((e: Error) => console.error("❌ RPC Error:", e.message));
     }
  } catch (e) {
     // Ignore to not block operations
  }

  db.transactions.push(transaction)
  db.blocks.push(block)

  return { transaction, block }
}

function createAuditLog(
  db: UniChainDb,
  input: {
    actorId: string
    actorRole: UserRole
    action: string
    targetType: string
    targetId: string
    blockchain: BlockchainKey
    details: Record<string, string | number | boolean | null>
    transactionHash: string
    blockNumber: number
    gasUsed: number
  }
) {
  const log: AuditLog = {
    id: randomUUID(),
    actorId: input.actorId,
    actorRole: input.actorRole,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    blockchain: input.blockchain,
    transactionHash: input.transactionHash,
    blockNumber: input.blockNumber,
    gasUsed: input.gasUsed,
    createdAt: nowIso(),
    details: input.details,
  }

  db.auditLogs.unshift(log)
  return log
}

function getStudentSummary(db: UniChainDb, studentId: string) {
  const student = getUser(db, studentId)
  if (!student) {
    throw new Error("Student not found")
  }

  const grades = db.grades.filter((record) => record.studentId === studentId && record.status === "approved")
  const courseMap = new Map(db.courses.map((course) => [course.id, course]))
  const creditsEarned = grades.reduce((sum, record) => {
    const course = courseMap.get(record.courseId)
    return sum + (course?.credits ?? 0)
  }, 0)
  const points = grades.reduce((sum, record) => {
    const course = courseMap.get(record.courseId)
    const credits = course?.credits ?? 0
    const numeric =
      record.grade.startsWith("A")
        ? 4
        : record.grade.startsWith("B")
          ? 3
          : record.grade.startsWith("C")
            ? 2
            : record.grade.startsWith("D")
              ? 1
              : 0
    return sum + numeric * credits
  }, 0)
  const cgpa = creditsEarned === 0 ? 0 : Number((points / creditsEarned).toFixed(2))

  return {
    student,
    cgpa,
    creditsEarned,
    grades,
    credentials: db.credentials.filter((credential) => credential.studentId === studentId),
    transcriptRequests: db.transcriptRequests.filter((request) => request.studentId === studentId),
    accessGrants: db.accessGrants.filter((grant) => grant.studentId === studentId),
    transfers: db.creditTransfers.filter((transfer) => transfer.studentId === studentId),
    notifications: db.notifications.filter((notification) => notification.userId === studentId),
    courses: db.courses.filter((course) => course.studentIds.includes(studentId)),
  }
}

function hasAccess(db: UniChainDb, credential: Credential, verifierEmail?: string) {
  if (!verifierEmail) {
    return true
  }

  const now = new Date()
  const grant = db.accessGrants.find(
    (entry) =>
      entry.studentId === credential.studentId &&
      entry.verifierEmail.toLowerCase() === verifierEmail.toLowerCase() &&
      entry.status === "active" &&
      new Date(entry.expiryDate) > now
  )

  return Boolean(grant)
}

function verificationReasonCodes(report: {
  hashMatch: boolean
  signatureValid: boolean
  timestampFresh: boolean
  accessGranted: boolean
}) {
  const reasons: string[] = []
  if (!report.accessGranted) reasons.push("ERR_ACCESS_DENIED")
  if (!report.hashMatch) reasons.push("ERR_HASH_MISMATCH")
  if (!report.signatureValid) reasons.push("ERR_SIGNATURE_INVALID")
  if (!report.timestampFresh) reasons.push("ERR_ISSUANCE_WINDOW")
  return reasons
}

export async function getDashboardData(role: UserRole, studentId?: string) {
  const db = await readDb()
  const resolvedStudentId = studentId ?? DEMO_USER_IDS.student

  if (role === "student") {
    const summary = getStudentSummary(db, resolvedStudentId)
    const recentGrades = summary.grades
      .map((grade) => ({
        ...grade,
        course: db.courses.find((course) => course.id === grade.courseId),
      }))
      .slice(-4)
      .reverse()

    return {
      student: summary.student,
      cgpa: summary.cgpa,
      creditsEarned: summary.creditsEarned,
      activeCourses: summary.courses.length,
      pendingRequests: summary.transcriptRequests.filter((request) => request.status !== "ready").length,
      recentGrades,
      upcomingDeadlines: [
        { title: "Transcript request review", date: "2026-04-05", type: "Administrative", urgent: true },
        { title: "Credit transfer approval window", date: "2026-04-09", type: "Transfer", urgent: false },
        { title: "Credential access grant expiry", date: "2026-06-15", type: "Privacy", urgent: false },
      ],
      credentialPreview: summary.credentials.slice(0, 3),
    }
  }

  if (role === "faculty") {
    const facultyCourses = db.courses.filter((course) => course.facultyId === DEMO_USER_IDS.faculty)
    const gradeRecords = db.grades.filter((grade) => facultyCourses.some((course) => course.id === grade.courseId))
    const pendingTransfers = db.creditTransfers.filter((transfer) => transfer.status === "pending").length

    return {
      courses: facultyCourses.length,
      students: new Set(facultyCourses.flatMap((course) => course.studentIds)).size,
      approvedGrades: gradeRecords.filter((grade) => grade.status === "approved").length,
      pendingTransfers,
      recentActivity: db.auditLogs.slice(0, 8),
    }
  }

  return {
    metrics: getSystemOverviewSnapshot(db),
  }
}

function getSystemOverviewSnapshot(db: UniChainDb) {
  const activeValidators = db.validators.filter((validator) => validator.status === "active")
  const topics = [
    { name: "student-bc-txns", lag: 12, rate: 1240, consumers: 3 },
    { name: "faculty-bc-txns", lag: 9, rate: 880, consumers: 3 },
    { name: "institutional-bc-txns", lag: 6, rate: 640, consumers: 3 },
    { name: "audit-events", lag: 4, rate: 310, consumers: 2 },
    { name: "notifications", lag: 3, rate: 72, consumers: 2 },
  ]
  const pods = [
    { name: "student-bc-0", namespace: "blockchain-nodes", status: "Running", cpu: "42%", memory: "1.1Gi" },
    { name: "student-bc-1", namespace: "blockchain-nodes", status: "Running", cpu: "38%", memory: "1.0Gi" },
    { name: "faculty-bc-0", namespace: "blockchain-nodes", status: "Running", cpu: "46%", memory: "1.2Gi" },
    { name: "institutional-bc-0", namespace: "blockchain-nodes", status: "Running", cpu: "49%", memory: "1.4Gi" },
    { name: "kafka-broker-0", namespace: "kafka-cluster", status: "Running", cpu: "28%", memory: "820Mi" },
    { name: "ipfs-node-0", namespace: "storage", status: "Running", cpu: "31%", memory: "760Mi" },
  ]

  return {
    tps: 1247,
    peakTps: 2891,
    pendingTransactions: Math.max(8, db.transactions.length % 97),
    averageWaitSeconds: 1.2,
    activeValidators: activeValidators.length,
    totalValidators: db.validators.length,
    ipfsStorage: "2.4 TB",
    ipfsUtilization: "78%",
    tpsSeries: [
      { time: "00:00", tps: 850 },
      { time: "04:00", tps: 430 },
      { time: "08:00", tps: 1200 },
      { time: "12:00", tps: 2100 },
      { time: "16:00", tps: 2400 },
      { time: "20:00", tps: 1400 },
    ],
    kafkaLagSeries: [
      { time: "00:00", studentTopic: 120, facultyTopic: 80, credentialsTopic: 200 },
      { time: "08:00", studentTopic: 450, facultyTopic: 320, credentialsTopic: 890 },
      { time: "16:00", studentTopic: 520, facultyTopic: 380, credentialsTopic: 1200 },
      { time: "20:00", studentTopic: 280, facultyTopic: 150, credentialsTopic: 420 },
    ],
    errorRateSeries: [
      { endpoint: "/api/student/transcript/request", rate: 0.04 },
      { endpoint: "/api/faculty/grade/submit", rate: 0.06 },
      { endpoint: "/api/credential/verify", rate: 0.03 },
      { endpoint: "/api/ipfs/upload", rate: 0.02 },
      { endpoint: "/api/access/grant", rate: 0.01 },
    ],
    serviceHealth: [
      { name: "Student Service", status: "healthy", latency: "18ms", uptime: "99.98%" },
      { name: "Faculty Service", status: "healthy", latency: "21ms", uptime: "99.97%" },
      { name: "Credential Service", status: "healthy", latency: "34ms", uptime: "99.95%" },
      { name: "IPFS Gateway", status: "healthy", latency: "87ms", uptime: "99.93%" },
      { name: "Kafka Broker", status: "healthy", latency: "6ms", uptime: "99.99%" },
      { name: "API Gateway", status: "degraded", latency: "162ms", uptime: "99.52%" },
      { name: "Notification Service", status: "healthy", latency: "19ms", uptime: "99.89%" },
      { name: "Audit Logger", status: "healthy", latency: "22ms", uptime: "99.96%" },
    ],
    validators: db.validators,
    topics,
    pods,
    smartContracts: db.smartContracts,
    auditLogs: db.auditLogs.slice(0, 20),
  }
}

export async function registerUserProfile(input: {
  email: string
  role: UserRole
  fullName?: string
  personalEmail?: string
  phone?: string
  dateOfBirth?: string
  gender?: "male" | "female" | "prefer-not-to-say"
  department?: string
  programme?: string
  enrollmentId?: string
  joinYear?: string
  profilePhotoUrl?: string
  walletAddress?: string | null
  mfaEnabled?: boolean
}) {
  return mutateDb((db) => {
    const existing = db.users.find(
      (user) => user.institutionalEmail.toLowerCase() === input.email.toLowerCase()
    )

    if (existing) {
      return existing
    }

    const prefix = input.role === "student" ? "STU" : input.role === "faculty" ? "FAC" : input.role === "admin" ? "ADM" : "VER"
    const userId = `${prefix}${String(db.users.filter((user) => user.role === input.role).length + 1).padStart(3, "0")}`
    const createdUser: User = {
      id: userId,
      role: input.role,
      fullName: input.fullName ?? input.email.split("@")[0],
      institutionalEmail: input.email,
      personalEmail: input.personalEmail,
      phone: input.phone,
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
      department: input.department,
      programme: input.programme,
      joinYear: input.joinYear,
      profilePhotoUrl: input.profilePhotoUrl,
      did: makeDid(input.role, userId),
      walletAddress:
        input.walletAddress || Wallet.createRandom().address,
      attributes: [`role=${input.role}`, `dept=${input.department ?? "General"}`],
      mfaEnabled: input.mfaEnabled ?? true,
      mfaSecret: (input.mfaEnabled ?? true) ? speakeasy.generateSecret().base32 : undefined,
      enrollmentId: input.enrollmentId,
      governmentIdVerified: input.role === "student",
      graduationFeeCleared: input.role !== "student",
      keyStatus: "active",
      createdAt: nowIso(),
    }

    db.users.push(createdUser)
    const ledger = createLedgerEvent(db, {
      blockchain: "institutional",
      actorId: createdUser.id,
      contractName: "DIDRegistry.sol",
      type: "user.registered",
      payload: {
        did: createdUser.did,
        email: createdUser.institutionalEmail,
        walletAddress: createdUser.walletAddress,
      },
    })
    createAuditLog(db, {
      actorId: createdUser.id,
      actorRole: createdUser.role,
      action: "user.registered",
      targetType: "user",
      targetId: createdUser.id,
      blockchain: "institutional",
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        did: createdUser.did,
        email: createdUser.institutionalEmail,
      },
    })
    return createdUser
  })
}

export async function logSuccessfulLogin(email: string) {
  return mutateDb((db) => {
    const user = db.users.find((entry) => entry.institutionalEmail.toLowerCase() === email.toLowerCase())
    if (!user) {
      return null
    }

    user.lastLoginAt = nowIso()
    const ledger = createLedgerEvent(db, {
      blockchain: "institutional",
      actorId: user.id,
      contractName: "AuditLogger.sol",
      type: "auth.login",
      payload: {
        email: user.institutionalEmail,
        did: user.did,
      },
    })
    createAuditLog(db, {
      actorId: user.id,
      actorRole: user.role,
      action: "auth.login",
      targetType: "session",
      targetId: user.id,
      blockchain: "institutional",
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        email: user.institutionalEmail,
      },
    })
    return user
  })
}

export async function logSuccessfulLogout(email: string) {
  return mutateDb((db) => {
    const user = db.users.find((entry) => entry.institutionalEmail.toLowerCase() === email.toLowerCase())
    if (!user) {
      return null
    }

    const ledger = createLedgerEvent(db, {
      blockchain: "institutional",
      actorId: user.id,
      contractName: "AuditLogger.sol",
      type: "auth.logout",
      payload: {
        email: user.institutionalEmail,
        did: user.did,
      },
    })
    createAuditLog(db, {
      actorId: user.id,
      actorRole: user.role,
      action: "auth.logout",
      targetType: "session",
      targetId: user.id,
      blockchain: "institutional",
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        email: user.institutionalEmail,
      },
    })
    return user
  })
}

export async function createOtpChallenge(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const code = createOtpCode()
  const createdAt = nowIso()
  const challenge: OtpChallenge = {
    id: randomUUID(),
    email: normalizedEmail,
    codeHash: otpHash(code, normalizedEmail),
    createdAt,
    expiresAt: plusMinutes(createdAt, OTP_TTL_MINUTES),
  }

  await mutateDb((db) => {
    db.otpChallenges = db.otpChallenges.filter(
      (entry) => entry.email !== normalizedEmail && new Date(entry.expiresAt).getTime() > Date.now()
    )
    db.otpChallenges.unshift(challenge)
    return challenge
  })

  return { code, expiresAt: challenge.expiresAt }
}

export async function consumeOtpChallenge(email: string, code: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedCode = code.trim()

  return mutateDb((db) => {
    const challenge = db.otpChallenges.find(
      (entry) =>
        entry.email === normalizedEmail &&
        !entry.consumedAt &&
        new Date(entry.expiresAt).getTime() > Date.now()
    )

    if (!challenge) {
      return false
    }

    const matches = challenge.codeHash === otpHash(normalizedCode, normalizedEmail)
    if (!matches) {
      return false
    }

    challenge.consumedAt = nowIso()
    return true
  })
}

export async function createTranscriptRequest(input: {
  studentId?: string
  purpose: string
  destination: string
  address: string
  copies: number
  format: string
  notes?: string
}) {
  return mutateDb((db) => {
    const studentId = input.studentId ?? DEMO_USER_IDS.student
    const summary = getStudentSummary(db, studentId)
    const requestId = `TR-${new Date().getUTCFullYear()}-${String(db.transcriptRequests.length + 43).padStart(4, "0")}`
    const transcriptPayload = JSON.stringify(
      {
        student: {
          id: summary.student.id,
          name: summary.student.fullName,
          did: summary.student.did,
          programme: summary.student.programme,
          department: summary.student.department,
        },
        cgpa: summary.cgpa,
        creditsEarned: summary.creditsEarned,
        grades: summary.grades.map((grade) => {
          const course = db.courses.find((item) => item.id === grade.courseId)
          return {
            code: course?.code,
            title: course?.title,
            term: grade.term,
            credits: course?.credits,
            grade: grade.grade,
            total: grade.total,
          }
        }),
      },
      null,
      2
    )
    const hashId = txHash(transcriptPayload)
    const cid = cidFrom(transcriptPayload)
    const createdAt = nowIso()
    const request: TranscriptRequest = {
      id: requestId,
      studentId,
      purpose: input.purpose,
      destination: input.destination,
      address: input.address,
      copies: input.copies,
      format: input.format,
      notes: input.notes ?? "",
      fee: 15,
      status: "ready",
      requestDate: createdAt,
      readyAt: createdAt,
      cid,
      hashId,
      qrData: `unichain://verify/${hashId}`,
    }

    const document: StoredDocument = {
      id: `DOC-${requestId}`,
      ownerId: studentId,
      type: "academic-transcript",
      title: `${summary.student.fullName} Transcript`,
      cid,
      sha256: hashId,
      sizeKb: Math.max(64, Math.round(transcriptPayload.length / 8)),
      ...createEncryptedPayload(transcriptPayload, "(student_id=STU001) AND permission=granted", {
        requestId,
        type: "academic-transcript",
      }),
      plaintextPreview: `${summary.student.fullName} academic transcript`,
      policy: "(student_id=STU001) AND permission=granted",
      pinned: true,
      uploadedAt: createdAt,
      metadata: {
        requestId,
        destination: input.destination,
      },
    }

    const signatories = [DEMO_USER_IDS.faculty, DEMO_USER_IDS.admin]
    const credential: Credential = {
      id: `CRED-${requestId}`,
      studentId,
      type: "transcript",
      title: "Official Academic Transcript",
      issuer: DEFAULT_INSTITUTION,
      issueDate: createdAt,
      expiryDate: null,
      status: "active",
      vScore: 98,
      hashId,
      cid,
      sha256: hashId,
      blockchain: "student",
      contractName: "TranscriptManager.sol",
      aggregateSignature: aggregateSignature(hashId, signatories),
      signatoryIds: signatories,
      merkleRoot: buildMerkleRoot(
        db.credentials
          .filter((item) => item.studentId === studentId)
          .map((item) => item.hashId)
          .concat(hashId)
      ),
      issuanceWindowEnd: plusDays(createdAt, DEFAULT_ISSUANCE_WINDOW_DAYS),
      linkedRecordId: requestId,
      policy: "(student_id=STU001) AND permission=granted",
      description: "Official transcript generated through the TranscriptManager workflow.",
    }

    db.transcriptRequests.unshift(request)
    db.documents.unshift(document)
    db.credentials.unshift(credential)
    db.notifications.unshift({
      id: randomUUID(),
      userId: studentId,
      title: "Transcript ready",
      message: `Transcript ${requestId} has been generated and pinned to IPFS.`,
      type: "credential",
      createdAt,
      read: false,
      link: "/student-portal/transcript-request",
    })

    const ledger = createLedgerEvent(db, {
      blockchain: "student",
      actorId: studentId,
      contractName: "TranscriptManager.sol",
      type: "transcript.requested",
      payload: {
        requestId,
        hashId,
        cid,
      },
    })
    createAuditLog(db, {
      actorId: studentId,
      actorRole: "student",
      action: "transcript.requested",
      targetType: "transcript-request",
      targetId: requestId,
      blockchain: "student",
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        destination: input.destination,
        format: input.format,
      },
    })

    return {
      request,
      credential,
    }
  })
}

export async function getTranscriptRequests(studentId: string = DEMO_USER_IDS.student) {
  const db = await readDb()
  return db.transcriptRequests.filter((request) => request.studentId === studentId)
}

export async function getTranscriptRequestById(id: string) {
  const db = await readDb()
  const request = db.transcriptRequests.find((entry) => entry.id === id) ?? null
  if (!request) {
    return null
  }

  return {
    ...request,
    credential:
      db.credentials.find((credential) => credential.linkedRecordId === request.id) ?? null,
  }
}

export async function submitGrades(input: {
  facultyId?: string
  courseId: string
  term: string
  grades: Array<{ studentId: string; internal: number; external: number }>
}) {
  return mutateDb((db) => {
    const facultyId = input.facultyId ?? DEMO_USER_IDS.faculty
    const course = db.courses.find((entry) => entry.id === input.courseId || entry.code === input.courseId)
    if (!course) {
      throw new Error("Course not found")
    }

    const submittedAt = nowIso()
    const updatedRecords = input.grades.map((entry) => {
      const total = entry.internal + entry.external
      const existing = db.grades.find(
        (grade) => grade.studentId === entry.studentId && grade.courseId === course.id && grade.term === input.term
      )

      if (existing) {
        existing.internal = entry.internal
        existing.external = entry.external
        existing.total = total
        existing.grade = gradeFromTotal(total)
        existing.status = "approved"
        existing.submittedBy = facultyId
        existing.submittedAt = submittedAt
        existing.approvedBy = DEMO_USER_IDS.admin
        existing.approvedAt = submittedAt
        return existing
      }

      const record: GradeRecord = {
        id: randomUUID(),
        studentId: entry.studentId,
        courseId: course.id,
        term: input.term,
        internal: entry.internal,
        external: entry.external,
        total,
        grade: gradeFromTotal(total),
        status: "approved",
        submittedBy: facultyId,
        submittedAt,
        approvedBy: DEMO_USER_IDS.admin,
        approvedAt: submittedAt,
      }
      db.grades.push(record)
      return record
    })

    const totals = updatedRecords.map((record) => record.total)
    const average = totals.reduce((sum, value) => sum + value, 0) / Math.max(1, totals.length)
    const passCount = totals.filter((value) => value >= 40).length
    const ledger = createLedgerEvent(db, {
      blockchain: "faculty",
      actorId: facultyId,
      contractName: "GradeRegistry.sol",
      type: "grade.submitted",
      payload: {
        course: course.code,
        term: input.term,
        studentCount: updatedRecords.length,
        average,
      },
    })
    createAuditLog(db, {
      actorId: facultyId,
      actorRole: "faculty",
      action: "grade.submitted",
      targetType: "course",
      targetId: course.id,
      blockchain: "faculty",
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        average: Number(average.toFixed(2)),
        passRate: Number(((passCount / Math.max(1, totals.length)) * 100).toFixed(1)),
      },
    })

    updatedRecords.forEach((record) => {
      db.notifications.unshift({
        id: randomUUID(),
        userId: record.studentId,
        title: `Grade published for ${course.code}`,
        message: `${course.title}: ${record.grade} (${record.total}/100)`,
        type: "grade",
        createdAt: submittedAt,
        read: false,
        link: "/student-portal/academics",
      })
    })

    return {
      course,
      analytics: {
        average: Number(average.toFixed(2)),
        passRate: Number(((passCount / Math.max(1, totals.length)) * 100).toFixed(1)),
        distribution: {
          A: updatedRecords.filter((record) => record.grade.startsWith("A")).length,
          B: updatedRecords.filter((record) => record.grade.startsWith("B")).length,
          C: updatedRecords.filter((record) => record.grade.startsWith("C")).length,
          D: updatedRecords.filter((record) => record.grade.startsWith("D")).length,
          F: updatedRecords.filter((record) => record.grade === "F").length,
        },
      },
      records: updatedRecords,
    }
  })
}

export async function getCourseRoster(courseId = "COURSE-CS401") {
  const db = await readDb()
  const course = db.courses.find((entry) => entry.id === courseId || entry.code === courseId)
  if (!course) {
    throw new Error("Course not found")
  }

  return course.studentIds.map((studentId) => {
    const student = getUser(db, studentId)
    const grade = db.grades.find((entry) => entry.studentId === studentId && entry.courseId === course.id)
    return {
      id: studentId,
      rollNo: student?.enrollmentId ?? studentId,
      name: student?.fullName ?? studentId,
      internal: grade?.internal ?? 0,
      external: grade?.external ?? 0,
      total: grade?.total ?? 0,
      grade: grade?.grade ?? "F",
      status: "valid",
    }
  })
}

export async function issueDegree(input: { studentIds: string[]; issuedBy?: string }) {
  return mutateDb((db) => {
    const issuedBy = input.issuedBy ?? DEMO_USER_IDS.admin
    const results = input.studentIds.map((studentId) => {
      const summary = getStudentSummary(db, studentId)
      const eligible = summary.creditsEarned >= 10 && summary.cgpa >= 3 && summary.student.graduationFeeCleared !== false

      if (!eligible) {
        return {
          studentId,
          issued: false,
          reason: "Eligibility criteria not met",
        }
      }

      const issueDate = nowIso()
      const degreePayload = JSON.stringify({
        studentId,
        name: summary.student.fullName,
        programme: `${summary.student.programme} ${summary.student.department}`,
        cgpa: summary.cgpa,
        issuedBy,
      })
      const hashId = txHash(degreePayload)
      const cid = cidFrom(degreePayload)
      const signatoryIds = [DEMO_USER_IDS.admin, DEMO_USER_IDS.faculty, issuedBy]

      const credential: Credential = {
        id: `DEG-${studentId}-${db.credentials.length + 1}`,
        studentId,
        type: "degree",
        title: `${summary.student.programme} in ${summary.student.department}`,
        issuer: DEFAULT_INSTITUTION,
        issueDate,
        expiryDate: null,
        status: "active",
        vScore: 100,
        hashId,
        cid,
        sha256: hashId,
        blockchain: "institutional",
        contractName: "CredentialIssuance.sol",
        aggregateSignature: aggregateSignature(hashId, signatoryIds),
        signatoryIds,
        merkleRoot: buildMerkleRoot(
          db.credentials
            .filter((item) => item.studentId === studentId)
            .map((item) => item.hashId)
            .concat(hashId)
        ),
        issuanceWindowEnd: plusDays(issueDate, DEFAULT_ISSUANCE_WINDOW_DAYS),
        policy: "(student_id=owner) AND permission=granted",
        description: "BLS-signed digital degree issued through the institutional blockchain.",
      }

      const document: StoredDocument = {
        id: `DOC-${credential.id}`,
        ownerId: studentId,
        type: "degree-certificate",
        title: credential.title,
        cid,
        sha256: hashId,
        sizeKb: 240,
        ...createEncryptedPayload(degreePayload, credential.policy, {
          type: "degree-certificate",
          studentId,
        }),
        plaintextPreview: `Degree certificate for ${summary.student.fullName}`,
        policy: credential.policy,
        pinned: true,
        uploadedAt: issueDate,
        metadata: {
          type: "degree",
          studentId,
        },
      }

      db.credentials.unshift(credential)
      db.documents.unshift(document)
      db.notifications.unshift({
        id: randomUUID(),
        userId: studentId,
        title: "Degree credential issued",
        message: `${credential.title} has been issued and anchored on the institutional blockchain.`,
        type: "credential",
        createdAt: issueDate,
        read: false,
        link: "/student-portal/credentials",
      })

      const ledger = createLedgerEvent(db, {
        blockchain: "institutional",
        actorId: issuedBy,
        contractName: "CredentialIssuance.sol",
        type: "degree.issued",
        payload: {
          studentId,
          hashId,
          cid,
        },
      })
      createAuditLog(db, {
        actorId: issuedBy,
        actorRole: "admin",
        action: "degree.issued",
        targetType: "credential",
        targetId: credential.id,
        blockchain: "institutional",
        transactionHash: ledger.transaction.transactionHash,
        blockNumber: ledger.block.blockNumber,
        gasUsed: ledger.transaction.gasUsed,
        details: {
          studentId,
          credentialType: credential.type,
        },
      })

      return {
        studentId,
        issued: true,
        credential,
      }
    })

    return results
  })
}

export async function getEligibleDegreeCandidates() {
  const db = await readDb()
  return db.users
    .filter((user) => user.role === "student")
    .map((student) => {
      const summary = getStudentSummary(db, student.id)
      const issuedAlready = db.credentials.some(
        (credential) => credential.studentId === student.id && credential.type === "degree"
      )
      return {
        id: student.id,
        name: student.fullName,
        program: `${student.programme} ${student.department}`,
        batch: `${student.joinYear}-2026`,
        cgpa: summary.cgpa,
        credits: summary.creditsEarned,
        requiredCredits: 10,
        status: issuedAlready ? "issued" : summary.cgpa >= 3 ? "eligible" : "pending",
      }
    })
}

export async function listStudentCredentials(studentId: string = DEMO_USER_IDS.student) {
  const db = await readDb()
  return db.credentials.filter((credential) => credential.studentId === studentId)
}

export async function listStudentAccessGrants(studentId: string = DEMO_USER_IDS.student) {
  const db = await readDb()
  return db.accessGrants.filter((grant) => grant.studentId === studentId)
}

export async function grantAccess(input: {
  studentId?: string
  verifierEmail: string
  verifierName: string
  verifierType: string
  recordType: string
  expiryDays: number
}) {
  return mutateDb((db) => {
    const studentId = input.studentId ?? DEMO_USER_IDS.student
    const createdAt = nowIso()
    const grant: AccessGrant = {
      id: randomUUID(),
      studentId,
      verifierEmail: input.verifierEmail,
      verifierName: input.verifierName,
      verifierType: input.verifierType,
      recordType: input.recordType,
      permissionScope: input.recordType.toLowerCase().replaceAll(" ", ","),
      grantedDate: createdAt,
      expiryDate: plusDays(createdAt, input.expiryDays),
      status: "active",
      accessCount: 0,
      policy: `(role=verifier AND email=${input.verifierEmail})`,
    }
    db.accessGrants.unshift(grant)

    const ledger = createLedgerEvent(db, {
      blockchain: "student",
      actorId: studentId,
      contractName: "AccessControl.sol",
      type: "access.granted",
      payload: {
        grantId: grant.id,
        verifierEmail: grant.verifierEmail,
        recordType: grant.recordType,
      },
    })
    createAuditLog(db, {
      actorId: studentId,
      actorRole: "student",
      action: "access.granted",
      targetType: "access-grant",
      targetId: grant.id,
      blockchain: "student",
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        verifierEmail: grant.verifierEmail,
        recordType: grant.recordType,
      },
    })

    return grant
  })
}

export async function revokeAccess(grantId: string, studentId: string = DEMO_USER_IDS.student) {
  return mutateDb((db) => {
    const grant = db.accessGrants.find((entry) => entry.id === grantId && entry.studentId === studentId)
    if (!grant) {
      throw new Error("Access grant not found")
    }

    grant.status = "revoked"
    const ledger = createLedgerEvent(db, {
      blockchain: "student",
      actorId: studentId,
      contractName: "AccessControl.sol",
      type: "access.revoked",
      payload: {
        grantId,
        verifierEmail: grant.verifierEmail,
      },
    })
    createAuditLog(db, {
      actorId: studentId,
      actorRole: "student",
      action: "access.revoked",
      targetType: "access-grant",
      targetId: grant.id,
      blockchain: "student",
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        verifierEmail: grant.verifierEmail,
      },
    })

    return grant
  })
}

export async function verifyCredentialByHash(input: {
  hash: string
  method?: VerificationMethod
  verifierEmail?: string
}) {
  return mutateDb((db) => {
    const credential =
      db.credentials.find((entry) => entry.hashId === input.hash || entry.cid === input.hash) ?? null
    const holder = credential ? getUser(db, credential.studentId) : null
    const accessGranted = credential ? hasAccess(db, credential, input.verifierEmail) : false
    const hashMatch = Boolean(credential)
    const signatureValid = Boolean(
      credential &&
        credential.aggregateSignature === aggregateSignature(credential.hashId, credential.signatoryIds)
    )
    const timestampFresh = Boolean(
      credential && new Date(credential.issuanceWindowEnd).getTime() >= Date.now()
    )

    const checks = {
      hashMatch,
      signatureValid,
      timestampFresh,
      accessGranted: credential ? accessGranted : false,
    }
    const score =
      (checks.hashMatch ? 0.4 : 0) +
      (checks.signatureValid ? 0.4 : 0) +
      (checks.timestampFresh ? 0.2 : 0)
    const vScore = Math.round(score * 100)
    const reasonCodes = verificationReasonCodes(checks)
    const status = reasonCodes.length === 0 ? "valid" : "invalid"

    if (credential) {
      const grant = db.accessGrants.find(
        (entry) =>
          input.verifierEmail &&
          entry.studentId === credential.studentId &&
          entry.verifierEmail.toLowerCase() === input.verifierEmail.toLowerCase() &&
          entry.status === "active"
      )
      if (grant) {
        grant.accessCount += 1
      }
    }

    const verifierId =
      db.users.find(
        (user) =>
          input.verifierEmail &&
          user.institutionalEmail.toLowerCase() === input.verifierEmail.toLowerCase()
      )?.id ?? DEMO_USER_IDS.verifier

    const log: VerificationLog = {
      id: randomUUID(),
      verifierId,
      hash: input.hash,
      holderName: holder?.fullName ?? "Unknown",
      result: status,
      vScore,
      method: input.method ?? "hash",
      reasonCodes,
      checkedAt: nowIso(),
    }
    db.verificationLogs.unshift(log)

    const ledger = createLedgerEvent(db, {
      blockchain: "institutional",
      actorId: verifierId,
      contractName: "AuditLogger.sol",
      type: "credential.verified",
      payload: {
        hash: input.hash,
        status,
        vScore,
      },
    })
    createAuditLog(db, {
      actorId: verifierId,
      actorRole: "verifier",
      action: "credential.verified",
      targetType: "credential",
      targetId: credential?.id ?? input.hash,
      blockchain: "institutional",
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        status,
        vScore,
      },
    })

    const proofTx = credential
      ? db.transactions
          .filter((entry) => entry.contractName === credential.contractName)
          .sort((left, right) => right.blockNumber - left.blockNumber)[0] ?? null
      : null
    const contractAddress = credential
      ? db.smartContracts.find((entry) => entry.name === credential.contractName)?.address ?? ""
      : ""

    const report: VerificationReport = {
      status,
      vScore,
      credential,
      holderName: holder?.fullName ?? null,
      issuer: credential?.issuer ?? null,
      issueDate: credential?.issueDate ?? null,
      checks,
      reasonCodes,
      blockchainProof: credential && proofTx
        ? {
            transactionHash: proofTx.transactionHash,
            blockNumber: proofTx.blockNumber,
            network: NETWORK_LABEL,
            contractAddress,
            gasUsed: proofTx.gasUsed,
            timestamp: proofTx.createdAt,
          }
        : null,
    }

    return report
  })
}

export async function getVerificationHistory(verifierId: string = DEMO_USER_IDS.verifier) {
  const db = await readDb()
  return db.verificationLogs.filter((entry) => entry.verifierId === verifierId)
}

export async function getVerifierApiKeys(verifierId: string = DEMO_USER_IDS.verifier) {
  const db = await readDb()
  return db.verifierApiKeys.filter((entry) => entry.verifierId === verifierId)
}

export async function createVerifierApiKey(input: {
  verifierId?: string
  label: string
  scopes: string[]
}) {
  return mutateDb((db) => {
    const verifierId = input.verifierId ?? DEMO_USER_IDS.verifier
    const rawKey = `vk_live_${sha256(`${verifierId}:${input.label}:${nowIso()}`)}`
    const apiKey: VerifierApiKey = {
      id: randomUUID(),
      verifierId,
      label: input.label,
      keyPreview: `${rawKey.slice(0, 20)}...${rawKey.slice(-6)}`,
      scopes: input.scopes.length > 0 ? input.scopes : ["verify:read"],
      createdAt: nowIso(),
      status: "active",
    }
    db.verifierApiKeys.unshift(apiKey)

    const ledger = createLedgerEvent(db, {
      blockchain: "institutional",
      actorId: verifierId,
      contractName: "AuditLogger.sol",
      type: "verifier.apikey.created",
      payload: {
        apiKeyId: apiKey.id,
        scopes: apiKey.scopes,
      },
    })
    createAuditLog(db, {
      actorId: verifierId,
      actorRole: "verifier",
      action: "verifier.apikey.created",
      targetType: "api-key",
      targetId: apiKey.id,
      blockchain: "institutional",
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        label: apiKey.label,
        scopes: apiKey.scopes.join(","),
      },
    })

    return { apiKey, rawKey }
  })
}

export async function revokeVerifierApiKey(apiKeyId: string, verifierId: string = DEMO_USER_IDS.verifier) {
  return mutateDb((db) => {
    const apiKey = db.verifierApiKeys.find((entry) => entry.id === apiKeyId && entry.verifierId === verifierId)
    if (!apiKey) {
      throw new Error("API key not found")
    }
    apiKey.status = "revoked"

    const ledger = createLedgerEvent(db, {
      blockchain: "institutional",
      actorId: verifierId,
      contractName: "AuditLogger.sol",
      type: "verifier.apikey.revoked",
      payload: {
        apiKeyId,
      },
    })
    createAuditLog(db, {
      actorId: verifierId,
      actorRole: "verifier",
      action: "verifier.apikey.revoked",
      targetType: "api-key",
      targetId: apiKeyId,
      blockchain: "institutional",
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        label: apiKey.label,
      },
    })

    return apiKey
  })
}

export async function uploadDocument(input: {
  ownerId?: string
  title: string
  type: StoredDocument["type"]
  body: string
  policy: string
}) {
  return mutateDb((db) => {
    const ownerId = input.ownerId ?? DEMO_USER_IDS.faculty
    validateDocumentInput(input.type, input.body)
    if (!input.policy.trim()) {
      throw new Error("Document policy is required")
    }
    const hashId = txHash(input.body)
    const cid = cidFrom(input.body)
    const payloadData = createEncryptedPayload(input.body, input.policy, {
         ownerId,
         type: input.type,
    });
    
    // Asynchronously write to off-chain IPFS storage
    const blobPath = path.join(process.cwd(), ".data", "ipfs-blobs", `${cid}.bin`);
    fs.mkdir(path.dirname(blobPath), { recursive: true }).then(() => 
      fs.writeFile(blobPath, payloadData.encryptedPayload, "utf8")
    ).catch(e => console.error("IPFS OFF-CHAIN WRITE ERROR:", e));

    const document: StoredDocument = {
      id: randomUUID(),
      ownerId,
      type: input.type,
      title: input.title,
      cid,
      sha256: hashId,
      sizeKb: Math.max(1, Math.round(input.body.length / 20)),
      encryptedPayload: "OFF_CHAIN_IPFS_DATABLOCK",
      plaintextPreview: input.body.slice(0, 80),
      policy: input.policy,
      pinned: true,
      uploadedAt: nowIso(),
      metadata: {
        title: input.title,
      },
    }
    db.documents.unshift(document)
    const ledger = createLedgerEvent(db, {
      blockchain: "faculty",
      actorId: ownerId,
      contractName: "AuditLogger.sol",
      type: "ipfs.uploaded",
      payload: {
        cid,
        sha256: hashId,
      },
    })
    createAuditLog(db, {
      actorId: ownerId,
      actorRole: "faculty",
      action: "ipfs.uploaded",
      targetType: "document",
      targetId: document.id,
      blockchain: "faculty",
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        cid,
        title: input.title,
      },
    })
    return document
  })
}

export async function listStoredDocuments(filters: {
  ownerId?: string
  type?: StoredDocument["type"]
  pinned?: boolean
} = {}) {
  const db = await readDb()
  const docs = db.documents
    .filter((document) => (filters.ownerId ? document.ownerId === filters.ownerId : true))
    .filter((document) => (filters.type ? document.type === filters.type : true))
    .filter((document) => (typeof filters.pinned === "boolean" ? document.pinned === filters.pinned : true))

  await Promise.all(docs.map(async (doc) => {
    if (doc.encryptedPayload === "OFF_CHAIN_IPFS_DATABLOCK") {
      try {
        const blobPath = path.join(process.cwd(), ".data", "ipfs-blobs", `${doc.cid}.bin`)
        doc.encryptedPayload = await fs.readFile(blobPath, "utf8")
      } catch (e) {
        console.error(`Failed to hydrate IPFS payload for document ${doc.id}:`, e)
      }
    }
  }))

  return docs
}

export async function getStoredDocument(documentId: string) {
  const db = await readDb()
  const doc = db.documents.find((entry) => entry.id === documentId) ?? null
  if (doc && doc.encryptedPayload === "OFF_CHAIN_IPFS_DATABLOCK") {
      try {
        const blobPath = path.join(process.cwd(), ".data", "ipfs-blobs", `${doc.cid}.bin`)
        doc.encryptedPayload = await fs.readFile(blobPath, "utf8")
      } catch (e) {
        console.error(`Failed to hydrate IPFS payload for document ${doc.id}:`, e)
      }
  }
  return doc
}

export async function getStoredDocumentByReference(reference: string) {
  const db = await readDb()
  const doc = db.documents.find(
      (entry) => entry.id === reference || entry.sha256 === reference || entry.cid === reference
    ) ?? null
  if (doc && doc.encryptedPayload === "OFF_CHAIN_IPFS_DATABLOCK") {
      try {
        const blobPath = path.join(process.cwd(), ".data", "ipfs-blobs", `${doc.cid}.bin`)
        doc.encryptedPayload = await fs.readFile(blobPath, "utf8")
      } catch (e) {
        console.error(`Failed to hydrate IPFS payload for document ${doc.id}:`, e)
      }
  }
  return doc
}

export async function getStoredDocumentAccess(input: {
  documentId: string
  requesterEmail?: string
  requesterId?: string
}) {
  const db = await readDb()
  const document = db.documents.find((entry) => entry.id === input.documentId) ?? null
  if (!document) {
    return null
  }

  const requester =
    (input.requesterId ? db.users.find((user) => user.id === input.requesterId) : undefined) ??
    (input.requesterEmail
      ? db.users.find(
          (user) =>
            user.institutionalEmail.toLowerCase() === input.requesterEmail?.toLowerCase() ||
            user.personalEmail?.toLowerCase() === input.requesterEmail?.toLowerCase()
        )
      : undefined) ??
    null

  const activeGrant = input.requesterEmail
    ? db.accessGrants.find(
        (grant) =>
          grant.studentId === document.ownerId &&
          grant.verifierEmail.toLowerCase() === input.requesterEmail?.toLowerCase() &&
          grant.status === "active" &&
          new Date(grant.expiryDate).getTime() > Date.now()
      ) ?? null
    : null

  const attributes = attributesForUser(requester, [
    input.requesterEmail ? `email=${input.requesterEmail.toLowerCase()}` : "",
    input.requesterId ? `requester_id=${input.requesterId}` : "",
    requester?.id === document.ownerId ? "student_id=owner" : "",
    requester?.id === document.ownerId || activeGrant ? "permission=granted" : "",
    activeGrant ? "grant=active" : "",
  ].filter(Boolean) as string[])

  const policySatisfied = policyMatches(document.policy, attributes)
  const decrypted = policySatisfied ? readDecryptedPayload(document.encryptedPayload, attributes) : null
  const integrity = Boolean(decrypted && decrypted.plaintextHash === document.sha256)

  return {
    document,
    authorized: policySatisfied,
    integrity,
    plaintext: integrity ? decrypted?.plaintext ?? null : null,
    decryptedAt: decrypted?.encryptedAt ?? null,
  }
}

export async function rekeyStoredDocument(input: {
  documentId: string
  policy: string
  requesterEmail?: string
}) {
  return mutateDb((db) => {
    const document = db.documents.find((entry) => entry.id === input.documentId)
    if (!document) {
      throw new Error("Document not found")
    }
    if (!input.policy.trim()) {
      throw new Error("Document policy is required")
    }

    const requester =
      input.requesterEmail
        ? db.users.find(
            (user) =>
              user.institutionalEmail.toLowerCase() === input.requesterEmail?.toLowerCase() ||
              user.personalEmail?.toLowerCase() === input.requesterEmail?.toLowerCase()
          ) ?? null
        : null

    const activeGrant = input.requesterEmail
      ? db.accessGrants.find(
          (grant) =>
            grant.studentId === document.ownerId &&
            grant.verifierEmail.toLowerCase() === input.requesterEmail?.toLowerCase() &&
            grant.status === "active" &&
            new Date(grant.expiryDate).getTime() > Date.now()
        ) ?? null
      : null

    const attributes = attributesForUser(requester, [
      input.requesterEmail ? `email=${input.requesterEmail.toLowerCase()}` : "",
      requester?.id === document.ownerId ? "student_id=owner" : "",
      requester?.id === document.ownerId || activeGrant ? "permission=granted" : "",
    ].filter(Boolean) as string[])

    if (!policyMatches(document.policy, attributes)) {
      throw new Error("Current policy cannot be decrypted with the provided attributes")
    }

    const updated = rekeyWithPolicy(document.encryptedPayload, input.policy, attributes)
    document.encryptedPayload = updated.envelope
    document.policy = input.policy

    const ledger = createLedgerEvent(db, {
      blockchain: "faculty",
      actorId: requester?.id ?? document.ownerId,
      contractName: "AuditLogger.sol",
      type: "document.policy.updated",
      payload: {
        documentId: document.id,
        policy: input.policy,
      },
    })
    createAuditLog(db, {
      actorId: requester?.id ?? document.ownerId,
      actorRole: requester?.role ?? "faculty",
      action: "document.policy.updated",
      targetType: "document",
      targetId: document.id,
      blockchain: "faculty",
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        policy: input.policy,
      },
    })

    return document
  })
}

export async function createCreditTransfer(input: {
  studentId?: string
  destinationInstitution: string
  creditsRequested: number
  courseCodes: string[]
  reason: string
}) {
  return mutateDb((db) => {
    const studentId = input.studentId ?? DEMO_USER_IDS.student
    const request: CreditTransferRequest = {
      id: `CT-${new Date().getUTCFullYear()}-${String(db.creditTransfers.length + 1).padStart(4, "0")}`,
      studentId,
      sourceInstitution: DEFAULT_INSTITUTION,
      destinationInstitution: input.destinationInstitution,
      creditsRequested: input.creditsRequested,
      courseCodes: input.courseCodes,
      reason: input.reason,
      status: "pending",
      requestedAt: nowIso(),
    }
    db.creditTransfers.unshift(request)
    const ledger = createLedgerEvent(db, {
      blockchain: "institutional",
      actorId: studentId,
      contractName: "CreditTransfer.sol",
      type: "credit-transfer.requested",
      payload: {
        ...request,
      },
    })
    createAuditLog(db, {
      actorId: studentId,
      actorRole: "student",
      action: "credit-transfer.requested",
      targetType: "credit-transfer",
      targetId: request.id,
      blockchain: "institutional",
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        destinationInstitution: request.destinationInstitution,
        creditsRequested: request.creditsRequested,
      },
    })
    return request
  })
}

export async function reviewCreditTransfer(input: {
  transferId: string
  status: "approved" | "rejected"
  reviewedBy?: string
  decisionNote?: string
}) {
  return mutateDb((db) => {
    const reviewedBy = input.reviewedBy ?? DEMO_USER_IDS.faculty
    const transfer = db.creditTransfers.find((entry) => entry.id === input.transferId)
    if (!transfer) {
      throw new Error("Credit transfer request not found")
    }

    transfer.status = input.status
    transfer.reviewedAt = nowIso()
    transfer.reviewedBy = reviewedBy
    transfer.decisionNote = input.decisionNote ?? undefined

    const ledger = createLedgerEvent(db, {
      blockchain: "institutional",
      actorId: reviewedBy,
      contractName: "CreditTransfer.sol",
      type: `credit-transfer.${input.status}`,
      payload: {
        transferId: transfer.id,
        status: transfer.status,
        destinationInstitution: transfer.destinationInstitution,
      },
    })
    createAuditLog(db, {
      actorId: reviewedBy,
      actorRole: "faculty",
      action: `credit-transfer.${input.status}`,
      targetType: "credit-transfer",
      targetId: transfer.id,
      blockchain: "institutional",
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        destinationInstitution: transfer.destinationInstitution,
        creditsRequested: transfer.creditsRequested,
      },
    })

    db.notifications.unshift({
      id: randomUUID(),
      userId: transfer.studentId,
      title: `Credit transfer ${input.status}`,
      message: `Transfer request ${transfer.id} for ${transfer.destinationInstitution} was ${input.status}.`,
      type: "transfer",
      createdAt: transfer.reviewedAt,
      read: false,
      link: "/student-portal/credit-transfer",
    })

    return transfer
  })
}

export async function listAuditLogs() {
  const db = await readDb()
  return db.auditLogs
}

export async function exportStudentData(studentId: string = DEMO_USER_IDS.student) {
  const db = await readDb()
  const summary = getStudentSummary(db, studentId)

  return {
    exportedAt: nowIso(),
    student: summary.student,
    grades: summary.grades,
    credentials: summary.credentials,
    transcriptRequests: summary.transcriptRequests,
    accessGrants: summary.accessGrants,
    transfers: summary.transfers,
    notifications: summary.notifications,
  }
}

export async function getStudentAcademics(studentId: string = DEMO_USER_IDS.student) {
  const db = await readDb()
  const summary = getStudentSummary(db, studentId)
  const courseMap = new Map(db.courses.map((course) => [course.id, course]))
  const semesterMap = new Map<
    string,
    {
      semester: string
      sgpa: number
      credits: number
      creditsEarned: number
      status: "completed" | "ongoing"
      courses: Array<{
        code: string
        name: string
        credits: number
        grade: string
        marks: number
      }>
    }
  >()

  for (const grade of summary.grades) {
    const course = courseMap.get(grade.courseId)
    if (!course) continue

    const points =
      grade.grade.startsWith("A")
        ? 4
        : grade.grade.startsWith("B")
          ? 3
          : grade.grade.startsWith("C")
            ? 2
            : grade.grade.startsWith("D")
              ? 1
              : 0

    const existing =
      semesterMap.get(grade.term) ??
      {
        semester: grade.term,
        sgpa: 0,
        credits: 0,
        creditsEarned: 0,
        status: "completed" as const,
        courses: [],
      }

    existing.credits += course.credits
    existing.creditsEarned += course.credits
    existing.sgpa += points * course.credits
    existing.courses.push({
      code: course.code,
      name: course.title,
      credits: course.credits,
      grade: grade.grade,
      marks: grade.total,
    })
    semesterMap.set(grade.term, existing)
  }

  const semesters = Array.from(semesterMap.values()).map((semester) => ({
    ...semester,
    sgpa: Number((semester.sgpa / Math.max(semester.credits, 1)).toFixed(2)),
  }))

  return {
    student: summary.student,
    cgpa: summary.cgpa,
    creditsEarned: summary.creditsEarned,
    semesters: semesters.sort((left, right) => right.semester.localeCompare(left.semester)),
    currentCourses: summary.courses.map((course) => ({
      id: course.id,
      code: course.code,
      name: course.title,
      credits: course.credits,
      faculty:
        db.users.find((user) => user.id === course.facultyId)?.fullName ?? "Assigned Faculty",
      status: "ongoing" as const,
    })),
  }
}

export async function listStudentNotifications(studentId: string = DEMO_USER_IDS.student) {
  const db = await readDb()
  return db.notifications.filter((notification) => notification.userId === studentId)
}

export async function markStudentNotificationRead(
  notificationId: string,
  studentId: string = DEMO_USER_IDS.student
) {
  return mutateDb((db) => {
    const notification = db.notifications.find(
      (entry) => entry.id === notificationId && entry.userId === studentId
    )
    if (!notification) {
      throw new Error("Notification not found")
    }
    notification.read = true
    return notification
  })
}

export async function markAllStudentNotificationsRead(studentId: string = DEMO_USER_IDS.student) {
  return mutateDb((db) => {
    const notifications = db.notifications.filter((entry) => entry.userId === studentId)
    notifications.forEach((notification) => {
      notification.read = true
    })
    return notifications
  })
}

export async function deleteStudentNotification(
  notificationId: string,
  studentId: string = DEMO_USER_IDS.student
) {
  return mutateDb((db) => {
    const index = db.notifications.findIndex(
      (entry) => entry.id === notificationId && entry.userId === studentId
    )
    if (index < 0) {
      throw new Error("Notification not found")
    }
    const [deleted] = db.notifications.splice(index, 1)
    return deleted
  })
}

export async function listStudentTransfers(studentId: string = DEMO_USER_IDS.student) {
  const db = await readDb()
  return db.creditTransfers.filter((transfer) => transfer.studentId === studentId)
}

export async function listFacultyCourses(facultyId: string = DEMO_USER_IDS.faculty) {
  const db = await readDb()
  return db.courses
    .filter((course) => course.facultyId === facultyId)
    .map((course) => {
      const grades = db.grades.filter((grade) => grade.courseId === course.id)
      const approvedGrades = grades.filter((grade) => grade.status === "approved")
      const average =
        approvedGrades.length === 0
          ? 0
          : approvedGrades.reduce((sum, grade) => sum + grade.total, 0) / approvedGrades.length

      return {
        ...course,
        enrolledCount: course.studentIds.length,
        averageScore: Number(average.toFixed(1)),
        materials: db.documents.filter(
          (document) =>
            document.ownerId === facultyId &&
            document.type === "course-material" &&
            String(document.metadata.title ?? "").toLowerCase().includes(course.code.toLowerCase())
        ),
      }
    })
}

export async function listFacultyGrades(facultyId: string = DEMO_USER_IDS.faculty) {
  const db = await readDb()
  const courses = db.courses.filter((course) => course.facultyId === facultyId)
  const courseIds = new Set(courses.map((course) => course.id))
  const grades = db.grades
    .filter((grade) => courseIds.has(grade.courseId))
    .map((grade) => {
      const course = db.courses.find((entry) => entry.id === grade.courseId)
      const student = db.users.find((entry) => entry.id === grade.studentId)
      return {
        ...grade,
        courseCode: course?.code ?? grade.courseId,
        courseTitle: course?.title ?? "Unknown Course",
        studentName: student?.fullName ?? grade.studentId,
        studentEnrollmentId: student?.enrollmentId ?? grade.studentId,
      }
    })
  return { courses, grades }
}

export async function listFacultyTranscriptRequests() {
  const db = await readDb()
  return db.transcriptRequests.map((request) => {
    const student = db.users.find((entry) => entry.id === request.studentId)
    const credential = db.credentials.find((entry) => entry.linkedRecordId === request.id)
    return {
      ...request,
      studentName: student?.fullName ?? request.studentId,
      studentEnrollmentId: student?.enrollmentId ?? request.studentId,
      credential,
    }
  })
}

export async function reviewTranscriptRequest(input: {
  requestId: string
  status: TranscriptStatus
  reviewedBy?: string
  note?: string
}) {
  return mutateDb((db) => {
    const reviewedBy = input.reviewedBy ?? DEMO_USER_IDS.faculty
    const request = db.transcriptRequests.find((entry) => entry.id === input.requestId)
    if (!request) {
      throw new Error("Transcript request not found")
    }

    request.status = input.status
    if (input.status === "ready") {
      request.readyAt = nowIso()
    }

    const ledger = createLedgerEvent(db, {
      blockchain: "faculty",
      actorId: reviewedBy,
      contractName: "TranscriptManager.sol",
      type: `transcript.${input.status}`,
      payload: {
        requestId: request.id,
        status: request.status,
      },
    })
    createAuditLog(db, {
      actorId: reviewedBy,
      actorRole: "faculty",
      action: `transcript.${input.status}`,
      targetType: "transcript-request",
      targetId: request.id,
      blockchain: "faculty",
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        destination: request.destination,
        note: input.note ?? null,
      },
    })

    db.notifications.unshift({
      id: randomUUID(),
      userId: request.studentId,
      title: `Transcript request ${input.status}`,
      message: `Request ${request.id} status updated to ${input.status}.`,
      type: "credential",
      createdAt: nowIso(),
      read: false,
      link: "/student-portal/transcript-request",
    })

    return request
  })
}

export async function getFacultyWorkspace(facultyId: string = DEMO_USER_IDS.faculty) {
  const db = await readDb()
  const faculty = getUser(db, facultyId)
  const courses = await listFacultyCourses(facultyId)
  const courseIds = new Set(courses.map((course) => course.id))
  const students = db.users.filter(
    (user) => user.role === "student" && courses.some((course) => course.studentIds.includes(user.id))
  )
  const grades = db.grades.filter((grade) => courseIds.has(grade.courseId))
  const pendingTranscriptRequests = db.transcriptRequests.filter((request) => request.status !== "ready")
  const degreeCandidates = await getEligibleDegreeCandidates()
  const transfers = db.creditTransfers.map((transfer) => ({
    ...transfer,
    studentName: getUser(db, transfer.studentId)?.fullName ?? transfer.studentId,
  }))
  const researchDocuments = db.researchDocuments.filter((document) => document.facultyId === facultyId)

  return {
    faculty,
    stats: {
      pendingGrades: grades.filter((grade) => grade.status !== "approved").length,
      transcriptRequests: pendingTranscriptRequests.length,
      degreesToIssue: degreeCandidates.filter((candidate) => candidate.status === "eligible").length,
      activeCourses: courses.length,
      managedStudents: students.length,
      pendingTransfers: transfers.filter((transfer) => transfer.status === "pending").length,
    },
    courses,
    students,
    grades,
    transcriptRequests: pendingTranscriptRequests,
    degreeCandidates,
    transfers,
    researchDocuments,
    validators: db.validators,
    users: db.users.filter((user) => user.role !== "verifier"),
    auditLogs: db.auditLogs.slice(0, 20),
  }
}

export async function listFacultyTransfers() {
  const db = await readDb()
  return db.creditTransfers.map((transfer) => {
    const student = getUser(db, transfer.studentId)
    return {
      ...transfer,
      studentName: student?.fullName ?? transfer.studentId,
      studentEnrollmentId: student?.enrollmentId ?? transfer.studentId,
      signers: [
        { name: "Department Head", role: "Faculty", signed: transfer.status !== "pending" },
        { name: "Registrar", role: "Admin", signed: transfer.status === "approved" },
      ],
      signatures: {
        required: 2,
        received: transfer.status === "approved" ? 2 : transfer.status === "rejected" ? 1 : 1,
      },
    }
  })
}

export async function createResearchDocument(input: {
  facultyId?: string
  title: string
  department?: string
  visibility: ResearchDocument["visibility"]
  body: string
}) {
  return mutateDb((db) => {
    const facultyId = input.facultyId ?? DEMO_USER_IDS.faculty
    const uploadedAt = nowIso()
    validateDocumentInput("research-paper", input.body)
    const hashId = txHash(input.body)
    const cid = cidFrom(input.body)
    const id = `RES-${String(db.researchDocuments.length + 1).padStart(3, "0")}`

    const researchDocument: ResearchDocument = {
      id,
      facultyId,
      title: input.title,
      department:
        input.department ??
        getUser(db, facultyId)?.department ??
        "General",
      cid,
      sha256: hashId,
      visibility: input.visibility,
      uploadedAt,
    }

    const storedDocument: StoredDocument = {
      id: `DOC-${id}`,
      ownerId: facultyId,
      type: "research-paper",
      title: input.title,
      cid,
      sha256: hashId,
      sizeKb: Math.max(1, Math.round(input.body.length / 20)),
      ...createEncryptedPayload(input.body, `visibility=${input.visibility}`, {
        type: "research-paper",
        department: researchDocument.department,
        visibility: input.visibility,
      }),
      plaintextPreview: input.body.slice(0, 120),
      policy: `visibility=${input.visibility}`,
      pinned: true,
      uploadedAt,
      metadata: {
        type: "research-paper",
        department: researchDocument.department,
        visibility: input.visibility,
      },
    }

    db.researchDocuments.unshift(researchDocument)
    db.documents.unshift(storedDocument)

    const ledger = createLedgerEvent(db, {
      blockchain: "faculty",
      actorId: facultyId,
      contractName: "ResearchRegistry.sol",
      type: "research.uploaded",
      payload: {
        researchId: researchDocument.id,
        cid: researchDocument.cid,
        visibility: researchDocument.visibility,
      },
    })
    createAuditLog(db, {
      actorId: facultyId,
      actorRole: "faculty",
      action: "research.uploaded",
      targetType: "research-document",
      targetId: researchDocument.id,
      blockchain: "faculty",
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        title: researchDocument.title,
        visibility: researchDocument.visibility,
      },
    })

    return researchDocument
  })
}

export async function listFacultyResearchDocuments(facultyId: string = DEMO_USER_IDS.faculty) {
  const db = await readDb()
  return db.researchDocuments
    .filter((document) => document.facultyId === facultyId)
    .map((document) => ({
      ...document,
      facultyName: getUser(db, document.facultyId)?.fullName ?? document.facultyId,
    }))
}

export async function listFacultyUsers() {
  const db = await readDb()
  return db.users.filter((user) => user.role !== "verifier")
}

export async function listValidatorNodes(blockchain?: BlockchainKey) {
  const db = await readDb()
  return blockchain ? db.validators.filter((validator) => validator.blockchain === blockchain) : db.validators
}

export async function registerValidatorNode(input: {
  blockchain: BlockchainKey
  name: string
  walletAddress: string
  stake: number
  uptime?: number
}) {
  return mutateDb((db) => {
    const validator: ValidatorNode = {
      id: `VAL-${input.blockchain.slice(0, 3).toUpperCase()}-${String(db.validators.filter((entry) => entry.blockchain === input.blockchain).length + 1).padStart(3, "0")}`,
      blockchain: input.blockchain,
      name: input.name,
      walletAddress: input.walletAddress,
      stake: input.stake,
      uptime: input.uptime ?? 99.5,
      status: (input.uptime ?? 99.5) >= 98 ? "active" : "syncing",
    }

    db.validators.unshift(validator)
    const ledger = createLedgerEvent(db, {
      blockchain: "institutional",
      actorId: DEMO_USER_IDS.admin,
      contractName: "ValidatorRegistry.sol",
      type: "validator.registered",
      payload: {
        validatorId: validator.id,
        blockchain: validator.blockchain,
        stake: validator.stake,
      },
    })
    createAuditLog(db, {
      actorId: DEMO_USER_IDS.admin,
      actorRole: "admin",
      action: "validator.registered",
      targetType: "validator",
      targetId: validator.id,
      blockchain: "institutional",
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        blockchain: validator.blockchain,
        stake: validator.stake,
      },
    })

    return validator
  })
}

export async function slashValidatorNode(input: {
  validatorId: string
  amount: number
  reason: string
  executedBy?: string
}) {
  return mutateDb((db) => {
    const validator = db.validators.find((entry) => entry.id === input.validatorId)
    if (!validator) {
      throw new Error("Validator not found")
    }

    validator.stake = Math.max(0, validator.stake - input.amount)
    validator.status = validator.stake === 0 ? "degraded" : validator.status
    const executedBy = input.executedBy ?? DEMO_USER_IDS.admin

    const ledger = createLedgerEvent(db, {
      blockchain: "institutional",
      actorId: executedBy,
      contractName: "ValidatorRegistry.sol",
      type: "validator.slashed",
      payload: {
        validatorId: validator.id,
        amount: input.amount,
        reason: input.reason,
      },
    })
    createAuditLog(db, {
      actorId: executedBy,
      actorRole: "admin",
      action: "validator.slashed",
      targetType: "validator",
      targetId: validator.id,
      blockchain: "institutional",
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        amount: input.amount,
        reason: input.reason,
      },
    })

    return validator
  })
}

export async function getVerifierWorkspace(verifierId: string = DEMO_USER_IDS.verifier) {
  const db = await readDb()
  const history = db.verificationLogs.filter((entry) => entry.verifierId === verifierId)
  const apiKeys = db.verifierApiKeys.filter((entry) => entry.verifierId === verifierId)
  const validHistory = history.filter((entry) => entry.result === "valid")

  return {
    verifier: getUser(db, verifierId),
    stats: {
      total: history.length,
      valid: validHistory.length,
      invalid: history.filter((entry) => entry.result === "invalid").length,
      avgScore:
        validHistory.length === 0
          ? 0
          : Math.round(validHistory.reduce((sum, entry) => sum + entry.vScore, 0) / validHistory.length),
    },
    history,
    apiKeys,
  }
}

export async function getAdminWorkspace() {
  const db = await readDb()
  return {
    overview: getSystemOverviewSnapshot(db),
    users: db.users,
    auditLogs: db.auditLogs,
    smartContracts: db.smartContracts,
    validators: db.validators,
    blocks: db.blocks,
    transactions: db.transactions,
  }
}

export async function getSystemOverview() {
  const db = await readDb()
  return getSystemOverviewSnapshot(db)
}

export async function upgradeSmartContract(input: {
  contractName: string
  newVersion?: string
  upgradedBy?: string
}) {
  return mutateDb((db) => {
    const contract = db.smartContracts.find((entry) => entry.name === input.contractName)
    if (!contract) {
      throw new Error("Contract not found")
    }
    if (!contract.proxy) {
      throw new Error("This contract is not upgradeable")
    }

    contract.version = input.newVersion ?? bumpVersion(contract.version)
    contract.status = "healthy"
    const upgradedBy = input.upgradedBy ?? DEMO_USER_IDS.admin

    const ledger = createLedgerEvent(db, {
      blockchain: contract.blockchain,
      actorId: upgradedBy,
      contractName: contract.name,
      type: "contract.upgraded",
      payload: {
        contractName: contract.name,
        version: contract.version,
        address: contract.address,
      },
    })
    createAuditLog(db, {
      actorId: upgradedBy,
      actorRole: "admin",
      action: "contract.upgraded",
      targetType: "smart-contract",
      targetId: contract.name,
      blockchain: contract.blockchain,
      transactionHash: ledger.transaction.transactionHash,
      blockNumber: ledger.block.blockNumber,
      gasUsed: ledger.transaction.gasUsed,
      details: {
        version: contract.version,
        address: contract.address,
      },
    })

    return contract
  })
}

export async function getStudentWorkspace(studentId?: string) {
  const db = await readDb()
  const summary = getStudentSummary(db, studentId ?? DEMO_USER_IDS.student)
  return summary
}
