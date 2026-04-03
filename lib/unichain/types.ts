export type UserRole = "student" | "faculty" | "admin" | "verifier"
export type BlockchainKey = "student" | "faculty" | "institutional"
export type CredentialType = "degree" | "transcript" | "certificate" | "achievement"
export type DocumentType =
  | "degree-certificate"
  | "academic-transcript"
  | "grade-sheet"
  | "research-paper"
  | "admission-document"
  | "fee-receipt"
  | "course-material"
export type TransferStatus = "pending" | "approved" | "rejected"
export type TranscriptStatus = "pending" | "processing" | "ready" | "rejected"
export type GrantStatus = "active" | "expired" | "revoked"
export type VerificationMethod = "hash" | "qr" | "api"
export type VerificationStatus = "valid" | "invalid"

export interface User {
  id: string
  role: UserRole
  fullName: string
  institutionalEmail: string
  personalEmail?: string
  phone?: string
  dateOfBirth?: string
  gender?: "male" | "female" | "prefer-not-to-say"
  department?: string
  programme?: string
  joinYear?: string
  profilePhotoUrl?: string
  did: string
  walletAddress: string
  attributes: string[]
  mfaEnabled: boolean
  mfaSecret?: string
  enrollmentId?: string
  governmentIdVerified?: boolean
  graduationFeeCleared?: boolean
  keyStatus: "active" | "rotated"
  createdAt: string
  lastLoginAt?: string
}

export interface Course {
  id: string
  code: string
  title: string
  term: string
  credits: number
  facultyId: string
  studentIds: string[]
}

export interface GradeRecord {
  id: string
  studentId: string
  courseId: string
  term: string
  internal: number
  external: number
  total: number
  grade: string
  status: "draft" | "submitted" | "approved"
  submittedBy: string
  submittedAt: string
  approvedBy?: string
  approvedAt?: string
}

export interface StoredDocument {
  id: string
  ownerId: string
  type: DocumentType
  title: string
  cid: string
  sha256: string
  sizeKb: number
  encryptedPayload: string
  plaintextPreview: string
  policy: string
  pinned: boolean
  uploadedAt: string
  metadata: Record<string, string | number | boolean | null>
}

export interface Credential {
  id: string
  studentId: string
  type: CredentialType
  title: string
  issuer: string
  issueDate: string
  expiryDate: string | null
  status: "active" | "revoked"
  vScore: number
  hashId: string
  cid: string
  sha256: string
  blockchain: BlockchainKey
  contractName: string
  aggregateSignature: string
  signatoryIds: string[]
  merkleRoot: string
  issuanceWindowEnd: string
  linkedRecordId?: string
  policy: string
  description: string
}

export interface TranscriptRequest {
  id: string
  studentId: string
  purpose: string
  destination: string
  address: string
  copies: number
  format: string
  notes: string
  fee: number
  status: TranscriptStatus
  requestDate: string
  readyAt?: string
  cid?: string
  hashId?: string
  qrData?: string
}

export interface AccessGrant {
  id: string
  studentId: string
  verifierEmail: string
  verifierName: string
  verifierType: string
  recordType: string
  permissionScope: string
  grantedDate: string
  expiryDate: string
  status: GrantStatus
  accessCount: number
  policy: string
}

export interface CreditTransferRequest {
  id: string
  studentId: string
  destinationInstitution: string
  sourceInstitution: string
  creditsRequested: number
  courseCodes: string[]
  reason: string
  status: TransferStatus
  requestedAt: string
  reviewedAt?: string
  reviewedBy?: string
  decisionNote?: string
}

export interface ResearchDocument {
  id: string
  facultyId: string
  title: string
  department: string
  cid: string
  sha256: string
  visibility: "private" | "shared" | "public"
  uploadedAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "grade" | "credential" | "access" | "transfer" | "system"
  createdAt: string
  read: boolean
  link?: string
}

export interface ValidatorNode {
  id: string
  blockchain: BlockchainKey
  name: string
  stake: number
  uptime: number
  status: "active" | "syncing" | "degraded"
  walletAddress: string
}

export interface LedgerTransaction {
  id: string
  blockchain: BlockchainKey
  type: string
  actorId: string
  contractName: string
  payloadHash: string
  transactionHash: string
  createdAt: string
  blockNumber: number
  gasUsed: number
}

export interface LedgerBlock {
  blockchain: BlockchainKey
  blockNumber: number
  blockHash: string
  previousHash: string
  validatorId: string
  validatorSignatures: string[]
  transactionIds: string[]
  createdAt: string
}

export interface AuditLog {
  id: string
  actorId: string
  actorRole: UserRole
  action: string
  targetType: string
  targetId: string
  blockchain: BlockchainKey
  transactionHash: string
  blockNumber: number
  gasUsed: number
  createdAt: string
  details: Record<string, string | number | boolean | null>
}

export interface VerificationLog {
  id: string
  verifierId: string
  hash: string
  holderName: string
  result: VerificationStatus
  vScore: number
  method: VerificationMethod
  reasonCodes: string[]
  checkedAt: string
}

export interface OtpChallenge {
  id: string
  email: string
  codeHash: string
  createdAt: string
  expiresAt: string
  consumedAt?: string
}

export interface VerifierApiKey {
  id: string
  verifierId: string
  label: string
  keyPreview: string
  scopes: string[]
  createdAt: string
  lastUsedAt?: string
  status: "active" | "revoked"
}

export interface SmartContractRecord {
  name: string
  blockchain: BlockchainKey
  version: string
  proxy: boolean
  status: "healthy" | "degraded"
  address: string
}

export interface UniChainDb {
  version: number
  lastUpdatedAt: string
  users: User[]
  courses: Course[]
  grades: GradeRecord[]
  documents: StoredDocument[]
  credentials: Credential[]
  transcriptRequests: TranscriptRequest[]
  accessGrants: AccessGrant[]
  creditTransfers: CreditTransferRequest[]
  researchDocuments: ResearchDocument[]
  notifications: Notification[]
  validators: ValidatorNode[]
  transactions: LedgerTransaction[]
  blocks: LedgerBlock[]
  auditLogs: AuditLog[]
  verificationLogs: VerificationLog[]
  otpChallenges: OtpChallenge[]
  verifierApiKeys: VerifierApiKey[]
  smartContracts: SmartContractRecord[]
}

export interface VerificationReport {
  status: VerificationStatus
  vScore: number
  credential: Credential | null
  holderName: string | null
  issuer: string | null
  issueDate: string | null
  checks: {
    hashMatch: boolean
    signatureValid: boolean
    timestampFresh: boolean
    accessGranted: boolean
  }
  reasonCodes: string[]
  blockchainProof:
    | {
        transactionHash: string
        blockNumber: number
        network: string
        contractAddress: string
        gasUsed: number
        timestamp: string
      }
    | null
}

export const DEMO_USER_IDS = {
  student: "STU001",
  faculty: "FAC001",
  admin: "ADM001",
  verifier: "VER001",
} as const
