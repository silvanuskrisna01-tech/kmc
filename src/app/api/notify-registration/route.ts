import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, phone, instrument, notes } = await request.json();
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.log("[Discord] Webhook URL not configured");
      return NextResponse.json({ ok: true, notice: "webhook not configured" });
    }

    const fields = [
      { name: "Nama", value: name || "-", inline: true },
      { name: "Telepon", value: phone || "-", inline: true },
      { name: "Instrumen", value: instrument || "-", inline: true },
    ];

    if (notes) {
      fields.push({ name: "Catatan", value: notes, inline: false });
    }

    const payload = {
      username: "KMC",
      avatar_url: "https://em-content.img/🎵/color.png",
      embeds: [
        {
          title: "🎵 Pendaftaran Kursus Baru",
          color: 0x059669,
          fields,
          timestamp: new Date().toISOString(),
          footer: { text: "Krisna Music Course" },
        },
      ],
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