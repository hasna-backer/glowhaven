const puppeteer = require('puppeteer');
const dotenv = require('dotenv');

dotenv.config();

const openBrowser = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
            width: 1440,
            height: 900
        },
    });

    const page = await browser.newPage();

    await page.goto(`http://localhost:4011`);

    const userNameInput = await page.waitForSelector('#your_name');
    await userNameInput.type('hasnaashik3@gmail.com');

    const passwordInput = await page.waitForSelector('#your_pass');
    await passwordInput.type('12345678');

    const loginBtn = await page.waitForSelector('#signin');
    await loginBtn.click();
};



openBrowser();


module.exports = { openBrowser };
