// Voice adapter — modular so OpenAI Realtime can replace this later without touching agent logic.

export interface VoiceTurn {
  transcript: string;
  callSid: string;
}

export interface VoiceResponse {
  twiml: string;
  done: boolean;
}

export type VoiceAdapterHandler = (turn: VoiceTurn, businessId: string) => Promise<VoiceResponse>;

// Registry allows swapping adapters (Twilio Gather+TTS vs OpenAI Realtime)
let activeAdapter: VoiceAdapterHandler | null = null;

export function registerVoiceAdapter(handler: VoiceAdapterHandler): void {
  activeAdapter = handler;
}

export async function handleVoiceTurn(turn: VoiceTurn, businessId: string): Promise<VoiceResponse> {
  if (!activeAdapter) {
    throw new Error('No voice adapter registered. Call registerVoiceAdapter() at startup.');
  }
  return activeAdapter(turn, businessId);
}
