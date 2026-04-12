import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { barbero, servicio, fecha, hora, precio, cliente } = body;

    const text =
      `📅 *Nueva Reservación*\n\n` +
      `👤 *Cliente:* ${cliente}\n` +
      `✂️ *Barbero:* ${barbero}\n` +
      `💈 *Servicio:* ${servicio}\n` +
      `📆 *Fecha:* ${fecha}\n` +
      `🕐 *Hora:* ${hora}\n` +
      `💰 *Precio:* $${precio}`;

    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "Markdown",
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("[telegram notify error]", err);
      return NextResponse.json({ ok: false, error: err }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[telegram notify exception]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
