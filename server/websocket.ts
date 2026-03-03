import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "http";
import type { Session } from "express-session";
import logger from "./lib/logger";
import { storage } from "./storage";

interface NotificationMessage {
  type: "new_message" | "message_read" | "message_archived";
  receiverId?: string;
  senderId?: string;
  messageId?: string;
  timestamp: string;
}

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  userRole?: string;
  isAlive?: boolean;
  isAuthenticated?: boolean;
}

interface SessionData extends Session {
  passport?: {
    user?: string;
  };
}

let wss: WebSocketServer | null = null;
const clients = new Map<string, Set<AuthenticatedWebSocket>>();
let sessionParser: ((req: IncomingMessage, options: any, callback: (err: any) => void) => void) | null = null;

export function setSessionParser(parser: any): void {
  sessionParser = parser;
}

export function initializeWebSocket(server: Server): void {
  wss = new WebSocketServer({ server, path: "/ws/notifications" });

  wss.on("connection", async (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
    ws.isAlive = true;
    ws.isAuthenticated = false;

    if (sessionParser) {
      sessionParser(req, {}, async (err) => {
        if (err) {
          logger.error({ err }, "WebSocket session parse error");
          ws.close(4001, "Session parse error");
          return;
        }

        const session = (req as any).session as SessionData;
        const userId = session?.passport?.user;

        if (!userId) {
          ws.close(4002, "Not authenticated");
          return;
        }

        const user = await storage.getUser(userId);
        if (!user) {
          ws.close(4003, "User not found");
          return;
        }

        ws.userId = userId;
        ws.userRole = user.role;
        ws.isAuthenticated = true;

        if (!clients.has(userId)) {
          clients.set(userId, new Set());
        }
        clients.get(userId)!.add(ws);

        logger.debug({ userId }, "WebSocket client authenticated via session");
        ws.send(JSON.stringify({ type: "auth_success" }));
      });
    } else {
      ws.close(4000, "Session parser not configured");
    }

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("close", () => {
      if (ws.userId && clients.has(ws.userId)) {
        clients.get(ws.userId)!.delete(ws);
        if (clients.get(ws.userId)!.size === 0) {
          clients.delete(ws.userId);
        }
      }
    });

    ws.on("error", (error) => {
      logger.error({ err: error }, "WebSocket error");
    });
  });

  const heartbeatInterval = setInterval(() => {
    wss?.clients.forEach((ws) => {
      const authenticatedWs = ws as AuthenticatedWebSocket;
      if (authenticatedWs.isAlive === false) {
        return ws.terminate();
      }
      authenticatedWs.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(heartbeatInterval);
  });

  logger.info("WebSocket server initialized on /ws/notifications");
}

export function broadcastToUser(userId: string, notification: NotificationMessage): void {
  const userClients = clients.get(userId);
  
  if (userClients && userClients.size > 0) {
    const message = JSON.stringify(notification);
    userClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.isAuthenticated) {
        client.send(message);
      }
    });
    logger.debug({ userId, type: notification.type }, "Notification sent to user");
  }
}

export function notifyNewMessage(receiverId: string, senderId: string, messageId: string): void {
  broadcastToUser(receiverId, {
    type: "new_message",
    receiverId,
    senderId,
    messageId,
    timestamp: new Date().toISOString(),
  });
}

export function notifyMessageRead(senderId: string, messageId: string): void {
  broadcastToUser(senderId, {
    type: "message_read",
    senderId,
    messageId,
    timestamp: new Date().toISOString(),
  });
}

export function notifyMessageArchived(receiverId: string, messageId: string): void {
  broadcastToUser(receiverId, {
    type: "message_archived",
    receiverId,
    messageId,
    timestamp: new Date().toISOString(),
  });
}

export function broadcastToSupportAgents(data: any): void {
  const message = JSON.stringify(data);
  if (!wss) return;
  wss.clients.forEach((ws) => {
    const authWs = ws as AuthenticatedWebSocket;
    if (
      authWs.readyState === WebSocket.OPEN &&
      authWs.isAuthenticated &&
      authWs.userId &&
      (authWs.userRole === 'soporte' || authWs.userRole === 'superadmin')
    ) {
      authWs.send(message);
    }
  });
}

export function getOnlineSupportUserIds(): string[] {
  const onlineIds: string[] = [];
  clients.forEach((sockets, userId) => {
    if (sockets.size > 0) {
      onlineIds.push(userId);
    }
  });
  return onlineIds;
}
