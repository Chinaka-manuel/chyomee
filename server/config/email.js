import dotenv from "dotenv";
import { Resend } from "resend";
import EmailDelivery from "../models/EmailDelivery.js";
import { User } from "../models/userSchema.js";

dotenv.config({ path: "./.env" });

const getAdminEmails = async () => {
    const admins = await User.find({
        role: "admin",
        isActive: true,
        isVerified: true,
    })
        .select("email")
        .lean();
    return admins.map((admin) => admin.email);
};

const requireAdminEmails = async () => {
    const emails = await getAdminEmails();
    if (!emails.length) {
        throw new Error("No active, verified administrator accounts are configured in the database");
    }
    return emails;
};

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
}[character]));

const sendEmail = async (message) => {
    const { RESEND_API_KEY, RESEND_FROM_EMAIL } = process.env;
    if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
        throw new Error("email service is not configured");
    }

    const { data, error } = await new Resend(RESEND_API_KEY).emails.send({
        from: RESEND_FROM_EMAIL,
        ...message,
    });
    if (error) throw new Error(`email delivery failed: ${error.message}`);

    if (data?.id) {
        try {
            await EmailDelivery.updateOne(
                { resendEmailId: data.id },
                {
                    $setOnInsert: {
                        resendEmailId: data.id,
                        status: "email.sent",
                        lastEventType: "email.sent",
                        lastEventAt: new Date(0),
                    },
                },
                { upsert: true },
            );
        } catch (trackingError) {
            console.error(
                "Email was sent, but its delivery status could not be recorded:",
                trackingError.message,
            );
        }
    } else {
        console.error("Resend accepted an email without returning an email ID.");
    }
};

const orderRows = (order) => (order.items ?? []).map((item) => `
    <tr><td>${escapeHtml(item.name)}${[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`, item.style && `Style: ${item.style}`].filter(Boolean).map((variant) => `<br><small>${escapeHtml(variant)}</small>`).join("")}</td>
    <td>${Number(item.quantity) || 0}</td>
    <td>NGN ${(Number(item.price) || 0).toLocaleString()}</td>
    <td>NGN ${(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString()}</td></tr>`).join("");

const orderNumber = (order) => order.orderNumber || order.paymentReference || "";
const customerDetails = (order) => {
    const customer = order.customer ?? {};
    return {
        name: typeof customer === "object" ? customer.name : customer,
        email: customer.email || order.email,
    };
};

export const sendVerificationEmail = async (user, verificationLink) => sendEmail({
    to: user.email,
    subject: "Verify your email",
    html: `
        <h2>Welcome ${escapeHtml(user.userName)}!</h2>
        <p>Please use the link below to verify your email.</p>
        <p><a href="${escapeHtml(verificationLink)}">Verify email</a></p>
    `,
});

export const sendPasswordResetEmail = async (user, resetLink) => sendEmail({
    to: user.email,
    subject: "Reset your password",
    html: `
        <p>Hello ${escapeHtml(user.userName)},</p>
        <p>Use the link below to reset your password. It expires in one hour.</p>
        <p><a href="${escapeHtml(resetLink)}">Reset password</a></p>
    `,
});

export const sendContactMessageEmail = async ({
    name,
    email,
    phone,
    subject,
    message,
}) => {
    const adminEmails = await requireAdminEmails();

    return sendEmail({
        to: adminEmails,
        replyTo: email,
        subject: `Contact form: ${subject}`,
        text: `New contact form message\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\nSubject: ${subject}\n\nMessage:\n${message}`,
        html: `<h2>New contact form message</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
            <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(message).replace(/\r\n|\r|\n/g, "<br>")}</p>`,
    });
};

export const sendOrderConfirmationEmail = async (order) => {
    const { email, name } = customerDetails(order);
    if (!email) throw new Error("Order confirmation email address is missing");

    return sendEmail({
        to: email,
        subject: `Order(s) confirmation: ${escapeHtml(orderNumber(order))}`,
        html: `<h2>Thank you for your order</h2>
            <p>Hello ${escapeHtml(name || "Customer")},</p>
            <p>We received your order <strong>${escapeHtml(orderNumber(order))}</strong>.</p>
            <p>Payment status: ${escapeHtml(order.paymentStatus || order.payment || "Pending")}</p>
            <table cellpadding="8" cellspacing="0" border="1"><thead><tr><th>Item</th><th>Qty</th><th>Unit price</th><th>Total</th></tr></thead><tbody>${orderRows(order)}</tbody></table>
            ${Number(order.deliveryFee) > 0 ? `<p>Delivery fee: NGN ${Number(order.deliveryFee).toLocaleString()}</p>` : ""}
            <p><strong>Order total: NGN ${(Number(order.total) || 0).toLocaleString()}</strong></p>
            <p>We will notify you when your order status changes.</p>`,
    });
};

export const sendPaymentReceiptEmail = async (order) => {
    const { email, name } = customerDetails(order);
    if (!email) throw new Error("Receipt email address is missing");
    const adminEmails = (await getAdminEmails()).filter(
        (adminEmail) => adminEmail.toLowerCase() !== email.toLowerCase(),
    );
    const receiptNumber = order.receiptNumber || `RCP-${Date.now()}`;
    const orderId = order.id || "";

    return sendEmail({
        to: email,
        ...(adminEmails.length
            ? { bcc: adminEmails }
            : {}),
        subject: `Payment receipt for order ${escapeHtml(orderNumber(order))}`,
        html: `<h2>Payment received</h2>
            <p>Hello ${escapeHtml(name || "Customer")},</p>
            <p>We received your payment for order <strong>${escapeHtml(order.orderNumber || orderNumber(order))}</strong>.</p>
            <p>Order reference: ${escapeHtml(order.orderNumber || "")}</p>
            <p>Payment reference: ${escapeHtml(order.paymentReference || order.transactionReference || "")}</p>
            ${order.transactionReference && order.paymentReference ? `<p>Bank transaction reference: ${escapeHtml(order.transactionReference)}</p>` : ""}
            <p>Receipt number: <strong>${escapeHtml(receiptNumber)}</strong></p>
            <p>Payment method: ${escapeHtml(order.paymentMethod || "Bank Transfer")}</p>
            <p>Payment confirmation date: ${escapeHtml(order.paymentConfirmationDate || order.paidAt || new Date().toISOString())}</p>
            <table cellpadding="8" cellspacing="0" border="1"><thead><tr><th>Item</th><th>Qty</th><th>Unit price</th><th>Total</th></tr></thead><tbody>${orderRows(order)}</tbody></table>
            ${Number(order.deliveryFee) > 0 ? `<p>Delivery fee: NGN ${Number(order.deliveryFee).toLocaleString()}</p>` : ""}
            ${Number(order.loyaltyDiscount) > 0 ? `<p>Loyalty discount: NGN ${Number(order.loyaltyDiscount).toLocaleString()}</p>` : ""}
            <p><strong>Total paid: NGN ${(Number(order.total) || 0).toLocaleString()}</strong></p>
            ${Number(order.loyaltyPointsEarnedKobo) > 0 ? `<p>Loyalty points earned: NGN ${(Number(order.loyaltyPointsEarnedKobo) / 100).toLocaleString()}</p>` : ""}
            <p>Payment status: Paid</p>
            <p>You can download this receipt at any time from your <a href="${escapeHtml(process.env.CLIENT_URL || "")}/account/orders/${escapeHtml(orderId)}">order page</a>.</p>`,
    });
};

export const sendOrderNotificationEmail = async (order) => {
    const adminEmails = await requireAdminEmails();
    const { name } = customerDetails(order);
    const customer = order.customer ?? {};

    return sendEmail({
        to: adminEmails,
        subject: `New order notification: ${escapeHtml(orderNumber(order))}`,
        html: `<h2>New order received</h2>
            <p>A new order has been placed.</p>
            <p>Order number: <strong>${escapeHtml(orderNumber(order))}</strong></p>
            <p>Customer: ${escapeHtml(name || "—")}</p>
            <p>Email: ${escapeHtml(order.email || "—")}</p>
            <p>Phone: ${escapeHtml((typeof customer === "object" ? customer.phone : "") || "")}</p>
            <p>Total: NGN ${(Number(order.total) || 0).toLocaleString()}</p>
            <p>Payment method: ${escapeHtml(order.paymentMethod || "Pending")}</p>
            <p>Payment status: ${escapeHtml(order.paymentStatus || order.payment || "")}</p>
            <p>Order date: ${escapeHtml(order.date || new Date().toISOString())}</p>
            <table cellpadding="8" cellspacing="0" border="1"><thead><tr><th>Item</th><th>Qty</th><th>Unit price</th><th>Total</th></tr></thead><tbody>${orderRows(order)}</tbody></table>
            <p>View order in admin dashboard.</p>`,
    });
};
