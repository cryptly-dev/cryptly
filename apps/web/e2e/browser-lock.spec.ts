import { expect, test, type Page } from '@playwright/test';

const APP = process.env.SVELTE_URL ?? 'http://127.0.0.1:9090';
const JWT_STORAGE_KEY = 'secretly-app_src_lib_logics_authLogic_jwtToken';
const REFRESH_STORAGE_KEY = 'secretly-app_src_lib_logics_authLogic_refreshToken';
const LAST_ACTIVITY_STORAGE_KEY = 'cryptly:key-last-activity-at';
const LOCKED_AT_STORAGE_KEY = 'cryptly:key-locked-at';
const LOCK_AFTER_MS = 30 * 60 * 1000;

const user = {
  id: 'eval-user',
  email: 'eval@example.com',
  authMethod: 'local',
  avatarUrl: '',
  displayName: 'Eval User',
  publicKey: 'eval-public-key',
  privateKeyEncrypted: 'eval-private-key-encrypted',
  projectCreationDefaults: { revealOn: 'hover' },
  isAdmin: false
};

type MockUser = typeof user;
type MockProject = {
  id: string;
  name: string;
  owner: string;
  encryptedSecretsKeys: Record<string, string>;
  encryptedSecrets: string;
  members: Array<{ id: string; avatarUrl: string; displayName: string; role: string }>;
  updatedAt: string;
  settings: { revealOn: string };
  integrations: { githubInstallationId: number };
};

async function mockApi(
  page: Page,
  opts: { userDelayMs?: number; projectsDelayMs?: number; user?: MockUser; projects?: MockProject[] } = {}
) {
  await page.route('**/users/me', async (route) => {
    if (opts.userDelayMs) await new Promise((resolve) => setTimeout(resolve, opts.userDelayMs));
    await route.fulfill({ json: opts.user ?? user });
  });
  await page.route('**/projects/*/history', async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route('**/projects/*/events', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });
  await page.route('**/projects/*/external-connections/github/integrations', async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route('**/projects/*/invitations**', async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route('**/projects/*/personal-invitations**', async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route('**/projects/project-eval', async (route) => {
    await route.fulfill({ json: opts.projects?.[0] });
  });
  await page.route('**/users/me/projects', async (route) => {
    if (opts.projectsDelayMs) await new Promise((resolve) => setTimeout(resolve, opts.projectsDelayMs));
    await route.fulfill({ json: opts.projects ?? [] });
  });
  await page.route('**/external-connections/github/installations**', async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route('**/users/me/personal-invitations', async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route('**/auth/device-flow/messages**', async (route) => {
    await route.abort('failed');
  });
  await page.route('**/auth/refresh', async (route) => {
    await route.fulfill({ json: { token: 'eval-jwt', refreshToken: 'eval-refresh' } });
  });
}

async function createUnlockedFixtures(page: Page, passphrase: string): Promise<{ user: MockUser; project: MockProject }> {
  await page.goto(`${APP}/`, { waitUntil: 'domcontentloaded' });
  return page.evaluate(async ({ baseUser, password }) => {
    const toBase64 = (bytes: ArrayBuffer | Uint8Array) => {
      const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
      let binary = '';
      for (const byte of u8) binary += String.fromCharCode(byte);
      return btoa(binary);
    };
    const fromUtf8 = (value: string) => new TextEncoder().encode(value);
    const concat = (a: Uint8Array, b: Uint8Array) => {
      const out = new Uint8Array(a.length + b.length);
      out.set(a);
      out.set(b, a.length);
      return out;
    };
    const encryptAes = async (value: string, key: CryptoKey) => {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, fromUtf8(value)));
      return toBase64(concat(iv, ciphertext));
    };

    const rsa = await crypto.subtle.generateKey(
      { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
      true,
      ['encrypt', 'decrypt']
    );
    const publicKey = toBase64(await crypto.subtle.exportKey('spki', rsa.publicKey));
    const privateKey = toBase64(await crypto.subtle.exportKey('pkcs8', rsa.privateKey));
    const passphraseDigest = await crypto.subtle.digest('SHA-256', fromUtf8(password));
    const passphraseKey = await crypto.subtle.importKey('raw', passphraseDigest, { name: 'AES-GCM', length: 256 }, false, [
      'encrypt'
    ]);
    const privateKeyEncrypted = await encryptAes(privateKey, passphraseKey);

    const projectRawKey = crypto.getRandomValues(new Uint8Array(32));
    const projectKey = await crypto.subtle.importKey('raw', projectRawKey, { name: 'AES-GCM', length: 256 }, true, [
      'encrypt',
      'decrypt'
    ]);
    const encryptedSecrets = await encryptAes('API_KEY="eval"', projectKey);
    const encryptedProjectKey = toBase64(
      await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, rsa.publicKey, fromUtf8(toBase64(projectRawKey)))
    );

    const keyedUser = { ...baseUser, publicKey, privateKeyEncrypted };
    const project = {
      id: 'project-eval',
      name: 'Eval Project',
      owner: keyedUser.id,
      encryptedSecretsKeys: { [keyedUser.id]: encryptedProjectKey },
      encryptedSecrets,
      members: [{ id: keyedUser.id, avatarUrl: '', displayName: keyedUser.displayName, role: 'admin' }],
      updatedAt: new Date().toISOString(),
      settings: { revealOn: 'hover' },
      integrations: { githubInstallationId: 0 }
    };
    return { user: keyedUser, project };
  }, { baseUser: user, password: passphrase });
}

async function seedBrowserState(page: Page, lastActivityAt: number) {
  await page.goto(`${APP}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    async ({ jwtKey, refreshKey, activityKey, activityAt }) => {
      localStorage.setItem(jwtKey, 'eval-jwt');
      localStorage.setItem(refreshKey, 'eval-refresh');
      localStorage.setItem(activityKey, String(activityAt));

      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('cryptly-keystore', 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('master')) db.createObjectStore('master');
          if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects');
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const masterKey = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
      const projectKey = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(['master', 'projects'], 'readwrite');
        tx.objectStore('master').put(masterKey, 'self');
        tx.objectStore('projects').put(projectKey, 'project-eval');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    },
    {
      jwtKey: JWT_STORAGE_KEY,
      refreshKey: REFRESH_STORAGE_KEY,
      activityKey: LAST_ACTIVITY_STORAGE_KEY,
      activityAt: lastActivityAt
    }
  );
}

async function hasStoredMasterKey(page: Page): Promise<boolean> {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('cryptly-keystore', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const result = await new Promise<unknown>((resolve, reject) => {
      const request = db.transaction('master', 'readonly').objectStore('master').get('self');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return Boolean(result);
  });
}

test('stale unlocked browser locks immediately and wipes local keys', async ({ page }) => {
  await mockApi(page);
  await seedBrowserState(page, Date.now() - LOCK_AFTER_MS - 5_000);

  await page.goto(`${APP}/app/project`, { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('dialog', { name: 'Unlock this browser' })).toBeVisible();
  await expect.poll(() => hasStoredMasterKey(page)).toBe(false);
});

test('recently active unlocked browser stays open', async ({ page }) => {
  await mockApi(page);
  await seedBrowserState(page, Date.now());

  await page.goto(`${APP}/app/project`, { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: /Name your first/i })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Unlock this browser' })).toHaveCount(0);
  await expect.poll(() => hasStoredMasterKey(page)).toBe(true);
});

test('lock broadcast in one tab locks another open tab', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'dark' });
  const pageOne = await context.newPage();
  const pageTwo = await context.newPage();
  await mockApi(pageOne);
  await mockApi(pageTwo);
  await seedBrowserState(pageOne, Date.now());

  await pageOne.goto(`${APP}/app/project`, { waitUntil: 'domcontentloaded' });
  await pageTwo.goto(`${APP}/app/project`, { waitUntil: 'domcontentloaded' });
  await expect(pageTwo.getByRole('heading', { name: /Name your first/i })).toBeVisible();

  await pageOne.evaluate((key) => localStorage.setItem(key, String(Date.now())), LOCKED_AT_STORAGE_KEY);

  await expect(pageTwo.getByRole('dialog', { name: 'Unlock this browser' })).toBeVisible();
  await expect.poll(() => hasStoredMasterKey(pageTwo)).toBe(false);
  await context.close();
});

test('shell loading state is text-first, not the large six-dot grip', async ({ page }) => {
  await mockApi(page, { userDelayMs: 1_000 });
  await seedBrowserState(page, Date.now());

  await page.goto(`${APP}/app/project`, { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('status').filter({ hasText: 'Loading' })).toBeVisible();
  await expect(page.locator('svg[aria-label="Loading"]')).toHaveCount(0);
});

test('unlock after lock cleanup does not leave project shell stuck loading', async ({ page }) => {
  const passphrase = 'correct horse battery staple';
  const fixtures = await createUnlockedFixtures(page, passphrase);
  await mockApi(page, { projectsDelayMs: 800, user: fixtures.user, projects: [fixtures.project] });
  await seedAuthOnly(page);

  await page.goto(`${APP}/app/project/project-eval`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('dialog', { name: 'Unlock this browser' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Passphrase' }).fill(passphrase);
  await page.getByRole('button', { name: 'Unlock' }).click();

  await expect(page.getByRole('dialog', { name: 'Unlock this browser' })).toHaveCount(0);
  await expect(page.getByText('Eval Project').first()).toBeVisible();
  await expect(page.getByRole('status', { name: 'Loading projects' })).toHaveCount(0);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Eval Project').first()).toBeVisible();
  await expect(page.getByText('Could not load your account')).toHaveCount(0);
});

async function seedAuthOnly(page: Page) {
  await page.goto(`${APP}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    async ({ jwtKey, refreshKey }) => {
      localStorage.setItem(jwtKey, 'eval-jwt');
      localStorage.setItem(refreshKey, 'eval-refresh');
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase('cryptly-keystore');
        request.onsuccess = () => resolve();
        request.onblocked = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },
    { jwtKey: JWT_STORAGE_KEY, refreshKey: REFRESH_STORAGE_KEY }
  );
}
