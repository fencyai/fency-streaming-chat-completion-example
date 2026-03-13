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
        role: 'assistant'
        content: string
    } | null>(null)

    async function sendMessage(text: string) {
        const trimmed = text.trim()
        if (!trimmed || isSubmitting) return

        setIsSubmitting(true)

        let nextMessages: {
            role: 'user' | 'assistant' | 'system'
            content: string
        }[]
        const lastTask = agentTasks.at(-1)
        const newUserMsg = { role: 'user' as const, content: trimmed }

        if (!lastTask) {
            nextMessages = [newUserMsg]
        } else {
            const assistantMsg = lastAssistantRef.current
            if (assistantMsg) {
                nextMessages = [
                    ...lastTask.params.messages,
                    assistantMsg,
                    newUserMsg,
                ]
                lastAssistantRef.current = null
            } else {
                nextMessages = [...lastTask.params.messages, newUserMsg]
            }
        }

        try {
            const response = await createAgentTask({
                type: 'StreamingChatCompletion',
                messages: nextMessages,
                model,
            })
            if (
                response.type === 'success' &&
                response.response.taskType === 'StreamingChatCompletion'
            ) {
                const lastMsg = response.response.messages.at(-1)
                if (lastMsg?.role === 'assistant') {
                    lastAssistantRef.current = {
                        role: 'assistant',
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
