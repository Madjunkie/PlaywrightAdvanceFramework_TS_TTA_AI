import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '@pages/InventoryPage';

test.describe('POM with Login Page Simple', () => {
    test('Login with valid credns', async ({ page }) => {
            const loginPage = new LoginPage(page);
            const inventoryPage = new InventoryPage(page);
              await loginPage.open();
            await loginPage.loginAs("standard_user","tta_secret");
            await inventoryPage.assertLoaded();
    });


    test('Login with invalid credentials ', async ({ page }) => {
            const loginPage = new LoginPage(page);
            await loginPage.open();
            await loginPage.loginAs("standard_user","tta_secre");
            await expect(page).toHaveTitle("TTACart - Products");
           
    });
});