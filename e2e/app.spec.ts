import { test, expect } from '@playwright/test';

test('homepage has title and get started link', async ({ page }) => {
  // Navega a la página principal
  await page.goto('/');

  // Verifica que el título contiene "TecAway"
  await expect(page).toHaveTitle(/TecAway/);

  // Verifica que hay elementos básicos de la página
  // Aquí puedes agregar más verificaciones específicas para tu app
  await expect(page.locator('app-header')).toBeVisible();
});

test('navigation works correctly', async ({ page }) => {
  await page.goto('/');
  
  // Ejemplo: verificar que la navegación funciona
  // Modifica estos selectores según tu aplicación
  await expect(page.locator('body')).toBeVisible();
});
