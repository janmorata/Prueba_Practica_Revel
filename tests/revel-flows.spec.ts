import { test, expect } from '@playwright/test';
import { RevelPage } from '../pages/revel.page';
import { Assertions } from '../utils/assertions'

const assertions = new Assertions();

test.describe('REVEL public web', () => {
  test('Flujo A - envia un lead valido desde la ficha de coche', async ({ page }) => {
    const revelPage = new RevelPage(page);
    const timestamp = Date.now();
    const telefono = '6' + Math.floor(10000000 + Math.random() * 90000000);

    await revelPage.gotoCarsGrid();
    await revelPage.acceptCookiesIfVisible();
    await revelPage.openFirstAvailableCarGrid();
    await revelPage.openCarDetail();
    await revelPage.fillLeadData('Test Automation',`test.automation+${timestamp}@driverevel.com`, telefono);
    
    await assertions.waitForURL(page, /\/contratacion/);
    await page.close();  
  });

  test('Flujo A negativo - muestra error con email invalido', async ({ page }) => {
    const revelPage = new RevelPage(page);
    const telefono = '6' + Math.floor(10000000 + Math.random() * 90000000);

    await revelPage.gotoCarsGrid();
    await revelPage.acceptCookiesIfVisible();
    await revelPage.openFirstAvailableCarGrid();
    await revelPage.openCarDetail();
    await revelPage.fillLeadData('Test Automation', 'email-invalido', telefono);
    await revelPage.expectEmailValidationMessage();

    await page.close(); 
  });

  test('Flujo B - aplica un filtro y vuelve al estado inicial', async ({ page }) => {
    const revelPage = new RevelPage(page);

    await revelPage.gotoCarsGrid();
    await revelPage.acceptCookiesIfVisible();
    const initialCarsCount = await revelPage.getVisibleCarsCount();

    await revelPage.applyFirstAvailableFilter();
    await revelPage.expectActiveFilterVisible();

    await revelPage.clearFilters();
    await revelPage.expectFiltersCleared();
    await expect.poll(() => revelPage.getVisibleCarsCount()).toBe(initialCarsCount);

      await page.close(); 
  });
});
