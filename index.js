import express from "express";
import cors from "cors";
import twilio from "twilio";
import nodemailer from "nodemailer";
import "dotenv/config.js";

const app = express();
app.use(cors());
app.use(express.json());

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get("/", (req, res) => res.send("<p>Backend for EYB Running...</p>"));

app.post("/send-sms", async (req, res) => {
  const { contact } = req.body;
  if (!contact)
    return res.status(400).json({ error: "Contact details are required" });

  try {
    const message = await client.messages.create({
      body: `\nHello EYB \nA Client is trying to reach out, please contact the client at: \nMob No/Email : ${contact}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.RECEIVER_PHONE_NUMBER,
    });

    res.json({ success: true, message: "SMS Sent!", sid: message.sid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/send-email", async (req, res) => {
  const { name, email, contactNo, organization, message } = req.body;

  if (!name || !email || !message || !contactNo || !organization) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: `EYB Contact/Feedback mail`,
      text: `Client Details :\n\nName: ${name}\nEmail: ${email}\nContact No:${contactNo}\nOrganization : ${organization}\n\nMessage:\n\n${message}`,
    });

    res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

app.listen(process.env.PORT, () => console.log("Server running on port 8000"));
