// server/src/routes.messages.js
import { all, run } from "./db.js";

/**
 * Messages API
 *
 * - GET  /api/message-channels
 * - GET  /api/message-channels/:channelId/messages
 * - POST /api/message-channels/:channelId/messages
 *
 * Uses tables:
 *   message_channels(id, name, type, description, unread_count, last_message, last_activity)
 *   messages(id, channel_id, user_name, body, timestamp_label, date_label, is_own, created_at)
 */
export function messagesRoutes(app) {
  // ---- CHANNELS ----
  app.get("/api/message-channels", async (_req, res, next) => {
    try {
      const rows = await all(
        `
        SELECT
          id,
          name,
          type,
          description,
          unread_count,
          last_message,
          last_activity
        FROM message_channels
        ORDER BY id ASC
        `
      );

      const channels = rows.map((ch) => ({
        id: ch.id,
        name: ch.name,
        type: ch.type,
        description: ch.description,
        unreadCount: ch.unread_count ?? 0,
        lastMessage: ch.last_message ?? "",
        lastActivity: ch.last_activity ?? "",
      }));

      res.json(channels);
    } catch (err) {
      next(err);
    }
  });

  // ---- MESSAGES ----
  app.get(
    "/api/message-channels/:channelId/messages",
    async (req, res, next) => {
      try {
        const { channelId } = req.params;

        const rows = await all(
          `
          SELECT
            id,
            channel_id,
            user_name,
            body,
            timestamp_label,
            date_label,
            is_own,
            created_at
          FROM messages
          WHERE channel_id = ?
          ORDER BY id ASC
          `,
          [channelId]
        );

        const messages = rows.map((m) => ({
          id: m.id,
          channelId: m.channel_id,
          user: m.user_name,
          message: m.body,
          timestamp: m.timestamp_label,
          date: m.date_label,
          isOwn: !!m.is_own,
          created_at: m.created_at,
        }));

        res.json(messages);
      } catch (err) {
        next(err);
      }
    }
  );

  app.post(
    "/api/message-channels/:channelId/messages",
    async (req, res, next) => {
      try {
        const { channelId } = req.params;
        const { user, message } = req.body || {};

        if (!user || !message) {
          return res
            .status(400)
            .json({ error: "user and message are required" });
        }

        // simple labels for now
        const now = new Date();
        const timestampLabel = now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const dateLabel = "Today";

        const isOwn = user.toLowerCase() === "you" ? 1 : 0;

        const result = await run(
          `
          INSERT INTO messages
            (channel_id, user_name, body, timestamp_label, date_label, is_own)
          VALUES (?,?,?,?,?,?)
          `,
          [channelId, user, message, timestampLabel, dateLabel, isOwn]
        );

        const [row] = await all(
          `
          SELECT
            id,
            channel_id,
            user_name,
            body,
            timestamp_label,
            date_label,
            is_own,
            created_at
          FROM messages
          WHERE id = ?
          `,
          [result.lastID]
        );

        const created = {
          id: row.id,
          channelId: row.channel_id,
          user: row.user_name,
          message: row.body,
          timestamp: row.timestamp_label,
          date: row.date_label,
          isOwn: !!row.is_own,
          created_at: row.created_at,
        };

        // Optionally bump channel's last_message / last_activity
        await run(
          `
          UPDATE message_channels
          SET last_message = ?, last_activity = ?
          WHERE id = ?
          `,
          [message, `${dateLabel} ${timestampLabel}`, channelId]
        );

        res.status(201).json(created);
      } catch (err) {
        next(err);
      }
    }
  );
}
