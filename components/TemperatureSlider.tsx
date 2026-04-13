'use client'

import type { AgentTaskModel } from '@fencyai/js'
import { useEffect } from 'react'

function maxTemperatureForModel(model: AgentTaskModel): number {
    return model.startsWith('anthropic/') ? 1 : 2
}

export interface TemperatureSliderProps {
    model: AgentTaskModel
    value: number
    onChange: (value: number) => void
}

export function TemperatureSlider({
    model,
    value,
    onChange,
}: TemperatureSliderProps) {
    const max = maxTemperatureForModel(model)

    useEffect(() => {
        if (value > max) onChange(max)
    }, [model, max, value, onChange])

    const clamped = Math.min(value, max)

    return (
        <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Temperature{' '}
                <span className="font-normal text-neutral-500 dark:text-neutral-400">
                    (0 to {max})
                </span>
                :{' '}
                <span className="tabular-nums">{clamped.toFixed(2)}</span>
            </span>
            <input
                type="range"
                min={0}
                max={max}
                step={0.01}
                value={clamped}
                onChange={(e) => onChange(Number(e.target.value))}
                className="accent-blue-500"
            />
        </label>
    )
}
