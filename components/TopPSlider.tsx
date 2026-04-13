'use client'

export interface TopPSliderProps {
    value: number
    onChange: (value: number) => void
}

export function TopPSlider({ value, onChange }: TopPSliderProps) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                top P{' '}
                <span className="font-normal text-neutral-500 dark:text-neutral-400">
                    (0 to 1)
                </span>
                :{' '}
                <span className="tabular-nums">{value.toFixed(2)}</span>
            </span>
            <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="accent-blue-500"
            />
        </label>
    )
}
