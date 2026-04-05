import { useRef, useState } from 'react'
import { useAgentTasks } from '@fencyai/react'
import type { UseAgentTasksProps, AgentTask } from '@fencyai/react'
import type { AgentTaskModel } from '@fencyai/js'

interface UseChatProps extends UseAgentTasksProps {
    model: AgentTaskModel
}

interface UseChat {
    agentTasks: AgentTask[]
    isSubmitting: boolean
    sendMessage: (text: string) => Promise<void>
}

export function useChat({ model, ...agentTasksProps }: UseChatProps): UseChat {
    const { agentTasks, createAgentTask } = useAgentTasks(agentTasksProps)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const lastAssistantRef = useRef<{
        role: 'ASSISTANT'
        content: string
    } | null>(null)

    async function sendMessage(text: string) {
        const trimmed = text.trim()
        if (!trimmed || isSubmitting) return

        setIsSubmitting(true)

        let nextMessages: {
            role: 'USER' | 'ASSISTANT' | 'SYSTEM'
            content: string
        }[]
        const lastTask = agentTasks.at(-1)
        const newUserMsg = { role: 'USER' as const, content: trimmed }

        const priorMessages =
            lastTask && lastTask.params.type === 'StreamingChatCompletion'
                ? lastTask.params.messages
                : []

        const assistantMsg = lastAssistantRef.current
        if (assistantMsg) {
            nextMessages = [...priorMessages, assistantMsg, newUserMsg]
            lastAssistantRef.current = null
        } else {
            nextMessages = [...priorMessages, newUserMsg]
        }

        try {
            const response = await createAgentTask({
                type: 'StreamingChatCompletion',
                messages: nextMessages,
                model,
            })
            console.log(response)
            if (
                response.type === 'success' &&
                response.response.taskType === 'StreamingChatCompletion'
            ) {
                const lastMsg =
                    response.response.response.messages.at(-1)
                if (lastMsg?.role === 'ASSISTANT') {
                    lastAssistantRef.current = {
                        role: 'ASSISTANT',
                        content: lastMsg.content,
                    }
                }
            }
        } catch {
            // Task error will be surfaced via task.error
        } finally {
            setIsSubmitting(false)
        }
    }

    return { agentTasks, isSubmitting, sendMessage }
}
