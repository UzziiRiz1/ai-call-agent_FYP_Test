import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"

let io: SocketIOServer | null = null

export function initWebSocket(server?: HTTPServer) {
  if (server) {
    if (io) return io

    io = new SocketIOServer(server, {
      path: "/api/socket",
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    })

    io.on("connection", (socket) => {
      console.log("[v0] Client connected:", socket.id)

      socket.on("disconnect", () => {
        console.log("[v0] Client disconnected:", socket.id)
      })
    })

    return io
  } else {
    console.warn("WebSocket not available in serverless environment")
    return null
  }
}

export function getIO(): SocketIOServer | null {
  return io
}

export function emitCallUpdate(event: string, data: any) {
  if (io) {
    io.emit(event, data)
  } else {
    // No-op in serverless
    console.log(`Would emit ${event}:`, data)
  }
}

export const broadcastUpdate = emitCallUpdate
