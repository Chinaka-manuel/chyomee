import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { createHash } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { User } from "../models/userSchema.js";
import { sendVerificationEmail } from "../config/email.js";
import { emailVerificationEnabled } from "../utils/verification.js";

dotenv.config({ path: "./.env" });

const { MONGODB_URL, JWT_SECRET, API_URL } = process.env;
if (!MONGODB_URL || !JWT_SECRET || !API_URL) {
    throw new Error("Set MONGODB_URL, JWT_SECRET and API_URL before provisioning an administrator");
}
if (JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters");
}

const prompt = createInterface({ input: stdin, output: stdout });
const adminName = (await prompt.question("Administrator name: ")).trim();
const adminEmail = (await prompt.question("Administrator email: ")).trim().toLowerCase();
prompt.close();

const readPassword = async () => {
    if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
        const passwordPrompt = createInterface({ input: stdin, output: stdout });
        try {
            return await passwordPrompt.question("Administrator password: ");
        } finally {
            passwordPrompt.close();
        }
    }

    stdout.write("Administrator password: ");
    stdin.setRawMode(true);
    stdin.resume();
    return new Promise((resolve, reject) => {
        let password = "";
        const cleanup = () => {
            stdin.off("data", onData);
            stdin.setRawMode(false);
            stdin.pause();
            stdout.write("\n");
        };
        const onData = (chunk) => {
            for (const character of chunk.toString()) {
                if (character === "\u0003") {
                    cleanup();
                    reject(new Error("Administrator provisioning cancelled"));
                    return;
                }
                if (character === "\r" || character === "\n") {
                    cleanup();
                    resolve(password);
                    return;
                }
                if (character === "\u007f" || character === "\b") {
                    password = password.slice(0, -1);
                } else {
                    password += character;
                }
            }
        };
        stdin.on("data", onData);
    });
};

const adminPassword = await readPassword();
if (!adminName || !adminEmail || !adminPassword) {
    throw new Error("Administrator name, email and password are required");
}

await mongoose.connect(MONGODB_URL);
try {
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
        throw new Error("That email already has an account; administrator provisioning will not modify an existing user");
    }
    const administrator = await User.create({
        userName: adminName,
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        isVerified: !emailVerificationEnabled(),
    });
    if (emailVerificationEnabled()) {
        const verificationToken = jwt.sign(
            { id: administrator._id, email: adminEmail, tokenType: "verification" },
            JWT_SECRET,
            { expiresIn: "24h" }
        );
        administrator.verificationToken = createHash("sha256").update(verificationToken).digest("hex");
        await administrator.save();
        try {
            await sendVerificationEmail(
                administrator,
                `${API_URL}/user/verify-email/${verificationToken}`
            );
        } catch {
            await User.deleteOne({ _id: administrator._id });
            throw new Error("Administrator created but the Resend verification email could not be sent; the unverified account was removed");
        }
    }
    console.log("Administrator account created successfully.");
} finally {
    await mongoose.disconnect();
}
