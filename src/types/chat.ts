export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export type ChatResponse = {
  message: string
  nextStep?: number
  sessionId: string
} 