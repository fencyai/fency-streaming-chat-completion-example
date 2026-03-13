import { createSession } from '../createSession'

export async function POST() {
    return await createSession({ createStream: {} })
}
