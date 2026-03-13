export async function fetchCreateAgentTaskClientToken(
    taskType:
        | 'StreamingChatCompletion'
        | 'StructuredChatCompletion'
        | 'MemoryChatCompletion'
): Promise<{ clientToken: string }> {
    const res = await fetch('/api/agent-task-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskType }),
    })
    if (!res.ok) {
        throw new Error('Failed to create agent task session')
    }

    const data = await res.json()
    if (!data.clientToken) {
        throw new Error('No clientToken in session response')
    }
    return { clientToken: data.clientToken }
}
