import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { barberoId, barbero, servicio, fecha, hora, precio, cliente } = body;

    // Obtener email del barbero via función RPC
    const { data: emailBarbero, error: emailError } = await supabase.rpc(
      "get_barbero_email",
      { barbero_id: barberoId }
    );

    if (emailError || !emailBarbero) {
      console.error("[email lookup error]", emailError);
      return NextResponse.json({ ok: false, error: "No se encontró el email del barbero" }, { status: 400 });
    }

    // Para testing, enviar a email fijo; en producción usar emailBarbero
    const toEmail = process.env.EMAIL_TEST_OVERRIDE ?? (emailBarbero as string);

    await transporter.sendMail({
      from: `"Barber.it" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: "✂️ Nueva reservación — Barber.it",
      html: buildEmailHtml({ barbero, servicio, fecha, hora, precio, cliente }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[email notify exception]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

function buildEmailHtml(p: {
  barbero: string;
  servicio: string;
  fecha: string;
  hora: string;
  precio: string;
  cliente: string;
}) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Nueva Reservación — Barber.it</title>
</head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0d0d0d;padding:48px 0;">
  <tr>
    <td align="center">
      <table width="580" cellpadding="0" cellspacing="0" border="0"
             style="max-width:580px;background:#111111;border-radius:16px;overflow:hidden;border:1px solid #1f1f1f;">

        <!-- HEADER -->
        <tr>
          <td style="background:#c8ff00;padding:32px 40px 28px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:800;letter-spacing:0.25em;color:#0d0d0d;text-transform:uppercase;">
              B A R B E R . I T
            </p>
            <h1 style="margin:0;font-size:32px;font-weight:900;letter-spacing:0.04em;color:#0d0d0d;text-transform:uppercase;line-height:1.1;">
              Nueva Reservación
            </h1>
          </td>
        </tr>

        <!-- GREETING -->
        <tr>
          <td style="padding:32px 40px 0;">
            <p style="margin:0;font-size:15px;color:#999;line-height:1.7;">
              Hola <strong style="color:#ffffff;">${p.barbero}</strong>,<br/>
              tienes una nueva reservación confirmada. Aquí están los detalles:
            </p>
          </td>
        </tr>

        <!-- DETAIL CARD -->
        <tr>
          <td style="padding:24px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border-radius:10px;overflow:hidden;border:1px solid #242424;">

              <tr style="background:#181818;">
                <td style="padding:16px 20px;border-bottom:1px solid #242424;">
                  <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.14em;color:#555;text-transform:uppercase;">Servicio</p>
                  <p style="margin:5px 0 0;font-size:17px;font-weight:700;color:#ffffff;">${p.servicio}</p>
                </td>
              </tr>

              <tr style="background:#161616;">
                <td style="padding:16px 20px;border-bottom:1px solid #242424;">
                  <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.14em;color:#555;text-transform:uppercase;">Fecha y hora</p>
                  <p style="margin:5px 0 0;font-size:17px;font-weight:700;color:#ffffff;">
                    ${p.fecha}&nbsp;&nbsp;<span style="color:#444;">·</span>&nbsp;&nbsp;${p.hora}
                  </p>
                </td>
              </tr>

              <tr style="background:#181818;">
                <td style="padding:16px 20px;border-bottom:1px solid #242424;">
                  <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.14em;color:#555;text-transform:uppercase;">Precio</p>
                  <p style="margin:5px 0 0;font-size:20px;font-weight:900;color:#c8ff00;">$${p.precio}</p>
                </td>
              </tr>

              <tr style="background:#161616;">
                <td style="padding:16px 20px;">
                  <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.14em;color:#555;text-transform:uppercase;">Cliente</p>
                  <p style="margin:5px 0 0;font-size:17px;font-weight:700;color:#ffffff;">${p.cliente}</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <p style="margin:0 0 20px;font-size:13px;color:#555;line-height:1.6;">
              Gestiona tus reservaciones desde tu panel en Barber.it.
            </p>
            <a href="https://barber.it"
               style="display:inline-block;background:#c8ff00;color:#0d0d0d;font-size:13px;font-weight:800;
                      letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;
                      padding:14px 32px;border-radius:8px;">
              Ir al panel →
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #1a1a1a;text-align:center;">
            <p style="margin:0;font-size:11px;color:#333;letter-spacing:0.05em;">
              © 2025 Barber.it &nbsp;·&nbsp; Todos los derechos reservados
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;
}
