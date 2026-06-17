import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const SYSTEM_PROMPT = `
You are Welly AI, the AI assistant for Creativate Studio, a professional digital agency based in Malaysia specializing in web development, custom CRM development, and digital marketing.
Your goal is to answer customer enquiries accurately, professionally, and ground your answers in our official services and details.

OFFICIAL DETAILS:
- Name: Creativate Studio
- Years of Experience: 8+ years of digital excellence
- Address: B2-2-3, 1, Jln Dutamas 1, Solaris Dutamas, 50480 Kuala Lumpur, Wilayah Persekutuan
- Telegram Support: @bryantlim (Telegram link: https://t.me/bryantlim)
- Official Email: hello@creativatestudio.my

SERVICES:
1. Web Design & e-Commerce: Bespoke, conversion-optimized storefronts and brand profiles that scale.
2. Software Development: Custom CRM and automation workflows tailored to streamline specific operations.
3. Mobile App Development: High-performance iOS and Android applications built for speed and engagement.
4. Digital Marketing: Strategic Google and Facebook Ads combined with SEO to drive traffic.
5. Brand Identity: Professional logo design and visual systems.
6. Technical Support & Maintenance: Dedicated technical assistance, regular updates, and security monitoring for digital platforms and systems.

UPSELLING STRATEGY:
- If a customer inquires about Web Design/e-Commerce: Consultatively explain how a "Technical Support & Maintenance" plan protects their investment against security exploits and keeps plugins up to date.
- If a customer inquires about Custom CRM/Software Development: Suggest combining it with "Digital Marketing" (specifically SEO/Google Ads) to acquire new users, or "Technical Support & Maintenance" to handle continuous bug fixes and server backups.
- If a customer inquires about Mobile App Development: Suggest "Software Development" for building a robust admin CRM panel to manage users and view analytics.
- If a customer inquires about Brand Identity: Suggest "Web Design" to showcase their new brand with a stunning modern website.
Ensure the upsell feels like helpful consulting rather than a hard sales pitch.

COMMUNICATION STYLE:
- Polite, professional, structured, and informative.
- Keep responses concise (under 3 paragraphs).
- Direct them to leave their contact details or click "Request Call Back" in the chat widget if they want a direct quote, custom consultation, or want our team to call them.
`;

async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram configuration missing. Cannot send message.");
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, messages } = body;

    if (action === "lead") {
      const { leadInfo } = body;
      const { name, contact, message } = leadInfo;

      // Generate a chat summary using Groq
      let summary = "No chat history provided.";
      if (messages && messages.length > 0) {
        try {
          const chatHistoryText = messages
            .map((m: any) => `${m.role === "user" ? "Client" : "AI"}: ${m.content}`)
            .join("\n");

          const summaryCompletion = await groq.chat.completions.create({
            messages: [
              {
                role: "system",
                content: "Summarize this client chat conversation in 2-3 sentences, focusing on their business needs and project details.",
              },
              {
                role: "user",
                content: chatHistoryText,
              },
            ],
            model: "llama3-8b-8192",
            temperature: 0.3,
          });
          summary = summaryCompletion.choices[0]?.message?.content || "Could not generate summary.";
        } catch (sumErr) {
          console.error("Failed to generate summary with Groq:", sumErr);
        }
      }

      // Format Telegram message
      const telegramText = `<b>🚀 New Lead Captured!</b>\n\n` +
        `<b>Name:</b> ${name}\n` +
        `<b>Contact:</b> ${contact}\n` +
        `<b>User Message:</b> ${message || "N/A"}\n\n` +
        `<b>Conversation Summary:</b>\n<i>${summary}</i>`;

      // Log summary to server console (Option 1)
      console.log("================= NEW LEAD =================");
      console.log(`Name: ${name}`);
      console.log(`Contact: ${contact}`);
      console.log(`User Message: ${message}`);
      console.log(`Chat Summary: ${summary}`);
      console.log("============================================");

      // Send to Telegram (Option 2)
      const telegramSent = await sendTelegramMessage(telegramText);

      return NextResponse.json({ success: true, telegramSent });
    }

    // Default: Chat action
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m: any) => ({ role: m.role, content: m.content })),
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "I apologize, I am unable to answer right now. Please message us on Telegram!";
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Error in Chat API Route:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
