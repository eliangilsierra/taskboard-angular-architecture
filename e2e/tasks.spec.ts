import { expect, test } from '@playwright/test';
import { TasksPage } from './pages/tasks.page';

test.describe('task board', () => {
  let tasks: TasksPage;

  test.beforeEach(async ({ page }) => {
    tasks = new TasksPage(page);
    await tasks.open();
  });

  test('starts empty and does not allow adding a blank task', async () => {
    await expect(tasks.items).toHaveCount(0);
    await expect(tasks.addButton).toBeDisabled();

    await tasks.titleInput.fill('   ');
    await expect(tasks.addButton).toBeDisabled();
  });

  test('adds a task, trims it and clears the form', async () => {
    await tasks.add('  buy milk  ');

    await expect(tasks.items).toHaveCount(1);
    await expect(tasks.items.first()).toHaveText(/^\s*buy milk\s*Remove\s*$/);
    await expect(tasks.titleInput).toHaveValue('');
    await tasks.expectRemaining(1);
  });

  test('submits with the Enter key', async () => {
    await tasks.titleInput.fill('walk the dog');
    await tasks.titleInput.press('Enter');

    await expect(tasks.items).toHaveCount(1);
  });

  test('completes and reopens a task', async () => {
    await tasks.add('buy milk');
    await tasks.add('buy bread');
    await tasks.expectRemaining(2);

    await tasks.checkbox('buy milk').check();
    await tasks.expectRemaining(1);
    await expect(tasks.items.first()).toHaveClass(/task-list__item--done/);

    await tasks.checkbox('buy milk').uncheck();
    await tasks.expectRemaining(2);
    await expect(tasks.items.first()).not.toHaveClass(/task-list__item--done/);
  });

  test('removes only the chosen task', async () => {
    await tasks.add('buy milk');
    await tasks.add('buy bread');

    await tasks.remove('buy milk');

    await expect(tasks.items).toHaveCount(1);
    await expect(tasks.items.first()).toContainText('buy bread');
    await tasks.expectRemaining(1);
  });

  test('keeps titles within the maximum length', async () => {
    await tasks.titleInput.pressSequentially('a'.repeat(130));

    await expect(tasks.titleInput).toHaveValue('a'.repeat(120));
  });
});

test.describe('routing', () => {
  test('redirects the root to the tasks page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/tasks$/);
  });

  test('serves a deep link to a client-side route', async ({ page }) => {
    const response = await page.goto('/tasks');

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();
  });
});
