// Deterministic checks over one whole conversation (the provider's JSON output).
const STOCK = /\b(i hear you|no rush|take your time|i am here|i'm here|glad you said|with you[.!]|ich höre dich|kein stress|lass dir zeit)/i;
const LOOK_WORDS = /(warmer|cooler|softer|sharper|eyes|shorter answers|how (should|do) i look|should i look|colou?r|shape|appearance|wärmer|kühler|weicher|schärfer|kürzer|ausführlicher|aussehen|aussehe|farbe)/i;
const LOOK_PAIR = /(warmer or cooler|softer (eyes )?or sharper|shorter or longer|wärmer oder kühler|weicher oder schärfer|kürzer oder ausführlicher)/i;
const REFUSAL = /(i (can(no|')t|cannot|am not able to) (change|adjust|alter|modify)|ich kann (das |mich |mein aussehen )?nicht (ändern|anpassen))/i;

// Models write typographic apostrophes; the patterns below use the plain one.
const replies = (output) => JSON.parse(output).turns.map((turn) => turn.agent.replaceAll('\u2019', "'"));
const asks = (reply) => LOOK_PAIR.test(reply)
  || (reply.match(/[^.!?]+\?/g) || []).some((sentence) => LOOK_WORDS.test(sentence));
const askTurns = (output) => replies(output).flatMap((reply, i) => (asks(reply) ? [i + 1] : []));
const result = (pass, reason) => ({ pass, score: pass ? 1 : 0, reason });

export function noEmptyReply(output) {
  const empty = replies(output).filter((reply) => !reply).length;
  return result(empty === 0, `empty replies: ${empty}`);
}

export function noStockPhrase(output) {
  const hits = replies(output).filter((reply) => STOCK.test(reply));
  return result(hits.length === 0, `replies with a stock phrase: ${hits.length} ${JSON.stringify(hits)}`);
}

export function noRepeatedOpener(output) {
  // Same first sentence (up to six words) twice counts as a repeated opener.
  const openers = replies(output).map((reply) => reply.split(/[.!?,;:]/)[0].toLowerCase().split(/\s+/).slice(0, 6).join(' '));
  const repeated = openers.filter((opener, i) => opener && openers.indexOf(opener) !== i);
  return result(repeated.length === 0, `repeated openers: ${JSON.stringify(repeated)}`);
}

export function appearanceAtMostOnce(output) {
  const at = askTurns(output);
  return result(at.length <= 1, `appearance asked in replies ${JSON.stringify(at)}`);
}

export function appearanceAsExpected(output, context) {
  const at = askTurns(output);
  const expected = String(context.vars.expectAsk) === 'true';
  const pass = expected ? at.length > 0 && at[0] <= 2 : at.length === 0;
  return result(pass, `expected ${expected ? 'an early question' : 'no question'}, asked in ${JSON.stringify(at)}`);
}

export function noChangeRefusal(output) {
  const hits = replies(output).filter((reply) => REFUSAL.test(reply));
  return result(hits.length === 0, `refusals to change: ${JSON.stringify(hits)}`);
}

// The persona says the page is not an assistant; a self-description as one is a miss.
const ASSISTANT_CLAIM = /\b(i am|i'm|ich bin)\s+(just |only |nur )?(an?|ein(e)?)\s+([a-zäöü-]+[ -])?(assistant|chatbot|assistent|ki-assistent|language model|sprachmodell)\b/i;
// "I cannot ask yet" contradicts the prompt, which tells the agent to ask.
const CANNOT_ASK = /(fragen[^.!?]{0,40}kann ich[^.!?]{0,20}nicht|kann ich[^.!?]{0,60}nicht[^.!?]{0,30}fragen|das kann ich noch nicht|i (can(no|')t|cannot) (yet )?ask)/i;

export function noAssistantClaim(output) {
  const hits = replies(output).filter((reply) => ASSISTANT_CLAIM.test(reply));
  return result(hits.length === 0, `assistant claims: ${JSON.stringify(hits)}`);
}

export function noCannotAsk(output) {
  const hits = replies(output).filter((reply) => CANNOT_ASK.test(reply));
  return result(hits.length === 0, `cannot-ask replies: ${JSON.stringify(hits)}`);
}
