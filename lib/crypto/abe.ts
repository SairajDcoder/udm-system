import { createHash } from "crypto"

export type AbeAttributes = string[] | Record<string, string | number | boolean | null | undefined>

export interface AbeEnvelope {
  version: "cp-abe-sim-v1"
  policy: string
  ciphertext: string
  plaintextHash: string
  issuedAt: string
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

function nowIso() {
  return new Date().toISOString()
}

function normalizeAttribute(attribute: string) {
  return attribute.trim().toLowerCase()
}

function attributesToSet(attributes?: AbeAttributes) {
  const values = new Set<string>()
  if (!attributes) return values

  if (Array.isArray(attributes)) {
    for (const attribute of attributes) {
      if (attribute) values.add(normalizeAttribute(attribute))
    }
    return values
  }

  for (const [key, value] of Object.entries(attributes)) {
    if (value === null || value === undefined) continue
    values.add(normalizeAttribute(`${key}=${value}`))
  }

  return values
}

type Token =
  | { type: "atom"; value: string }
  | { type: "and" | "or" | "not" | "lparen" | "rparen" }

function tokenize(policy: string): Token[] {
  const tokens: Token[] = []
  let buffer = ""

  const flush = () => {
    const atom = buffer.trim()
    if (atom) {
      const upper = atom.toUpperCase()
      if (upper === "AND" || upper === "OR" || upper === "NOT") {
        tokens.push({ type: upper.toLowerCase() as "and" | "or" | "not" })
      } else {
        tokens.push({ type: "atom", value: normalizeAttribute(atom) })
      }
    }
    buffer = ""
  }

  for (const char of policy) {
    if (char === "(" || char === ")") {
      flush()
      tokens.push({ type: char === "(" ? "lparen" : "rparen" })
      continue
    }

    if (/\s/.test(char)) {
      flush()
      continue
    }

    buffer += char
  }

  flush()
  return tokens
}

export function policyMatches(policy: string, attributes?: AbeAttributes) {
  const trimmed = policy.trim()
  if (!trimmed) return true

  const available = attributesToSet(attributes)
  const tokens = tokenize(trimmed)
  let index = 0

  const parseExpression = (): boolean => parseOr()

  const parseOr = (): boolean => {
    let value = parseAnd()
    while (tokens[index]?.type === "or") {
      index += 1
      value = value || parseAnd()
    }
    return value
  }

  const parseAnd = (): boolean => {
    let value = parseUnary()
    while (tokens[index]?.type === "and") {
      index += 1
      value = value && parseUnary()
    }
    return value
  }

  const parseUnary = (): boolean => {
    const token = tokens[index]
    if (token?.type === "not") {
      index += 1
      return !parseUnary()
    }

    if (token?.type === "lparen") {
      index += 1
      const value = parseExpression()
      if (tokens[index]?.type === "rparen") {
        index += 1
      }
      return value
    }

    if (token?.type === "atom") {
      index += 1
      return available.has(token.value)
    }

    return false
  }

  try {
    const result = parseExpression()
    return result && index >= tokens.length
  } catch {
    return false
  }
}

export function encryptWithPolicy(
  plaintext: string,
  policy: string,
  metadata: Record<string, string | number | boolean | null> = {}
) {
  const envelope: AbeEnvelope = {
    version: "cp-abe-sim-v1",
    policy,
    ciphertext: Buffer.from(plaintext, "utf8").toString("base64"),
    plaintextHash: sha256(plaintext),
    issuedAt: nowIso(),
  }

  return {
    envelope: Buffer.from(JSON.stringify({ ...envelope, metadata }), "utf8").toString("base64"),
    plaintextHash: envelope.plaintextHash,
  }
}

export function decryptWithPolicy(
  encryptedPayload: string,
  attributes?: AbeAttributes
): {
  plaintext: string
  policy: string
  plaintextHash: string
  encryptedAt?: string
} | null {
  const decoded = Buffer.from(encryptedPayload, "base64").toString("utf8")

  try {
    const parsed = JSON.parse(decoded) as AbeEnvelope & { metadata?: Record<string, unknown> }
    if (parsed?.version === "cp-abe-sim-v1") {
      if (!policyMatches(parsed.policy, attributes)) {
        return null
      }

      return {
        plaintext: Buffer.from(parsed.ciphertext, "base64").toString("utf8"),
        policy: parsed.policy,
        plaintextHash: parsed.plaintextHash,
        encryptedAt: parsed.issuedAt,
      }
    }

    return {
      plaintext: decoded,
      policy: "",
      plaintextHash: sha256(decoded),
    }
  } catch {
    const plaintext = decoded
    return {
      plaintext,
      policy: "",
      plaintextHash: sha256(plaintext),
    }
  }
}

export function rekeyWithPolicy(
  encryptedPayload: string,
  nextPolicy: string,
  attributes?: AbeAttributes
) {
  const payload = decryptWithPolicy(encryptedPayload, attributes)
  if (!payload) {
    throw new Error("Ciphertext cannot be re-keyed with the provided attributes")
  }

  return encryptWithPolicy(payload.plaintext, nextPolicy)
}
