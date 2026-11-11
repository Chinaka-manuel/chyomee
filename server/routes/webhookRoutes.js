import express from "express";
import { Resend } from "resend";
import EmailDelivery from "../models/EmailDelivery.js";

const router = express.Router();
const emailEvents = new Set([
  "email.sent",
  "email.scheduled",
  "email.delivered",
  "email.delivery_delayed",
  "email.complained",
  "email.bounced",
  "email.opened",
  "email.clicked",
  "email.failed",
  "email.suppressed",
]);

router.post("/resend", async (req, res) => {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!webhookSecret || !resendApiKey) {
    return res
      .status(503)
      .json({ status: "failed", message: "Resend webhook is not configured" });
  }

  const payload = req.rawBody?.toString("utf8");
  const headers = {
    id: req.get("svix-id"),
    timestamp: req.get("svix-timestamp"),
    signature: req.get("svix-signature"),
  };
  if (!payload || !headers.id || !headers.timestamp || !headers.signature) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid webhook request" });
  }

  let event;
  try {
    event = new Resend(resendApiKey).webhooks.verify({
      payload,
      headers,
      webhookSecret,
    });
  } catch {
    return res
      .status(401)
      .json({ status: "failed", message: "Invalid webhook signature" });
  }

  if (!event || typeof event !== "object" || typeof event.type !== "string") {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid webhook event payload" });
  }
  if (!emailEvents.has(event.type)) return res.sendStatus(200);

  const resendEmailId = event.data?.email_id;
  const eventAt = new Date(event.created_at);
  if (
    typeof resendEmailId !== "string" ||
    !resendEmailId ||
    Number.isNaN(eventAt.getTime())
  ) {
    return res
      .status(400)
      .json({ status: "failed", message: "Invalid email event payload" });
  }

  await EmailDelivery.updateOne(
    { resendEmailId },
    {
      $setOnInsert: {
        resendEmailId,
        status: "email.sent",
        lastEventType: "email.sent",
        lastEventAt: new Date(0),
      },
    },
    { upsert: true },
  );
  await EmailDelivery.updateOne(
    { resendEmailId, lastEventAt: { $lt: eventAt } },
    {
      $set: {
        status: event.type,
        lastEventType: event.type,
        lastEventAt: eventAt,
      },
    },
  );

  return res.status(200).json({ status: "success" });
});

export default router;
