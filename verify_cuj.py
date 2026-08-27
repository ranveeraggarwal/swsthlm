from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000")
    page.wait_for_timeout(2000)

    # Try getting the button by text
    subscribe_button = page.get_by_text("Subscribe").first
    subscribe_button.click()
    page.wait_for_timeout(500)

    # Take screenshot of the Subscribe Modal
    page.screenshot(path="/app/subscribe_modal.png")
    page.wait_for_timeout(1000)

    # Close Modal
    page.keyboard.press("Escape")
    page.wait_for_timeout(500)

    add_to_calendar_button = page.locator('button[aria-label="Add to calendar"]').first
    if add_to_calendar_button.is_visible():
        add_to_calendar_button.click()
        page.wait_for_timeout(500)

        # Take screenshot of the Add to calendar Modal
        page.screenshot(path="/app/add_to_calendar_modal.png")
        page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/app/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
