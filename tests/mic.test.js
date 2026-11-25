import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  MIC_EVENT,
  MIC_STATES,
  RECOGNITION_LANG,
  PROVISIONAL_CLASS,
  CONSENT_TEXT,
  CONSENT_VISIBLE_MS,
  ERROR_VISIBLE_MS,
  DEFAULT_ERROR_HINT,
  micNext,
  composeTranscript,
  collectTranscript,
  hintForError,
  isSilentError,
  isMicSupported,
  getRecognitionCtor,
} from '../src/voice/mic.js';

function run(events, start = 'idle') {
  return events.reduce((state, event) => micNext(state, event), start);
}

test('speech constants stay stable for the surface', () => {
  assert.equal(MIC_EVENT, 'agentfaehig:mic');
  assert.deepEqual([...MIC_STATES], ['idle', 'listening', 'error']);
  assert.equal(RECOGNITION_LANG, 'en-US');
  assert.equal(PROVISIONAL_CLASS, 'is-interim');
  assert.match(CONSENT_TEXT, /browser's speech service/);
  assert.equal(CONSENT_VISIBLE_MS, 6000);
  assert.ok(ERROR_VISIBLE_MS > 0 && ERROR_VISIBLE_MS < CONSENT_VISIBLE_MS);
});

test('state machine: idle -> listening -> idle', () => {
  assert.equal(micNext('idle', 'START'), 'listening');
  assert.equal(micNext('listening', 'STOP'), 'idle');
  assert.equal(run(['START', 'STOP']), 'idle');
  assert.equal(micNext('listening', 'START'), 'listening', 'double start is ignored');
  assert.equal(micNext('idle', 'STOP'), 'idle', 'stop while idle is a no-op');
});

test('state machine: errors are transient and recover on the next click', () => {
  assert.equal(micNext('listening', 'ERROR'), 'error');
  assert.equal(micNext('error', 'RESET'), 'idle');
  assert.equal(micNext('error', 'START'), 'listening');
  assert.equal(micNext('error', 'STOP'), 'idle');
  assert.equal(run(['START', 'ERROR', 'RESET']), 'idle');
  assert.equal(run(['START', 'ERROR', 'START', 'STOP']), 'idle');
});

test('state machine never leaves the known states', () => {
  for (const state of MIC_STATES) {
    for (const event of ['START', 'STOP', 'ERROR', 'RESET', 'bogus', '']) {
      assert.ok(MIC_STATES.includes(micNext(state, event)), `${state} + ${event}`);
    }
  }
  assert.equal(micNext('idle', 'ERROR'), 'idle', 'no error without a session');
  assert.equal(micNext('listening', 'RESET'), 'listening');
});

test('transcript keeps the typed base text', () => {
  assert.equal(composeTranscript('Hello'), 'Hello');
  assert.equal(composeTranscript('Hello ', '', ''), 'Hello');
  assert.equal(composeTranscript('  ', '', ''), '');
  assert.equal(composeTranscript('Hello there', 'and welcome'), 'Hello there and welcome');
});

test('interim text is replaced, final text accumulates', () => {
  assert.equal(composeTranscript('', '', 'hel'), 'hel');
  assert.equal(composeTranscript('', '', 'hello wor'), 'hello wor');
  assert.equal(composeTranscript('', 'hello world', ''), 'hello world');
  assert.equal(composeTranscript('', 'hello world', 'and then'), 'hello world and then');
  assert.equal(composeTranscript('', 'hello world and then', ''), 'hello world and then');
});

test('transcript collapses stray whitespace and never doubles spaces', () => {
  assert.equal(composeTranscript('Hi', '  there  ', '  friend '), 'Hi there friend');
  assert.equal(composeTranscript('Hi', '', '   '), 'Hi');
});

test('collectTranscript reads final and interim results', () => {
  const results = [
    { isFinal: true, transcript: 'hello' },
    { isFinal: true, transcript: 'world' },
    { isFinal: false, transcript: 'and then' },
  ];
  assert.deepEqual(collectTranscript(results), { final: 'hello world', interim: 'and then' });
});

test('collectTranscript uses the best alternative of a result', () => {
  const results = [
    [{ transcript: 'hello' }, { transcript: 'hallo' }],
    { isFinal: false, 0: { transcript: 'ther' } },
  ];
  results[0].isFinal = true;
  assert.deepEqual(collectTranscript(results), { final: 'hello', interim: 'ther' });
});

test('collectTranscript can start at a later index and tolerates empty input', () => {
  const results = [
    { isFinal: true, transcript: 'old' },
    { isFinal: true, transcript: 'new' },
  ];
  assert.deepEqual(collectTranscript(results, 1), { final: 'new', interim: '' });
  assert.deepEqual(collectTranscript(undefined), { final: '', interim: '' });
  assert.deepEqual(collectTranscript([]), { final: '', interim: '' });
  assert.deepEqual(collectTranscript([{ isFinal: true, transcript: '   ' }]), { final: '', interim: '' });
});

test('interim -> final sequences do not duplicate words', () => {
  const base = 'Draft:';
  const first = collectTranscript([{ isFinal: false, transcript: 'make it' }]);
  assert.equal(composeTranscript(base, first.final, first.interim), 'Draft: make it');

  const second = collectTranscript([
    { isFinal: true, transcript: 'make it' },
    { isFinal: false, transcript: 'quieter' },
  ]);
  assert.equal(composeTranscript(base, second.final, second.interim), 'Draft: make it quieter');

  const third = collectTranscript([
    { isFinal: true, transcript: 'make it' },
    { isFinal: true, transcript: 'quieter' },
  ]);
  assert.equal(composeTranscript(base, third.final, third.interim), 'Draft: make it quieter');
});

test('errors map to one gentle hint, aborts stay silent', () => {
  assert.equal(hintForError('not-allowed'), 'Microphone access is blocked. You can keep typing.');
  assert.equal(hintForError('service-not-allowed'), hintForError('not-allowed'));
  assert.equal(hintForError('no-speech'), "I didn't catch anything. You can keep typing.");
  assert.equal(hintForError('network'), 'Voice needs a connection right now. You can keep typing.');
  assert.equal(hintForError('weird'), DEFAULT_ERROR_HINT);
  assert.equal(hintForError(undefined), DEFAULT_ERROR_HINT);
  assert.equal(isSilentError('aborted'), true);
  assert.equal(isSilentError('network'), false);
});

test('support detection only accepts a real constructor', () => {
  function FakeRecognition() {}
  assert.equal(getRecognitionCtor({ SpeechRecognition: FakeRecognition }), FakeRecognition);
  assert.equal(getRecognitionCtor({ webkitSpeechRecognition: FakeRecognition }), FakeRecognition);
  assert.equal(getRecognitionCtor({}), null);
  assert.equal(getRecognitionCtor(null), null);
  assert.equal(isMicSupported({ webkitSpeechRecognition: FakeRecognition }), true);
  assert.equal(isMicSupported({ webkitSpeechRecognition: {} }), false);
  assert.equal(isMicSupported({}), false);
});
