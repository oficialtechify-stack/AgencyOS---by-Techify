import { handleLeadsPayWebhookEvent } from '../../../src/server/leadspayHandler';

// Support Next.js Route Handler signature: export async function POST(req: Request)
export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-leadspay-signature');
    const secret = process.env.LEADSPAY_WEBHOOK_SECRET;

    // Validação de Segurança
    if (secret && signature !== secret) {
      return new Response(JSON.stringify({ error: 'Assinatura inválida' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = await req.json();
    const { event, agency_id, data, timestamp } = payload;

    if (!event) {
      return new Response(JSON.stringify({ error: 'Evento não informado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await handleLeadsPayWebhookEvent({
      event,
      agency_id,
      data,
      timestamp,
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Evento processado com sucesso', ...result }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Erro no Webhook LeadsPay:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno ao processar webhook' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'active',
      service: 'LeadsPay Webhook Receiver',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
