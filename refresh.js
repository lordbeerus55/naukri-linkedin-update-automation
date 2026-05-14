const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

chromium.use(StealthPlugin());
const fs = require('fs');

const STATE_FILE = 'state.json';

(async () => {

    const browser = await chromium.launch({
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',

        // Important fixes
        '--disable-http2',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-web-security',
        '--ignore-certificate-errors'
    ]
});

    const context = await browser.newContext({
        storageState: fs.existsSync(STATE_FILE)
            ? STATE_FILE
            : undefined,

        viewport: {
            width: 1366,
            height: 768
        },

        userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    // =========================
    // LINKEDIN
    // =========================

    console.log("Opening LinkedIn...");

    await page.goto('https://www.linkedin.com/login');

    // First run manual login
    if (!fs.existsSync(STATE_FILE)) {

        console.log("Please login manually.");

        await page.waitForTimeout(60000);

        await context.storageState({
            path: STATE_FILE
        });

        console.log("Login saved.");
    }

    await page.goto('https://www.linkedin.com/in/me/');

    await page.waitForTimeout(5000);

    try {

        console.log("Opening About edit section...");

        // ABOUT BUTTON XPATH
        const aboutButton = page.locator(
            '//a[@id="navigation-add-edit-deeplink-edit-about"]//div[@class="pvs-navigation__icon"]//*[name()="svg"]'
        );

        await aboutButton.click();

        await page.waitForTimeout(3000);

        console.log("Finding LinkedIn textarea...");

        // ABOUT TEXTAREA XPATH
        const aboutTextarea = page.locator(
            '//textarea[@id="gai-text-form-component-profileEditFormElement-SUMMARY-profile-ACoAAC1KUYEBMFtCaDQ6KRObqYB1nkCciQMHM-M-summary"]'
        );

        let currentText = await aboutTextarea.inputValue();

        console.log("Current LinkedIn About:");
        console.log(currentText);

        //
        // TOGGLE DOT
        //

        if (currentText.endsWith(".")) {

            // Remove last dot
            currentText = currentText.slice(0, -1);

            console.log("LinkedIn dot removed.");

        } else {

            // Add dot
            currentText = currentText + ".";

            console.log("LinkedIn dot added.");
        }

        console.log("Updated LinkedIn About:");
        console.log(currentText);

        await aboutTextarea.fill(currentText);

        await page.waitForTimeout(1000);

        // SAVE BUTTON
        const saveButton = page.locator(
            'button[data-view-name="profile-form-save"]'
        );

        await saveButton.click();

        console.log("LinkedIn About updated.");

    } catch (err) {

        console.log(
            "LinkedIn update failed:",
            err.message
        );

    // }
    // =========================
    // NAUKRI
    // =========================

    console.log("Opening Naukri...");

    await page.goto(
    'https://www.naukri.com/mnjuser/profile',
    {
        waitUntil: 'domcontentloaded',
        timeout: 120000
    }
);
    await page.waitForTimeout(10000);

    console.log("Current URL:", page.url());

    try {
        
        console.log("Opening Naukri Resume Headline...");

        await page.waitForTimeout(5000);
        await page.screenshot({
    path: 'naukri-debug.png',
    fullPage: true
});
        // Edit button
        const addResumeHeadlineButton = page.locator(
            "(//span[@class='edit icon'])[1]"
        ).first();

        await addResumeHeadlineButton.click({
            force: true
        });

        console.log("Clicked edit button");

        await page.waitForTimeout(5000);

        console.log("Finding Naukri textarea...");

        // TEXTAREA
        const naukriTextarea = page.locator(
            '//textarea[@id="resumeHeadlineTxt"]'
        );

        await naukriTextarea.waitFor({
            state: 'visible',
            timeout: 60000
        });

        let naukriText = await naukriTextarea.inputValue();

        console.log("Current Naukri headline:");
        console.log(naukriText);

        //
        // TOGGLE DOT
        //

        if (naukriText.endsWith(".")) {

            // Remove last dot
            naukriText = naukriText.slice(0, -1);

            console.log("Naukri dot removed.");

        } else {

            // Add dot
            naukriText = naukriText + ".";

            console.log("Naukri dot added.");
        }

        console.log("Updated Naukri headline:");
        console.log(naukriText);

        await naukriTextarea.fill(naukriText);

        await page.waitForTimeout(2000);

        // SAVE BUTTON
        const saveBtn = page.locator(
            '//button[normalize-space()="Save"]'
        );

        await saveBtn.waitFor({
            state: 'visible',
            timeout: 60000
        });

        await saveBtn.scrollIntoViewIfNeeded();

        await page.waitForTimeout(1000);

        await saveBtn.click({
            force: true
        });

        console.log("Naukri updated.");

    } catch (err) {

        console.log(
            "Naukri update failed:",
            err.message
        );

    }

    // SAVE SESSION
    await context.storageState({
        path: STATE_FILE
    });

    await browser.close();

})();