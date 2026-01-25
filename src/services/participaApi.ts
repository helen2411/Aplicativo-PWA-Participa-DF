/* No comments as per project conventions */
export type ManifestationPayload = {
  protocol: string
  when: string
  isAnonymous: boolean
  title: string
  text: string
  audioUrl?: string | null
  audioDescription?: string
  images?: string[]
  imageDescription?: string
  videos?: string[]
  videoDescription?: string
  location?: { lat: number; lng: number } | null
  address?: string | null
}

type JsonResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string }

const baseURL = (import.meta as unknown as { env?: Record<string, unknown> }).env?.['VITE_API_BASE_URL'] as string | undefined

async function httpJson<T>(path: string, init?: RequestInit): Promise<JsonResult<T>> {
  try {
    if (!baseURL) return { ok: false, status: 0, error: 'NO_BASE_URL' }
    const res = await fetch(`${baseURL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
    if (!res.ok) {
      return { ok: false, status: res.status, error: await safeText(res) }
    }
    return { ok: true, data: (await res.json()) as T }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, status: 0, error: msg }
  }
}

async function safeText(res: Response) {
  try {
    return await res.text()
  } catch {
    return ''
  }
}

export const participaApi = {
  async sendManifestation(payload: ManifestationPayload) {
    return httpJson<{ id: string; protocol: string }>('/manifestations', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  async analyzeWithIZA(input: { text: string }) {
    return httpJson<{ summary: string; category?: string }>('/iza/analyze', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },
}
