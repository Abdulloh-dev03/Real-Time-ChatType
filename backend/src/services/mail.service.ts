import { google } from "googleapis";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import otpModel from "#models/otp.models.js";
import "dotenv/config";

class MailService {
  private gmail;

  constructor() {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    this.gmail = google.gmail({
      version: "v1",
      auth: oAuth2Client,
    });
  }

  // ---------- helper ----------
  private createMail(to: string, subject: string, html: string): string {
    const message = [
      `To: ${to}`,
      `From: "Project Team" <${process.env.GMAIL_USER}>`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=utf-8",
      "",
      html,
    ].join("\n");

    return Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  // ---------- send OTP ----------
  async sendOtp(to: string): Promise<void> {
    const otp = crypto.randomInt(100000, 1000000).toString();
    console.log("OTP:", otp);

    const hashedOtp = await bcryptjs.hash(otp, 10);

    await otpModel.create({
      email: to,
      otp: hashedOtp,
      expireAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const html = `
      <div style="font-family:sans-serif;padding:20px">
        <h2>Hello 👋</h2>
        <p>Your verification OTP:</p>
        <h1 style="letter-spacing:6px">${otp}</h1>
        <p>Expires in <b>5 minutes</b></p>
      </div>
    `;

    const raw = this.createMail(
      to,
      `OTP Verification - ${new Date().toLocaleDateString()}`,
      html
    );

    try {
      await this.gmail.users.messages.send({
        userId: "me", // IMPORTANT
        requestBody: { raw },
      });

      console.log(`✅ OTP sent to ${to}`);
    } catch (err) {
      console.error("❌ Gmail API send error:", err);
      throw new Error("Email service unavailable");
    }
  }

  // ---------- verify ----------
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const [latest] = await otpModel
      .find({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!latest || latest.expireAt < new Date()) return false;

    const isValid = await bcryptjs.compare(otp, latest.otp);
    if (!isValid) return false;

    await otpModel.deleteMany({ email });
    return true;
  }
}

export default new MailService();
