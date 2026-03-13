'use client'

import { fetchCreateStreamClientToken } from '@/lib/fetchCreateStreamClientToken'
import { loadFency } from '@fencyai/js'
import { FencyProvider } from '@fencyai/react'
import App from './app'

const fency = loadFency({
    publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!,
})

export default function Home() {
    return (
        <FencyProvider
            fency={fency}
            fetchCreateStreamClientToken={fetchCreateStreamClientToken}
        >
            <App />
        </FencyProvider>
    )
}
