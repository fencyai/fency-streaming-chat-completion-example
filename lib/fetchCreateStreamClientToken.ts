export async function fetchCreateStreamClientToken() {
    const res = await fetch('/api/stream-session', { method: 'POST' })
    if (!res.ok) {
        throw new Error('Failed to create stream session')
    }

    const data = await res.json()
    if (!data.clientToken) {
        throw new Error('No clientToken in session response')
    }
    return { clientToken: data.clientToken }
}
