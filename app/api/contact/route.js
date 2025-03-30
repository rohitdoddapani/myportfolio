import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log('inn routeejsss')
  const nodemailer = (await import("nodemailer")).default;
  const axios = (await import("axios")).default; // ✅ Only imports when needed

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.GMAIL_PASSKEY, 
    },
  });

  async function sendTelegramMessage(token, chat_id, message) {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    try {
      const res = await axios.post(url, { text: message, chat_id });
      return res.data.ok;
    } catch (error) {
      console.error('Error sending Telegram message:', error.response?.data || error.message);
      return false;
    }
  };

  async function sendEmail(payload, message) {
    const { name, email, message: userMessage } = payload;
    const mailOptions = {
      from: "Portfolio", 
      to: process.env.EMAIL_ADDRESS, 
      subject: `New Message From ${name}`, 
      text: message, 
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${userMessage}</p>`,
      replyTo: email, 
    };
    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error while sending email:', error.message);
      return false;
    }
  };

  try {
    const payload = await request.json();
    const { name, email, message: userMessage } = payload;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat_id = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chat_id) {
      return NextResponse.json({ success: false, message: 'Telegram token or chat ID is missing.' }, { status: 400 });
    }

    const message = `New message from ${name}\n\nEmail: ${email}\n\nMessage:\n\n${userMessage}\n\n`;
    const telegramSuccess = await sendTelegramMessage(token, chat_id, message);
    const emailSuccess = await sendEmail(payload, message);

    if (telegramSuccess && emailSuccess) {
      return NextResponse.json({ success: true, message: 'Message and email sent successfully!' }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: 'Failed to send message or email.' }, { status: 500 });
  } catch (error) {
    console.error('API Error:', error.message);
    return NextResponse.json({ success: false, message: 'Server error occurred.' }, { status: 500 });
  }
};