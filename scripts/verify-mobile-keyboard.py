#!/usr/bin/env python3
"""Mobile keyboard verification — the "test bevor push" for the eyes fix.

Loads src/living-surface.html in an emulated phone (390x844, touch), focuses
the composer and opens a simulated keyboard band via the debug handle
(window.__agentfaehig.keyboard.apply), which writes exactly the
--keyboard-inset / data-keyboard state the live visualViewport path writes.
Then it proves: eyes fully visible above the keyboard band, composer usable
inside the band, stage compressed, motion toggle lifted, and everything
restored after reset().

Run:  "python3 scripts/verify-mobile-keyboard.py"  (needs `playwright` on
import; the pipx doctolib-cli venv has it and the matching browser cache:
  "~/Library/Application Support/pipx/venvs/doctolib-cli/bin/python"
      scripts/verify-mobile-keyboard.py )
Evidence: tech/mobile-keyboard-verify/*.png + assertions on stdout.
"""

from __future__ import annotations

import functools
import http.server
import json
import os
import threading
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tech" / "mobile-keyboard-verify"
PORT = 5199
URL = f"http://127.0.0.1:{PORT}/living-surface.html"
KEYBOARD_PX = 300  # typical phone keyboard over an 844px viewport
VISIBLE_PX = 844 - KEYBOARD_PX  # visible band: [0, 544]
TOLERANCE = 3

failures = 0


def check(name: str, ok: bool, detail: str = "") -> None:
    global failures
    status = "ok" if ok else "FAIL"
    suffix = f" ({detail})" if detail else ""
    print(f"{status} — {name}{suffix}")
    if not ok:
        failures += 1


class NoStoreHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def serve() -> http.server.ThreadingHTTPServer:
    handler = functools.partial(NoStoreHandler, directory=str(ROOT / "src"))
    return http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler)


def draw_keyboard_band(page) -> None:
    """Clearly labelled synthetic keyboard band for the screenshots."""
    page.evaluate(
        """(px) => {
            const band = document.createElement('div');
            band.id = 'simulated-keyboard';
            band.style.cssText =
                `position:fixed;left:0;right:0;bottom:0;height:${px}px;z-index:9999;` +
                'background:repeating-linear-gradient(45deg,#2b241e 0 14px,#3a312a 14px 28px);' +
                'color:#f6f1e9;display:flex;align-items:center;justify-content:center;' +
                'font:600 13px/1 sans-serif;letter-spacing:.08em;';
            band.textContent = 'SIMULATED KEYBOARD · ' + px + 'px';
            document.body.appendChild(band);
        }""",
        KEYBOARD_PX,
    )


def main() -> int:
    SHOTS.mkdir(parents=True, exist_ok=True)
    server = serve()
    threading.Thread(target=server.serve_forever, daemon=True).start()

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            context = browser.new_context(
                viewport={"width": 390, "height": 844},
                is_mobile=True,
                has_touch=True,
                device_scale_factor=2,
            )
            page = context.new_page()
            page_errors: list[str] = []
            page.on("pageerror", lambda err: page_errors.append(str(err)))
            page.goto(URL, wait_until="networkidle")
            time.sleep(1.0)  # let presence/engine init and the eyes wake up

            # 1. Viewport meta asks Chromium to resize the layout viewport.
            meta = page.get_attribute('meta[name="viewport"]', "content") or ""
            check(
                "viewport meta contains interactive-widget=resizes-content",
                "interactive-widget=resizes-content" in meta,
                meta,
            )

            # 2. Baseline: eyes fully visible on the full screen.
            eyes = page.locator("#presence .eyes-container").bounding_box()
            ok = eyes and eyes["y"] >= 0 and eyes["y"] + eyes["height"] <= 844 + TOLERANCE
            check(
                "baseline: eyes visible in full viewport",
                bool(ok),
                f"y={eyes['y']:.0f} h={eyes['height']:.0f}" if eyes else "no box",
            )
            page.screenshot(path=str(SHOTS / "1-baseline-full-viewport.png"))

            # 3. Focus the composer like a real visitor, then open the band.
            # (Focus triggers a real visualViewport pass first; the simulated
            # inset is applied after it settles, like a keyboard appearing.)
            page.tap("#composer-input")
            time.sleep(0.25)  # let the focusin update run and close again
            page.evaluate("(px) => window.__agentfaehig.keyboard.apply(px)", KEYBOARD_PX)
            draw_keyboard_band(page)
            time.sleep(0.3)  # grid settles

            state = page.evaluate(
                """() => ({
                    keyboardAttr: document.documentElement.dataset.keyboard ?? null,
                    keyboardVar: getComputedStyle(document.documentElement)
                        .getPropertyValue('--keyboard-inset').trim(),
                    stageHeight: document.getElementById('stage')
                        .getBoundingClientRect().height,
                })"""
            )
            check(
                'data-keyboard="open" on <html>',
                state["keyboardAttr"] == "open",
                json.dumps(state["keyboardAttr"]),
            )
            check(
                "--keyboard-inset written (300px)",
                state["keyboardVar"] == "300px",
                state["keyboardVar"],
            )
            check(
                f"stage compressed to ~{VISIBLE_PX}px",
                abs(state["stageHeight"] - VISIBLE_PX) <= TOLERANCE,
                f"stage={state['stageHeight']:.0f}px",
            )

            # 4. The actual bug report: are the eyes still visible?
            eyes = page.locator("#presence .eyes-container").bounding_box()
            ok = eyes and eyes["y"] >= -TOLERANCE and eyes["y"] + eyes["height"] <= VISIBLE_PX + TOLERANCE
            check(
                f"eyes fully visible above the {KEYBOARD_PX}px keyboard band",
                bool(ok),
                f"eyes span [{eyes['y']:.0f}, {eyes['y'] + eyes['height']:.0f}]"
                f" of visible [0, {VISIBLE_PX}]" if eyes else "no box",
            )

            eye_boxes = [
                page.locator("#left-eye").bounding_box(),
                page.locator("#right-eye").bounding_box(),
            ]
            ok = all(
                b and b["y"] >= -TOLERANCE and b["y"] + b["height"] <= VISIBLE_PX + TOLERANCE
                for b in eye_boxes
            )
            bottoms = ", ".join(f"{b['y'] + b['height']:.0f}" for b in eye_boxes if b)
            check("both eyes inside the visible band", bool(ok), f"bottoms={bottoms}")

            # 5. The composer must stay usable inside the band too.
            inp = page.locator("#composer-input").bounding_box()
            ok = inp and inp["y"] + inp["height"] <= VISIBLE_PX + TOLERANCE
            check(
                "composer input visible above the keyboard",
                bool(ok),
                f"input bottom={inp['y'] + inp['height']:.0f}" if inp else "no box",
            )

            toggle = page.locator("#motion-toggle").bounding_box()
            ok = toggle and toggle["y"] + toggle["height"] <= VISIBLE_PX + TOLERANCE
            check(
                "motion toggle lifted above the keyboard",
                bool(ok),
                f"toggle bottom={toggle['y'] + toggle['height']:.0f}" if toggle else "no box",
            )

            page.screenshot(path=str(SHOTS / "2-keyboard-open-eyes-visible.png"))

            # 6. Reset restores the resting layout.
            page.evaluate("() => document.getElementById('simulated-keyboard')?.remove()")
            page.evaluate("() => window.__agentfaehig.keyboard.reset()")
            time.sleep(0.3)
            after = page.evaluate(
                """() => ({
                    keyboardAttr: document.documentElement.dataset.keyboard ?? null,
                    stageHeight: document.getElementById('stage')
                        .getBoundingClientRect().height,
                })"""
            )
            check("reset clears the keyboard state", after["keyboardAttr"] is None, json.dumps(after["keyboardAttr"]))
            check(
                "stage back to full height",
                abs(after["stageHeight"] - 844) <= TOLERANCE,
                f"stage={after['stageHeight']:.0f}px",
            )
            page.screenshot(path=str(SHOTS / "3-after-reset.png"))

            check("no page errors during the run", not page_errors, " | ".join(page_errors))

            browser.close()
    finally:
        server.shutdown()

    if failures == 0:
        print(f"\nPASS: eyes stay visible with the keyboard open — evidence in {SHOTS.relative_to(ROOT)}/")
        return 0
    print(f"\nFAIL: {failures} check(s) failed")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
