/**
 * Pinata IPFS Cloud Pinning Client
 * 
 * Replaces local .data/ipfs-blobs/ storage with Pinata's
 * global IPFS pinning network. Documents are accessible from
 * any IPFS gateway worldwide via their CID.
 * 
 * Required ENV vars:
 *   PINATA_API_KEY
 *   PINATA_SECRET_KEY
 */

const PINATA_BASE = "https://api.pinata.cloud"

function getPinataHeaders() {
  const apiKey = process.env.PINATA_API_KEY
  const secret = process.env.PINATA_SECRET_KEY

  if (!apiKey || !secret) {
    console.warn("[IPFS] Pinata keys not configured — falling back to in-memory storage")
    return null
  }

  return {
    pinata_api_key: apiKey,
    pinata_secret_api_key: secret,
  }
}

/**
 * Pin a JSON payload to IPFS via Pinata.
 * Returns the IPFS hash (CID) from Pinata.
 */
export async function pinToIPFS(content: string, metadata?: Record<string, string>): Promise<string | null> {
  const headers = getPinataHeaders()
  if (!headers) return null

  try {
    const response = await fetch(`${PINATA_BASE}/pinning/pinJSONToIPFS`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        pinataContent: { data: content },
        pinataMetadata: {
          name: metadata?.name || `unichain-doc-${Date.now()}`,
          keyvalues: metadata,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("[IPFS] Pinata pin failed:", err)
      return null
    }

    const result = await response.json()
    console.log("✅ Pinned to IPFS:", result.IpfsHash)
    return result.IpfsHash as string
  } catch (e) {
    console.error("[IPFS] Pinata pin error:", e)
    return null
  }
}

/**
 * Retrieve a pinned document from IPFS via Pinata's dedicated gateway.
 */
export async function fetchFromIPFS(cid: string): Promise<string | null> {
  try {
    const gatewayUrl = process.env.PINATA_GATEWAY_URL || "https://gateway.pinata.cloud"
    const response = await fetch(`${gatewayUrl}/ipfs/${cid}`)

    if (!response.ok) {
      console.error("[IPFS] Gateway fetch failed for CID:", cid)
      return null
    }

    const data = await response.json()
    return data.data as string
  } catch (e) {
    console.error("[IPFS] Fetch error:", e)
    return null
  }
}

/**
 * Check if Pinata is properly configured.
 */
export function isPinataConfigured(): boolean {
  return !!(process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY)
}
