import type { UseAgentTasksProps } from '@fencyai/react'

export const fetchCreateAgentTaskClientToken: UseAgentTasksProps['fetchCreateAgentTaskClientToken'] =
    async () => {
        const res = await fetch('/api/agent-task-session', {
            method: 'POST',
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
