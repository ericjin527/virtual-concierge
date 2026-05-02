import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

export async function sendSms(to: string, body: string): Promise<string> {
  const msg = await client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
    body,
  });
  return msg.sid;
}

function xmlEscape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildTwimlGather(prompt: string, voice = 'Polly.Joanna', language = 'en-US'): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="/twilio/voice/process-turn" method="POST" speechTimeout="3" actionOnEmptyResult="true" language="${language}">
    <Say voice="${voice}">${xmlEscape(prompt)}</Say>
  </Gather>
</Response>`;
}

export function buildTwimlHangup(farewell: string, voice = 'Polly.Joanna'): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}">${xmlEscape(farewell)}</Say>
  <Hangup/>
</Response>`;
}

export { client as twilioClient };
