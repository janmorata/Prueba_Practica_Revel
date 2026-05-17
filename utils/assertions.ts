
import { expect, Page } from '@playwright/test';

export class Assertions {
    private readonly defaultTimeout = 10000;

    async inputValue(page: Page, xpath: string, expectedValue: string, timeout = this.defaultTimeout) {
        try {
            const locator = page.locator(`xpath=${xpath}`);
            await expect(locator).toBeVisible({ timeout });
            const currentValue = await locator.inputValue({ timeout });
            expect(currentValue).not.toBe(null);
            expect(currentValue).toBe(expectedValue);
        } catch (ex: any) {
            console.log(`assertion inputValue failure: ${ex.message}`);
            throw ex;
        }

    }

    async isChecked(page: Page, xpath: string, timeout = this.defaultTimeout) {
        try {
            const locator = page.locator(`xpath=${xpath}`);
            await expect(locator).toBeAttached({ timeout });
            const isChecked = await locator.isChecked({ timeout });
            expect(isChecked).toBeTruthy();
        } catch (ex: any) {
            console.log(`assertion isChecked failure: ${ex.message}`);
            throw ex;
        }
    }

    async containsText(page: Page, xpath: string, value: string, timeout = this.defaultTimeout) {
        try {
            const locator = page.locator(`xpath=${xpath}`);
            await expect(locator).toBeVisible({ timeout });
            const textCointained = await locator.inputValue({ timeout });
            expect(textCointained).toContain(value);
        } catch (ex: any) {
            console.log(`assertion containText failure: ${ex.message}`);
            throw ex;
        }
    }

    async newTabContainsTitle(page: Page, url: string | RegExp, value: string, timeout = this.defaultTimeout) {
        const title = await page.title();
        try {
            await expect(page).toHaveURL(url, { timeout });
            expect(title).toContain(value);
        } catch (ex: any) {
            console.log(`assertion newTabContansTitle failure: ${ex.message}`);
            throw ex;
        }
    }

    async toHaveURL(page: Page, url: string | RegExp, timeout = this.defaultTimeout) {
        try {
            await expect(page).toHaveURL(url, { timeout });
        } catch (ex: any) {
            console.log(`assertion toHaveURL failure: ${ex.message}`);
            throw ex;
        }
    }

    async waitForURL(page: Page, url: string | RegExp, timeout = this.defaultTimeout) {
        try {
            await page.waitForURL(url, { timeout });
        } catch (ex: any) {
            console.log(`assertion waitForURL failure: ${ex.message}`);
            throw ex;
        }
    }

    async isVisible(page: Page, xpath: string, timeout = this.defaultTimeout) {
        try {
            await expect(page.locator(`xpath=${xpath}`).first()).toBeVisible({ timeout });
        } catch (ex: any) {
            console.log(`assertion isVisible failure: ${ex.message}`);
            throw ex;
        }
    }

    async toHaveCount(page: Page, xpath: string, count: number, timeout = this.defaultTimeout) {
        try {
            await expect(page.locator(`xpath=${xpath}`)).toHaveCount(count, { timeout });
        } catch (ex: any) {
            console.log(`assertion toHaveCount failure: ${ex.message}`);
            throw ex;
        }
    }
}

