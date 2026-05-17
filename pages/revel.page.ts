import { Page } from '@playwright/test';
import { Locators } from '../utils/locators';
import { Assertions } from '../utils/assertions';
import * as methods from '../utils/methods';

export class RevelPage {

  private readonly assertions = new Assertions();
  constructor(private readonly page: Page) {}

  async gotoCarsGrid(): Promise<void> {
    await this.page.goto(Locators.revelCarsPath);
    await this.assertions.isVisible(this.page, Locators.cookiesRevelDialog);
  }

  async acceptCookiesIfVisible(): Promise<void> {
    await methods.click(this.page, Locators.cookiesRevelAcceptButton);
    await this.assertions.toHaveURL(this.page, Locators.urlRevel + Locators.revelCarsPath);
  }

  async openFirstAvailableCarGrid(): Promise<void> {
    await methods.click(this.page, `(${Locators.revelCarCards})[1]`);
    await this.assertions.toHaveURL(this.page, /\/coches\/.+/);
  }

  async openCarDetail(): Promise<void> {
    await this.assertions.isVisible(this.page, Locators.carDetail);
    await methods.scrollToElement(this.page, Locators.carDetail);
    await methods.click(this.page, Locators.carDetail);
    await this.assertions.isVisible(this.page, Locators.carDetailOpened);
    await methods.click(this.page, `(${Locators.nextButton})[1]`);
  }

  async fillLeadData(name: string, email: string, phone: string): Promise<void> {
    await this.assertions.isVisible(this.page, Locators.fillAssertion);
    await methods.sendKeys(this.page, Locators.revelLeadNameInput, name);
    await methods.sendKeys(this.page, Locators.revelLeadEmailInput, email);
    await methods.sendKeys(this.page, Locators.revelLeadPhoneInput, phone);
    await methods.click(this.page, Locators.revelLeadCheckbox);
    await this.assertions.isChecked(this.page, Locators.revelLeadCheckbox);
    await methods.click(this.page, Locators.revelLeadSubmitButton);
  }

  async expectEmailValidationMessage(): Promise<void> {
    await this.assertions.isVisible(this.page, Locators.revelEmailValidationMessage);
  }

  async getVisibleCarsCount(): Promise<number> {
    await this.assertions.isVisible(this.page, Locators.revelCarCards);
    return this.page.locator(`xpath=${Locators.revelCarCards}`).count();
  }

  async applyFirstAvailableFilter(): Promise<void> {
    await this.assertions.isVisible(this.page, Locators.revelFilterOption);
    await methods.click(this.page, Locators.revelFilterOption);
  }

  async expectActiveFilterVisible(): Promise<void> {
    await this.assertions.isVisible(this.page, Locators.revelActiveFilters);
  }

  async clearFilters(): Promise<void> {
    await this.assertions.isVisible(this.page, Locators.revelClearFiltersButton);
    await methods.click(this.page, Locators.revelClearFiltersButton);
  }

  async expectFiltersCleared(): Promise<void> {
    await this.assertions.toHaveCount(this.page, Locators.revelActiveFilters, 0);
  }
}
