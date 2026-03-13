import { createSession } from '../createSession'

export async function POST() {
    return await createSession({
        createAgentTask: { taskType: 'STREAMING_CHAT_COMPLETION' },
    })
}
