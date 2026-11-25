"""Local desktop, mobile, reduced-motion, and pause-motion smoke for the 2.5D surface."""
from playwright.sync_api import sync_playwright

DEFAULT_URL = 'http://127.0.0.1:5173/living-surface.html'
BONES_URL = 'http://127.0.0.1:5173/living-surface.html?pose=midi-safran-kobalt'


def parse_first_duration_s(css_val):
    first = css_val.split(',')[0].strip()
    if first.endswith('ms'):
        return float(first[:-2]) / 1000.0
    if first.endswith('s'):
        return float(first[:-1])
    return 0.0


def parse_last_duration_s(css_val):
    last = css_val.split(',')[-1].strip()
    if last.endswith('ms'):
        return float(last[:-2]) / 1000.0
    if last.endswith('s'):
        return float(last[:-1])
    return 0.0


def inspect_state(page):
    return page.evaluate("""() => {
      const html = document.documentElement;
      const eye = document.querySelector('.presence .eye');
      const stage = document.getElementById('stage');
      const pair = document.querySelector('.pair');
      const catchlight = document.querySelector('.left-eye .eye-catchlight--main');
      const pupilCore = document.querySelector('.left-eye .pupil .pupil-core');
      const hs = getComputedStyle(html);
      return {
        depth: hs.getPropertyValue('--depth-intensity').trim(),
        lightX: hs.getPropertyValue('--depth-light-x').trim(),
        lightY: hs.getPropertyValue('--depth-light-y').trim(),
        lagFar: hs.getPropertyValue('--scene-lag-far').trim(),
        lagMid: hs.getPropertyValue('--scene-lag-mid').trim(),
        lagNear: hs.getPropertyValue('--scene-lag-near').trim(),
        scenePx: hs.getPropertyValue('--scene-px').trim(),
        shadow: getComputedStyle(eye).boxShadow,
        stageFilter: getComputedStyle(stage).filter,
        far: getComputedStyle(document.body, '::before').translate,
        farDur: getComputedStyle(document.body, '::before').transitionDuration,
        mid: getComputedStyle(document.querySelector('.stage'), '::before').translate,
        eyeDur: getComputedStyle(eye).transitionDuration,
        near: getComputedStyle(pair).translate,
        nearDur: getComputedStyle(pair).transitionDuration,
        catchlight: getComputedStyle(catchlight).translate,
        pupilCore: getComputedStyle(pupilCore).translate,
      };
    }""")


def check_page(page, url, label, move_mouse=True):
    page_errors = []
    console_errors = []
    failed_urls = []
    page.on('pageerror', lambda err: page_errors.append(str(err)))
    page.on(
        'response',
        lambda res: failed_urls.append(f'{res.status} {res.url}')
        if res.status >= 400 and not res.url.endswith('/favicon.ico')
        else None,
    )
    page.on(
        'console',
        lambda msg: console_errors.append(msg.text)
        if msg.type == 'error' and 'status of 404' not in msg.text
        else None,
    )

    page.goto(url, wait_until='networkidle')
    page.locator('#composer-input').fill('Hello')
    page.get_by_role('button', name='Send').click()
    page.locator('#pair .pair-entry').wait_for()
    page.locator('#pair .pair-answer[aria-busy="false"]').wait_for()
    assert page.locator('#pair .pair-answer').inner_text().strip(), f'{label}: empty answer'

    if move_mouse:
        page.mouse.move(1200, 480)
        page.wait_for_timeout(550)

    assert not page_errors, f'{label} pageerrors: {page_errors}'
    assert not failed_urls, f'{label} failed responses: {failed_urls}'
    assert not console_errors, f'{label} console errors: {console_errors}'
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2'), f'{label}: horizontal overflow'
    return inspect_state(page)


def launch_browser(playwright):
    try:
        return playwright.chromium.launch(headless=True)
    except Exception:
        return playwright.chromium.launch(channel='chrome', headless=True)


with sync_playwright() as playwright:
    browser = launch_browser(playwright)

    # 1. Default landing surface (no ?pose=)
    desktop = browser.new_page(viewport={'width': 1440, 'height': 900})
    res = check_page(desktop, DEFAULT_URL, 'desktop-default', move_mouse=True)
    assert res['depth'] and res['lightX'] and res['lightY'], res
    assert res['lagFar'] and res['lagMid'] and res['lagNear'], res
    assert res['shadow'].count('rgba') >= 3, res
    assert res['stageFilter'] == 'none', res
    assert res['far'] != 'none' and res['near'] != 'none', res
    assert res['catchlight'] != 'none' and res['pupilCore'] != 'none', res
    assert res['scenePx'], res
    far_s = parse_first_duration_s(res['farDur'])
    mid_s = parse_last_duration_s(res['eyeDur'])
    near_s = parse_first_duration_s(res['nearDur'])
    assert far_s > mid_s > near_s > 0, (far_s, mid_s, near_s)

    # Verify Pause motion zeros --scene-px and disables parallax
    desktop.locator('#motion-toggle').click()
    desktop.wait_for_timeout(150)
    paused = inspect_state(desktop)
    assert paused['scenePx'] == '0px', paused
    assert paused['far'] == 'none' and paused['near'] == 'none', paused
    assert paused['catchlight'] == 'none' and paused['pupilCore'] == 'none', paused
    print('ok desktop-default:', res)

    # 2. Curated bones world (?pose=midi-safran-kobalt)
    bones_page = browser.new_page(viewport={'width': 1440, 'height': 900})
    bones_res = check_page(bones_page, BONES_URL, 'desktop-bones', move_mouse=True)
    assert bones_res['stageFilter'] == 'none', bones_res
    assert bones_res['shadow'].count('rgba') >= 3, bones_res
    assert bones_res['far'] != 'none' and bones_res['near'] != 'none', bones_res
    assert bones_res['catchlight'] != 'none' and bones_res['pupilCore'] != 'none', bones_res
    print('ok desktop-bones:', bones_res)

    # 3. Mobile (390x844) on default surface
    mobile = browser.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    mob_res = check_page(mobile, DEFAULT_URL, 'mobile-default', move_mouse=False)
    assert mob_res['far'] == 'none' and mob_res['near'] == 'none', mob_res
    assert mob_res['shadow'].count('rgba') >= 3, mob_res
    print('ok mobile-default:', mob_res)

    # 4. Reduced motion on default surface (keeps static directional shadow, disables parallax)
    reduced = browser.new_page(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce')
    red_res = check_page(reduced, DEFAULT_URL, 'reduced-motion-default', move_mouse=True)
    assert red_res['far'] == 'none' and red_res['near'] == 'none', red_res
    assert red_res['catchlight'] == 'none' and red_res['pupilCore'] == 'none', red_res
    assert red_res['shadow'].count('rgba') >= 3, red_res
    print('ok reduced-motion-default:', red_res)

    browser.close()
