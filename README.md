# Fency Streaming Chat Completion Example

A Next.js app demonstrating how to build a streaming chat interface using Fency's Streaming Chat Completion task type.

## Overview

- The AI streams responses token-by-token as they are generated
- Conversation history is maintained across turns by threading messages through each `createAgentTask` call
- The Fency SDK handles task lifecycle and real-time progress rendering via the `AgentTaskProgress` component

## Prerequisites

- Node.js 18+
- A Fency account with a secret key and publishable key

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root and add your Fency keys:
   ```bash
   NEXT_PUBLIC_PUBLISHABLE_KEY=pk_...
   FENCY_SECRET_KEY=sk_...
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) and start chatting.

## Environment Variables

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_PUBLISHABLE_KEY` | Client | Initializes the Fency SDK via `loadFency` |
| `FENCY_SECRET_KEY` | Server | Authenticates requests to the Fency REST API from API routes |

## Project Structure

```
app/
  page.tsx                         # SDK initialization and FencyProvider setup
  app.tsx                          # Chat UI component
  api/
    createSession.ts               # Shared helper: POSTs to Fency sessions API
    stream-session/route.ts        # Creates a stream session (used by FencyProvider)
    agent-task-session/route.ts    # Creates a Streaming Chat Completion session
lib/
  fetchCreateStreamClientToken.ts  # Fetches a stream client token from /api/stream-session
  fetchCreateAgentTaskClientToken.ts # Fetches an agent task client token from /api/agent-task-session
hooks/
  useChat.ts                       # Custom hook wrapping useAgentTasks for chat
```

## How It Works

### 1. SDK Initialization — `app/page.tsx`

The Fency SDK is initialized once at the module level using the publishable key. The `FencyProvider` wraps the app and receives a `fetchCreateStreamClientToken` callback the SDK uses internally to authenticate real-time streams.

```tsx
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
```

### 2. Server-Side API Endpoints

#### `app/api/createSession.ts`

A shared utility used by both API routes. It calls `POST https://api.fency.ai/v1/sessions` with the `FENCY_SECRET_KEY` and returns the response (which includes a short-lived `clientToken`). The secret key never leaves the server.

#### `app/api/stream-session/route.ts`

Creates a stream session used by `FencyProvider` for real-time task updates:

```ts
export async function POST() {
    return await createSession({ createStream: {} })
}
```

#### `app/api/agent-task-session/route.ts`

Creates a Streaming Chat Completion session:

```ts
export async function POST() {
    return await createSession({
        createAgentTask: { taskType: 'STREAMING_CHAT_COMPLETION' },
    })
}
```

### 3. Client-Side Token Fetchers — `lib/`

Both fetchers call their respective API routes and return `{ clientToken }`.

- **`fetchCreateStreamClientToken`** — calls `POST /api/stream-session`; passed to `FencyProvider`
- **`fetchCreateAgentTaskClientToken`** — calls `POST /api/agent-task-session`; passed to `useChat`

### 4. The `useAgentTasks` Hook

`useAgentTasks` from `@fencyai/react` is the core hook. It returns:

- `agentTasks` — a reactive array of task objects, each containing `params`, `error`, and live result state
- `createAgentTask` — an async function that starts a new task and returns its result

The hook requires a `fetchCreateAgentTaskClientToken` callback it uses to obtain an authenticated token before each task.

### 5. Custom Hook — `hooks/useChat.ts`

`useChat` wraps `useAgentTasks` to manage multi-turn conversation state. On each user message it:

1. Builds the next `messages` array by appending the previous assistant reply (stored in `lastAssistantRef`) and the new user message to the prior turn's message list
2. Calls `createAgentTask` with `type: 'StreamingChatCompletion'`, the accumulated messages, and the model
3. Extracts the assistant reply from the last message in `response.response.messages` and stores it in `lastAssistantRef` so it can be threaded into the next turn

```ts
const response = await createAgentTask({
    type: 'StreamingChatCompletion',
    messages: nextMessages,
    model,  // 'anthropic/claude-sonnet-4.5'
})

if (response.type === 'success' && response.response.taskType === 'StreamingChatCompletion') {
    const lastMsg = response.response.messages.at(-1)
    if (lastMsg?.role === 'assistant') {
        lastAssistantRef.current = {
            role: 'assistant',
            content: lastMsg.content,
        }
    }
}
```
