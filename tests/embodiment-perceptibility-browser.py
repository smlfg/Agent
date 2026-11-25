"""AT-07 browser perceptibility smoke for embodied retrieval intents (headless Chrome)."""
from __future__ import annotations

import json
import os
import socket
import sys
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HARNESS = 'tests/embodiment-perceptibility-harness.html'
CHROME_CANDIDATES = (
    '/usr/local/bin/google-chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
)


def pick_chrome() -> str | None:
    for path in CHROME_CANDIDATES:
        if os.path.isfile(path) and os.access(path, os.X_OK):
            return path
    return None


def free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]


def start_static_server(port: int) -> ThreadingHTTPServer:
    handler = type('RepoHandler', (SimpleHTTPRequestHandler,), {'directory': str(ROOT)})
    httpd = ThreadingHTTPServer(('127.0.0.1', port), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def run_with_playwright(url: str, chrome: str) -> dict:
    from playwright.sync_api import sync_playwright

    samples = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=chrome,
            headless=True,
            args=['--no-sandbox', '--disable-dev-shm-usage'],
        )
        page = browser.new_page(viewport={'width': 900, 'height': 700})
        page.goto(url, wait_until='networkidle', timeout=30_000)
        for key in ('searching', 'grounded', 'uncovered'):
            data = page.evaluate(
                '(scenario) => window.__embodimentHarness.applyScenario(scenario)',
                key,
            )
            samples[key] = data
            page.wait_for_timeout(120)
        browser.close()
    return samples


def assert_distinct(samples: dict) -> None:
    keys = ('searching', 'grounded', 'uncovered')
    vectors = []
    for k in keys:
        b = samples[k]['boosts']
        vectors.append(
            (
                k,
                float(b.get('depth') or 0),
                float(b.get('sheen') or 0),
                float(b.get('sweep') or 0),
                float(b.get('haze') or 0),
                samples[k].get('intent'),
            )
        )
    for i in range(len(vectors)):
        for j in range(i + 1, len(vectors)):
            ai = vectors[i]
            aj = vectors[j]
            dist = sum(abs(ai[x] - aj[x]) for x in range(1, 5))
            assert dist > 0.02 or ai[5] != aj[5], (
                f'intents {ai[0]} vs {aj[0]} not perceptibly distinct: {ai} {aj}'
            )


def main() -> int:
    chrome = pick_chrome()
    if not chrome:
        print('SKIP: no Chrome/Chromium binary found for AT-07 browser harness')
        return 0

    port = free_port()
    httpd = start_static_server(port)
    time.sleep(0.2)
    url = f'http://127.0.0.1:{port}/{HARNESS}'

    try:
        try:
            samples = run_with_playwright(url, chrome)
        except ImportError:
            print('SKIP: playwright not installed; node AT-07 profile test still applies')
            return 0
        assert_distinct(samples)
        print('PASS AT-07 browser perceptibility:', json.dumps(samples, indent=2))
        return 0
    finally:
        httpd.shutdown()


if __name__ == '__main__':
    raise SystemExit(main())