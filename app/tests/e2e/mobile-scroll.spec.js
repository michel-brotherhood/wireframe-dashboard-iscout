import { test, expect, devices } from "@playwright/test";

// Regressão para o bug real reportado por um usuário num Android/Chrome:
// arrastar o dedo horizontalmente na tela fazia a PÁGINA INTEIRA deslizar
// (não só uma tabela rolável), cortando conteúdo à esquerda.
//
// Por que este arquivo usa gestos de toque via CDP em vez de
// `document.documentElement.scrollWidth`/`window.scrollTo`: uma auditoria
// anterior nesta sessão usou só essas checagens programáticas, não pegou o
// bug e concluiu (incorretamente) que não havia problema real. Scroll
// programático e `scrollWidth` não reproduzem o "scroll chaining" que o
// Chrome mobile faz a partir de um gesto de arraste por toque real — por
// isso a checagem aqui dispara touchstart/touchmove/touchend de verdade via
// CDP (`Input.dispatchTouchEvent`), o único jeito de simular o gesto real.

// O app exige login (gate de sessão). Autentica como treinador (João Silva),
// que tem acesso ao Dashboard e ao Editor de Súmula, antes de navegar.
async function loginAs(context, userId = "u-joao") {
  await context.addInitScript((id) => {
    try {
      localStorage.setItem("iscout.sessionUserId", id);
    } catch {
      /* ignore */
    }
  }, userId);
}

const MOBILE_ROUTES = [
  { path: "/", heading: "Minhas aulas e planos" },
  { path: "/sumulas/novo", heading: "Criar Súmula" },
];

const MOBILE_WIDTHS = [320, 375, 390];

async function swipeHorizontal(client, fromX, y, toX) {
  const steps = 10;
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: fromX, y }] });
  for (let i = 1; i <= steps; i++) {
    const x = fromX + ((toX - fromX) * i) / steps;
    await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
    await new Promise((r) => setTimeout(r, 16));
  }
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

for (const { path, heading } of MOBILE_ROUTES) {
  for (const width of MOBILE_WIDTHS) {
    test(`${path} @ ${width}px — arrastar horizontalmente não move a página`, async ({ browser }) => {
      const context = await browser.newContext({
        ...devices["Pixel 7"],
        viewport: { width, height: 800 },
      });
      await loginAs(context);
      const page = await context.newPage();
      await page.goto(path);
      await expect(page.locator("h1")).toContainText(heading);

      const headerBefore = await page.locator("h1").boundingBox();
      expect(headerBefore).not.toBeNull();

      const client = await context.newCDPSession(page);
      // Arrasta da direita pra esquerda (dedo se move da direita pra
      // esquerda => conteúdo tenderia a "ir" pra direita, expondo a borda
      // esquerda cortada — foi exatamente o sintoma do print do usuário).
      await swipeHorizontal(client, width - 20, 400, 20);
      await page.waitForTimeout(300); // deixa qualquer rubber-band assentar antes de medir

      const scrollX = await page.evaluate(() => window.scrollX);
      const scrollLeftDoc = await page.evaluate(() => document.documentElement.scrollLeft);
      expect(scrollX, "window.scrollX não pode se mover — página inteira não pode ser arrastável").toBe(0);
      expect(scrollLeftDoc, "documentElement.scrollLeft não pode se mover").toBe(0);

      const headerAfter = await page.locator("h1").boundingBox();
      expect(headerAfter).not.toBeNull();
      // Elemento de referência fixo (título) não pode ter se deslocado horizontalmente.
      expect(Math.abs((headerAfter?.x ?? 0) - (headerBefore?.x ?? 0))).toBeLessThanOrEqual(1);

      // Sinal secundário apenas — NUNCA usar isto sozinho como critério: foi
      // exatamente o que deu falso-negativo na auditoria anterior.
      const docScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(docScrollWidth).toBeLessThanOrEqual(width + 1);

      await context.close();
    });

    test(`${path} @ ${width}px — scroll vertical continua funcionando`, async ({ browser }) => {
      const context = await browser.newContext({ ...devices["Pixel 7"], viewport: { width, height: 700 } });
      await loginAs(context);
      const page = await context.newPage();
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();

      const client = await context.newCDPSession(page);
      await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: width / 2, y: 600 }] });
      for (let i = 1; i <= 10; i++) {
        await client.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: width / 2, y: 600 - i * 30 }],
        });
        await new Promise((r) => setTimeout(r, 16));
      }
      await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForTimeout(300);

      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY, "arraste vertical deve continuar rolando a página normalmente").toBeGreaterThan(0);

      await context.close();
    });
  }
}

test("Dashboard @ 375px — cards mobile visíveis, tabela escondida", async ({ browser }) => {
  const context = await browser.newContext({ ...devices["Pixel 7"], viewport: { width: 375, height: 900 } });
  await loginAs(context);
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();

  const cards = page.locator('[data-testid="treino-card"]');
  await expect(cards.first()).toBeVisible();
  const cardCount = await cards.count();
  expect(cardCount).toBeGreaterThan(0);

  const table = page.locator("table").first();
  await expect(table).toBeHidden();

  await context.close();
});

test("Súmula @ 375px — cards de atleta visíveis, tabela escondida", async ({ browser }) => {
  const context = await browser.newContext({ ...devices["Pixel 7"], viewport: { width: 375, height: 900 } });
  await loginAs(context);
  const page = await context.newPage();
  await page.goto("/sumulas/novo");
  await expect(page.locator("h1")).toBeVisible();

  const cards = page.locator('[data-testid="atleta-card"]');
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBe(11); // roster inicial da súmula tem 11 atletas

  await expect(page.locator("table")).toBeHidden();

  await context.close();
});

test("Dashboard @ 1024px — tabela visível, cards mobile escondidos, scroll interno funciona sem vazar pra página", async ({
  browser,
}) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: false, viewport: { width: 1024, height: 800 } });
  await loginAs(context);
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();

  const mobileCards = page.locator('[data-testid="treino-card"]');
  await expect(mobileCards.first()).toBeHidden();

  const wrapper = page.locator("table").first().locator("..");
  await expect(wrapper).toBeVisible();

  const headerBefore = await page.locator("h1").boundingBox();
  const client = await context.newCDPSession(page);
  const box = await wrapper.boundingBox();
  await swipeHorizontal(client, box.x + box.width - 10, box.y + box.height / 2, box.x + 10);
  await page.waitForTimeout(300);

  const scrollX = await page.evaluate(() => window.scrollX);
  expect(scrollX, "scroll interno da tabela não pode vazar pra página").toBe(0);

  const headerAfter = await page.locator("h1").boundingBox();
  expect(Math.abs((headerAfter?.x ?? 0) - (headerBefore?.x ?? 0))).toBeLessThanOrEqual(1);

  await context.close();
});
