import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, phone, instrument, notes } = await request.json();
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.log("[Discord] Webhook URL not configured");
      return NextResponse.json({ ok: true, notice: "webhook not configured" });
    }

    let msg =
`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎵 **Pendaftaran Kursus Baru**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Nama**       : ${name || "-"}
**Telepon**    : ${phone || "-"}
**Instrumen**  : ${instrument || "-"}`;

    if (notes) {
      msg += `\n**Catatan**    : ${notes}`;
    }

    msg +=
`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Krisna Music Course — ${new Date().toISOString().slice(0, 10)}_`;

    const payload = {
      username: "KMC",
      content: msg,
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("[Discord] Webhook responded", res.status, await res.text());
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Discord] Webhook error", err);
    return NextResponse.json({ ok: true }); // never fail the registration
  }
}