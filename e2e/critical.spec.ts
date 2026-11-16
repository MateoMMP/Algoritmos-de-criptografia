import { test, expect } from '@playwright/test';
test('navega, calcula César y persiste progreso', async ({ page }) => {
  await page.goto('/bloque/1/06-cesar-historico?mode=lab');
  await expect(page.getByRole('heading', { name: 'César histórico' })).toBeVisible();
  await expect(page.getByText('Teoría y fórmulas')).toHaveCount(0);
  await expect(page.getByText('Solo aprendizaje')).toHaveCount(0);
  const messageBox = await page.getByLabel('Mensaje o valor').boundingBox();
  const actionBox = await page.getByRole('button', { name: 'Cifrar', exact: true }).boundingBox();
  const outputBox = await page.getByRole('heading', { name: 'Salida' }).boundingBox();
  expect(actionBox?.y).toBeGreaterThan(messageBox?.y ?? 0);
  expect(outputBox?.y).toBeGreaterThan(actionBox?.y ?? 0);
  if ((page.viewportSize()?.width ?? 0) > 850) {
    const brandBox = await page.locator('.brand').boundingBox();
    const topbarBox = await page.locator('.topbar').boundingBox();
    expect(Math.abs((brandBox?.height ?? 0) - (topbarBox?.height ?? 0))).toBeLessThan(1);
  }
  await page.getByLabel('Mensaje o valor').fill('HOLA');
  await page.getByLabel(/Clave o parámetros/).fill('3');
  await page.getByRole('button', { name: /Cifrar/ }).click();
  await expect(page.getByText('KRÑD', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cambiar tema' }).click();
  await page.getByRole('button', { name: 'Marcar como completada' }).click();
  const completedBackground = await page
    .getByRole('button', { name: 'Lección completada' })
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(completedBackground).toBe('rgb(23, 60, 54)');
  await page.reload();
  await expect(page.getByText('1/64', { exact: true })).toBeAttached();
});
test('Polibio cifra, intercambia y descifra el ejemplo', async ({ page }) => {
  await page.goto('/bloque/1/03-cuadrado-de-polibio?mode=lab');
  await expect(page.getByRole('heading', { name: 'Cómo funciona' })).toBeVisible();
  await page.getByRole('button', { name: 'Cifrar', exact: true }).click();
  await page.getByRole('button', { name: 'Intercambiar' }).click();
  await page.getByRole('button', { name: 'Descifrar', exact: true }).first().click();
  await expect(page.getByText('CRIPTOGRAFIA', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ejemplo' }).click();
  await page.getByRole('button', { name: 'Cifrar', exact: true }).click();
  await page.getByRole('button', { name: 'Descifrar', exact: true }).click();
  await expect(page.getByText('CRIPTOGRAFIA', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: /Siguiente/ }).click();
  await expect(page.getByRole('heading', { name: 'Cifrado Uesugi' })).toBeVisible();
  await expect(page.getByText('1/64', { exact: true })).toBeAttached();
});
test('las cinco secciones son navegables en móvil', async ({ page }) => {
  await page.goto('/bloque/1/01-escitala-lacedemonia-estricta');
  const menu = page.getByRole('button', { name: 'Abrir temario' });
  if (await menu.isVisible()) await menu.click();
  for (let n = 1; n <= 5; n++)
    await expect(page.getByText(`BLOQUE ${n}`, { exact: true }).first()).toBeVisible();
});
test('la escítala muestra su matriz y cada lección recupera su ejemplo', async ({ page }) => {
  await page.goto('/bloque/1/01-escitala-lacedemonia-estricta?mode=lab');
  await page
    .getByLabel('Mensaje o valor')
    .fill('HOLA ME LLAMO MATEO Y SOY EL MEJOR DEL MUNDO MUNDIAL');
  await page.getByRole('button', { name: 'Cifrar', exact: true }).click();
  await expect(page.getByLabel(/Visualización de Escítala/)).toBeVisible();
  await expect(page.getByText(/4 × 13 = 52 celdas/)).toBeVisible();
  await page.getByLabel(/Clave o parámetros/).fill('99');
  const menu = page.getByRole('button', { name: 'Abrir temario' });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('link', { name: /Escítala general/ }).click();
  await expect(page.getByLabel(/Clave o parámetros/)).toHaveValue('3');
  await expect(page.getByLabel('Mensaje o valor')).toHaveValue('TRANSPOCISION');
});
test('CT-46 explica y cifra realmente ATAQUE A LAS 20:00', async ({ page }) => {
  await page.goto('/bloque/1/05-straddling-checkerboard-y-tablero-ct-46?mode=lab');
  await page.getByRole('button', { name: 'Cifrar', exact: true }).click();
  await expect(
    page.getByText('5375303906556586531654145674545', { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText(/A está directamente bajo la columna 5/)).toBeVisible();
  await expect(page.getByText(/T está en la fila de prefijo 3/)).toBeVisible();
  await page.getByRole('button', { name: 'Intercambiar' }).click();
  await page.getByRole('button', { name: 'Descifrar', exact: true }).first().click();
  await expect(page.getByText('ATAQUE A LAS 20:00', { exact: true }).first()).toBeVisible();
});

test('nomenclátor, Alberti y Porta sincronizan modelo, entrada y pasos', async ({ page }) => {
  await page.goto('/bloque/1/07-nomenclatores-y-libros-de-codigos?mode=lab');
  await page.getByRole('button', { name: 'Cifrar', exact: true }).click();
  await expect(page.getByText('EL 204 AVANZA AL 731', { exact: true }).first()).toBeVisible();
  const nomenclator = page.getByLabel(/Visualización de Nomenclátores/);
  await expect(nomenclator.getByText('EJERCITO', { exact: true }).first()).toBeVisible();
  await expect(nomenclator.getByText('204', { exact: true }).first()).toBeVisible();
  await expect(nomenclator.getByText('AVANZA', { exact: true }).first()).toBeVisible();

  await page.goto('/bloque/1/08-discos-de-alberti?mode=lab');
  await page.getByRole('button', { name: 'Cifrar', exact: true }).click();
  const alberti = page.getByLabel(/Visualización de Discos de Alberti/);
  await expect(page.getByText('Giro activo').locator('..')).toContainText('0 · desplazamiento 15');
  for (let step = 0; step < 4; step++)
    await page.getByRole('button', { name: 'Paso siguiente' }).click();
  await expect(page.getByText('Giro activo').locator('..')).toContainText('1 · desplazamiento 12');
  await expect(alberti.getByText('Sustitución', { exact: true }).locator('..')).toContainText(
    'N → Z',
  );

  await page.goto('/bloque/1/09-porta-bellaso?mode=lab');
  await page.getByRole('button', { name: 'Cifrar', exact: true }).click();
  const porta = page.getByLabel(/Visualización de Porta/);
  await expect(porta.getByText(/Cada cuadrado incluye la posición/)).toBeVisible();
  await expect(porta.getByText(/Recíproco significa que cada pareja/)).toBeVisible();
  await expect(porta.getByText('Par de clave activo').locator('..')).toContainText('CD');
  await page.getByRole('button', { name: 'Paso siguiente' }).click();
  await expect(porta.getByText('Par de clave activo').locator('..')).toContainText('KL');
  await page.getByLabel('Mensaje o valor').fill('E');
  await page.getByLabel(/Clave o parámetros/).fill('E');
  await page.getByRole('button', { name: 'Cifrar', exact: true }).click();
  await expect(page.getByText('T', { exact: true }).first()).toBeVisible();
  await expect(porta.locator('.porta-pair.active')).toContainText('E');
  await expect(porta.locator('.porta-pair.active')).toContainText('T');
  await expect(porta.getByText(/Al repetirla/)).toContainText('T vuelve a E');
});

test('ADFGVX separa visualmente la función de sus dos claves', async ({ page }) => {
  await page.goto('/bloque/1/11-adfgx-y-adfgvx');
  await page.getByRole('button', { name: 'Cifrar', exact: true }).click();
  const visual = page.getByLabel(/Visualización de ADFGX y ADFGVX/);
  await expect(
    visual.locator('.adfgvx-key-guide b').filter({ hasText: /^ANONYMOUS$/ }),
  ).toBeVisible();
  await expect(
    visual.locator('.adfgvx-key-guide b').filter({ hasText: /^MRPRESIDENT$/ }),
  ).toBeVisible();
  await expect(visual.getByText(/La primera clave construye el tablero/)).toBeVisible();
  await expect(visual.getByText(/La segunda clave ordena las columnas/)).toBeVisible();
  await expect(visual.getByText('Texto intermedio')).toBeVisible();
  await page.getByRole('button', { name: 'Intercambiar' }).click();
  await page.getByRole('button', { name: 'Descifrar', exact: true }).first().click();
  await expect(page.getByText('ATTACKAT1200AM', { exact: true }).first()).toBeVisible();
});

test('el código sindical muestra el desplazamiento de palabras', async ({ page }) => {
  await page.goto('/bloque/1/12-codigo-sindical-con-desplazamiento');
  await page.getByRole('button', { name: 'Cifrar', exact: true }).click();
  const visual = page.getByLabel(/Visualización de Código sindical/);
  await expect(visual.getByText(/No se desplazan letras/)).toBeVisible();
  await expect(page.getByText('UNIDAD RETIRADA', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Paso siguiente' }).click();
  await expect(visual.getByText('Palabra de entrada')).toBeVisible();
  await expect(visual.getByText('HUELGA', { exact: true }).first()).toBeVisible();
  await expect(visual.getByText('posición 6', { exact: true }).first()).toBeVisible();
  await expect(visual.getByText('UNIDAD', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Intercambiar' }).click();
  await page.getByRole('button', { name: 'Descifrar', exact: true }).first().click();
  await expect(page.getByText('HUELGA GENERAL', { exact: true }).first()).toBeVisible();
});
