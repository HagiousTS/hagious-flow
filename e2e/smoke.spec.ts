import { expect, test } from '@playwright/test'

test.describe('Smoke pública', () => {
  test('landing renderiza com hero e CTAs', async ({ page }) => {
    await page.goto('/landing')
    await expect(
      page.getByRole('heading', { name: /sistema operacional/i })
    ).toBeVisible()
    await expect(page.getByRole('link', { name: /criar conta/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /entrar/i }).first()).toBeVisible()
  })

  test('raiz redireciona unauth pra landing', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/landing$/)
  })

  test('login renderiza form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/senha/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
  })

  test('signup renderiza form completo', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByLabel(/nome completo/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/senha/i)).toBeVisible()
    await expect(
      page.getByRole('button', { name: /criar conta/i })
    ).toBeVisible()
  })

  test('rota desconhecida vai pra landing (via raiz)', async ({ page }) => {
    await page.goto('/rota-que-nao-existe')
    // App.tsx faz Navigate to "/" pra qualquer rota inválida; raiz redireciona pra /landing.
    await expect(page).toHaveURL(/\/landing$/)
  })
})
