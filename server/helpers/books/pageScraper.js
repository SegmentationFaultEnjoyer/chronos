const scraperObject = {
    url: 'https://bookoftheday.org/',
    async scraper(browser){
        let page = await browser.newPage();
		console.log(`Navigating to ${this.url}...`);
		// Navigate to the selected page
		await page.goto(this.url);
		// Wait for the required DOM to be rendered
		await page.waitForSelector('#wrap');
		//Get the link to all the required books
		let urls = await page.$$eval('#front_left ol > li', links => {
			// // Make sure the book to be scraped is in stock
			// links = links.filter(link => link.querySelector('.instock.availability > i').textContent !== "In stock")
			// // Extract the links from the data
			// links = links.map(el => el.querySelector('h3 > a').href)
			return links;
		});
		console.log(urls);
    }
}

module.exports = scraperObject;