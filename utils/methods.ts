import { Frame, Page, test } from '@playwright/test';

// MARK: Fichero donde establecemos nuestros métodos personalizados que modifican/amplian los básicos de Playwright
const DEFAULT_TIMEOUT = 10000;

export async function sendKeys(page: Page, xpath: string, text: string, timeout = DEFAULT_TIMEOUT): Promise<void> {
  await test.step(`Enviar texto "${text}" en el elemento con XPath: ${xpath}`, async () => {
    try {
      const locator = page.locator(`xpath=${xpath}`);
      await locator.waitFor({ state: 'visible', timeout });
      await locator.fill(text, { timeout });
    } catch (ex: any) {
      console.log(`An error occurred while filling the element: ${ex.message}`);
      throw ex;
    }
  });
}

export async function click(page: Page, xpath: string, timeout = DEFAULT_TIMEOUT): Promise<void> {
  await test.step(`Hacer click en el elemento con XPath: ${xpath}`, async () => {
    try {
      const locator = page.locator(`xpath=${xpath}`);
      await locator.waitFor({ state: 'visible', timeout });
      await locator.click({ timeout });
    } catch (ex: any) {
      console.log(`An error occurred during click: ${ex.message}`);
      throw ex;
    }
  });
}

export async function clickElementCovered(page: Page, xpath: string, timeout = DEFAULT_TIMEOUT): Promise<void> {
  await test.step(`Hacer click forzado en el elemento con XPath: ${xpath}`, async () => {
    try {
      const locator = page.locator(`xpath=${xpath}`);
      await locator.waitFor({ state: 'attached', timeout });
      await locator.click({ force: true, timeout });
    } catch (ex: any) {
      console.log(`An error occurred during ClickCovered: ${ex.message}`);
      throw ex;
    }
  });
}

export async function scrollToElement(page: Page, xpath: string, timeout = DEFAULT_TIMEOUT): Promise<void> {
  await test.step(`Hacer scroll hasta el elemento con XPath: ${xpath}`, async () => {
    try {
      const locator = page.locator(`xpath=${xpath}`);
      await locator.waitFor({ state: 'attached', timeout });
      await locator.scrollIntoViewIfNeeded({ timeout });
    } catch (ex: any) {
      console.log(`An error occurred during ScrollToElement: ${ex.message}`);
      throw ex;
    }
  });
}

export async function selectDropdown(page: Page, xpath: string, visibleText: string, timeout = DEFAULT_TIMEOUT): Promise<void> {
  await test.step(`Seleccionar la opción "${visibleText}" en el dropdown con XPath: ${xpath}`, async () => {
    try {
      const dropdown = page.locator(`xpath=${xpath}`);
      await dropdown.waitFor({ state: 'visible', timeout });
      await dropdown.click({ timeout });
      await page.locator('div.css-1n7v3ny-option', { hasText: visibleText }).click({ timeout });
    } catch (ex: any) {
      console.log(`An error occurred during SelectDropdown: ${ex.message}`);
      throw ex;
    }
  });
}

export async function selectRadioButton(page: Page, selector: string, isXPath = false, timeout = DEFAULT_TIMEOUT): Promise<void> {
  await test.step(`Seleccionar radio button usando ${isXPath ? 'XPath' : 'CSS'}: ${selector}`, async () => {
    try {
      const locator = isXPath ? page.locator(`xpath=${selector}`) : page.locator(selector);
      await locator.waitFor({ state: 'attached', timeout });
      const script = isXPath
        ? `
          const el = document.evaluate("${selector}", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          if (el) {
            el.checked = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        `
        : `
          const el = document.querySelector("${selector}");
          if (el) {
            el.checked = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        `;
      await page.evaluate(script);
    } catch (ex: any) {
      console.log(`Error selecting radio button: ${ex.message}`);
      throw ex;
    }
  });
}

export async function pressEnter(page: Page, timeout = DEFAULT_TIMEOUT): Promise<void> {
  await test.step('Presionar tecla Enter', async () => {
    try {
      await page.keyboard.press('Enter', { delay: 0 });
      await page.waitForLoadState('domcontentloaded', { timeout }).catch(() => undefined);
    } catch (ex: any) {
      console.log(`Error pressing Enter: ${ex.message}`);
      throw ex;
    }
  });
}

export async function pressEsc(page: Page, timeout = DEFAULT_TIMEOUT): Promise<void> {
  await test.step('Presionar tecla Escape', async () => {
    try {
      await page.keyboard.press('Escape', { delay: 0 });
      await page.waitForLoadState('domcontentloaded', { timeout }).catch(() => undefined);
    } catch (ex: any) {
      console.log(`Error pressing Escape: ${ex.message}`);
      throw ex;
    }
  });
}

export async function switchToIframe(page: Page, xpath: string, timeout = DEFAULT_TIMEOUT): Promise<Frame> {
  return await test.step(`Cambiar al iframe con XPath: ${xpath}`, async () => {
    try {
      const iframeElement = await page.waitForSelector(`xpath=${xpath}`, { timeout });
      const frame = await iframeElement.contentFrame();

      if (!frame) {
        throw new Error(`No se pudo obtener el contenido del iframe con XPath: ${xpath}`);
      }

      return frame;
    } catch (error) {
      throw new Error(`Error al cambiar al iframe con XPath ${xpath}: ${String(error)}`);
    }
  });
}
