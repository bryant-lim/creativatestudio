import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const SYSTEM_PROMPT = `
You are Welly AI, the friendly and helpful AI assistant for Creativate Studio, a professional digital agency based in Malaysia specializing in web development, custom CRM development, AI Chatbots & Automation, digital marketing, and support.
Your goal is to answer customer enquiries accurately and consultatively.

CONSTRAINTS & RULES:
1. RESPONSE LENGTH: Your reply MUST be very short and direct—strictly between 200 to 350 characters. Long paragraphs are not allowed.
2. PRICING: If asked about pricing for ANY service, explain that accurate pricing can only be provided after understanding their project requirements. Then, immediately ask if they can share their budget and timeline.
3. WEB DESIGN, e-COMMERCE, or BRAND IDENTITY: Ask if they have any reference/inspiration websites. Check their business background (industry and vertical) and ask why they need this (are they facing any current issues?).
4. DIGITAL MARKETING: Ask if they have run ads before, on which platforms, what their next goal is, and their business vertical.
5. TECH SUPPORT & MAINTENANCE: Ask what existing system/platform (e.g., WordPress, Next.js, custom PHP) they are currently using, and if they are facing any active issues.
6. AUTOMATION: If asked about automation, consult and answer specifically in the area of AI Chatbots & Automation. Do not default to CRM automation unless the customer explicitly mentions CRM.
7. CONVERSATION CLOSURE FLOW:
   - PHASE 1: PRE-CLOSURE: Once you have gathered all necessary information (requirements, contact details, business vertical, budget/timeline) and are ready to finish, you MUST reply exactly: 'I will get my team to contact you regarding your requirements. Can you please verify if the contact details is correct?' and append the tag [PRE_CLOSURE] to the end. Do not write any other text.
   - PHASE 2: FINAL CLOSURE: Once the user confirms the details are correct or submits them, reply exactly: 'Thanks. Is there anything else I can assist you with?' and append the tag [FINAL_CLOSURE].
   - PHASE 3: CLOSURE COMPLETION: If the user replies negatively (e.g., 'no', 'nothing else', 'no thanks', 'thank you'), reply exactly: 'Thank you for contacting us. Have a nice day!' and append the tag [CLOSURE_COMPLETE].
   - RESUME CHAT: If at any point during pre-closure or final closure the user asks a new question or changes the topic, resume the normal conversation and answer their questions normally without appending any closure tags.
8. TONE & STYLE: Polite, humanized, conversational, and tailored to local Malaysian business style. Show genuine care in understanding their business needs.

OFFICIAL DETAILS:
- Address: Solaris Dutamas, Kuala Lumpur
- Telegram Support: @bryantlim (https://t.me/bryantlim)
- Email: hello@creativatestudio.my
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
    if (!response.ok) {
      const errText = await response.text();
      console.error("Telegram API Error response:", response.status, errText);
    }
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
      const { name, phone, email, message } = leadInfo;

      // Generate a chat summary using Groq
      let summary = "No chat history provided.";
      if (messages && messages.length > 0) {
        try {
          const chatHistoryText = messages
            .map((m: ChatMessage) => `${m.role === "user" ? "Client" : "AI"}: ${m.content}`)
            .join("\n");

          const summaryCompletion = await groq.chat.completions.create({
            messages: [
              {
                role: "system",
                content: `You are a professional business summary assistant. Summarize the provided chat transcript in 2-3 sentences.
Strict Rules:
- Focus on the customer's actual business goals, industry/vertical, and project details.
- If they mention websites or brands (e.g. "Zus Coffee") as reference or inspiration, explicitly state they are references. Do NOT assume or state that the client owns or runs these reference brands unless they explicitly state so.
- Be factual and objective. Do not extrapolate or guess details.`,
              },
              {
                role: "user",
                content: chatHistoryText,
              },
            ],
            model: "llama-3.1-8b-instant",
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
        `<b>Phone:</b> ${phone}\n` +
        `<b>Email:</b> ${email || "N/A"}\n` +
        `<b>User Message:</b> ${message || "N/A"}\n\n` +
        `<b>Conversation Summary:</b>\n<i>${summary}</i>`;

      // Log summary to server console (Option 1)
      console.log("================= NEW LEAD =================");
      console.log(`Name: ${name}`);
      console.log(`Phone: ${phone}`);
      console.log(`Email: ${email || "N/A"}`);
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
        { 
          role: "system", 
          content: SYSTEM_PROMPT + (body.clientName ? `\nYou are chatting with ${body.clientName}. Greet them by name in your responses when appropriate.` : "")
        },
        ...messages.map((m: ChatMessage) => ({ role: m.role, content: m.content })),
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
    });

    let reply = chatCompletion.choices[0]?.message?.content || "I apologize, I am unable to answer right now. Please message us on Telegram!";
    let isPreClosure = false;
    let isFinalClosure = false;
    let isClosureComplete = false;

    if (reply.includes("[PRE_CLOSURE]")) {
      isPreClosure = true;
      reply = reply.replace("[PRE_CLOSURE]", "").trim();
    }
    if (reply.includes("[FINAL_CLOSURE]")) {
      isFinalClosure = true;
      reply = reply.replace("[FINAL_CLOSURE]", "").trim();
    }
    if (reply.includes("[CLOSURE_COMPLETE]")) {
      isClosureComplete = true;
      reply = reply.replace("[CLOSURE_COMPLETE]", "").trim();
    }

    return NextResponse.json({ reply, isPreClosure, isFinalClosure, isClosureComplete });
  } catch (error) {
    console.error("Error in Chat API Route:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
