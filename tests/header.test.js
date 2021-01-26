jest.setTimeout(30000);
const puppeteer = require("puppeteer");

// Test Example 
test("Adds 2 nums", () => {
    const sum = 1 + 2;
    expect(sum).toEqual(3)
});

test("We can launch a browser", async () => {
    const browser = await puppeteer.launch({
        headless:false
    });
    const page = await browser.newPage();
    await page.goto('localhost:3000');

    const text = await page.$eval("a.brand-logo", el => el.innerHTML);

    expect(text).toEqual("Blogster");
})
