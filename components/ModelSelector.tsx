'use client'

import { agentTaskModels } from '@fencyai/js'
import type { AgentTaskModel } from '@fencyai/js'

const PROVIDER_ORDER = ['anthropic', 'google', 'openai'] as const

const PROVIDER_LABELS: Record<(typeof PROVIDER_ORDER)[number], string> = {
    anthropic: 'Anthropic',
    google: 'Google',
    openai: 'OpenAI',
}

function modelsByProvider(): Map<string, AgentTaskModel[]> {
    const map = new Map<string, AgentTaskModel[]>()
    for (const m of agentTaskModels) {
        const provider = m.split('/')[0]
        if (!map.has(provider)) map.set(provider, [])
        map.get(provider)!.push(m)
    }
    return map
}

export interface ModelSelectorProps {
    value: AgentTaskModel
    onChange: (model: AgentTaskModel) => void
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
    const grouped = modelsByProvider()

    return (
        <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Model
            </span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as AgentTaskModel)}
                className="rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-600 dark:focus:border-neutral-400"
            >
                {PROVIDER_ORDER.map((provider) => {
                    const models = grouped.get(provider)
                    if (!models?.length) return null
                    return (
                        <optgroup
                            key={provider}
                            label={PROVIDER_LABELS[provider]}
                        >
                            {models.map((m) => (
                                <option key={m} value={m}>
                                    {m.replace(`${provider}/`, '')}
                                </option>
                            ))}
                        </optgroup>
                    )
                })}
            </select>
        </label>
    )
}
