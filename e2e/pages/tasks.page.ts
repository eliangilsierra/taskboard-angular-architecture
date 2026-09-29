import { Locator, Page, expect } from '@playwright/test';

export class TasksPage {
  readonly titleInput: Locator;
  readonly addButton: Locator;
  readonly items: Locator;

  constructor(private readonly page: Page) {
    this.titleInput = page.getByLabel('Task title');
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.items = page.locator('.task-list__item');
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'Tasks' })).toBeVisible();
  }

  async add(title: string): Promise<void> {
    await this.titleInput.fill(title);
    await this.addButton.click();
  }

  checkbox(title: string): Locator {
    return this.page.getByRole('checkbox', { name: title });
  }

  async remove(title: string): Promise<void> {
    await this.page.getByRole('button', { name: `Remove ${title}` }).click();
  }

  async expectRemaining(count: number): Promise<void> {
    await expect(this.page.getByText(`${count} remaining`)).toBeVisible();
  }
}
