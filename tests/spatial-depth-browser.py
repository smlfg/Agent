"""Local desktop, mobile, and reduced-motion smoke for the 2.5D surface."""
from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:5173/living-surface.html?pose=midi-safran-kobalt'


def check(page, label):
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(URL, wait_until='networkidle')
    page.locator('#composer-input').fill('Hello')
    page.get_by_role('button', name='Send').click()
    page.locator('#pair .pair-entry').wait_for()
    page.locator('#pair .pair-answer[aria-busy="false"]').wait_for()
    assert page.locator('#pair .pair-answer').inner_text().strip(), label
    assert not errors, f'{label}: {errors}'
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2'), label
    return page.evaluate("""() => {
      const html = document.documentElement;
      const eye = document.querySelector('.presence .eye');
      return {
        depth: getComputedStyle(html).getPropertyValue('--depth-intensity').trim(),
        shadow: getComputedStyle(eye).boxShadow,
        light: getComputedStyle(html).getPropertyValue('--depth-light-x').trim(),
        far: getComputedStyle(document.body, '::before').translate,
        near: getComputedStyle(document.querySelector('.pair')).translate,
      };
    }""")


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    desktop = browser.new_page(viewport={'width': 1440, 'height': 900})
    result = check(desktop, 'desktop')
    assert result['depth'] and result['light'] and result['shadow'].count('rgba') >= 3, result
    assert result['far'] != 'none' and result['near'] != 'none', result
    desktop.mouse.move(1200, 500)
    desktop.wait_for_timeout(500)
    assert desktop.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--scene-px').trim()")
    print('ok desktop:', result)

    mobile = browser.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    result = check(mobile, 'mobile')
    assert result['far'] == 'none' and result['near'] == 'none', result
    print('ok mobile:', result)

    reduced = browser.new_page(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce')
    result = check(reduced, 'reduced motion')
    assert result['far'] == 'none' and result['near'] == 'none', result
    print('ok reduced motion:', result)
    browser.close()
