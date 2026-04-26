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

export function buildTwimlSay(text: string, voice = 'Polly.Joanna'): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}">${text}</Say>
  <Gather input="speech" action="/twilio/voice/process-turn" method="POST" speechTimeout="auto" language="en-US">
  </Gather>
</Response>`;
}

export function buildTwimlGather(prompt: string, voice = 'Polly.Joanna'): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="/twilio/voice/process-turn" method="POST" speechTimeout="auto" language="en-US">
    <Say voice="${voice}">${prompt}</Say>
  </Gather>
  <Say voice="${voice}">I didn't catch that. Let me transfer you to our team.</Say>
  <Hangup/>
</Response>`;
}

export function buildTwimlHangup(farewell: string, voice = 'Polly.Joanna'): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}">${farewell}</Say>
  <Hangup/>
</Response>`;
}

export { client as twilioClient };
