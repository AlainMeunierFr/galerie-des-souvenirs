import { createBdd, test } from 'playwright-bdd';
import { spawn } from 'child_process';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { db } from '@/lib/db';
import {
  ensureSouvenirTable,
  souvenirTableExists,
  souvenirTableHasColumns,
} from '@/utils';

const { Given, When, Then } = createBdd(test);

const SKIP_CA2 =
  "CA2 nécessite un fichier HEIC réel dans data/input pour test d'intégration.";

function runScript(script: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', script], {
      cwd: process.cwd(),
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (d) => (stdout += d.toString()));
    child.stderr?.on('data', (d) => (stderr += d.toString()));
    child.on('close', (code) =>
      code === 0 ? resolve({ stdout, stderr }) : reject(new Error(stderr || stdout))
    );
    child.on('error', reject);
  });
}

async function getSouvenirByNom(nom: string) {
  const r = await db.execute({
    sql: 'SELECT nom, done, webp, miniature FROM souvenir WHERE nom = ?',
    args: [nom],
  });
  if (r.rows.length === 0) return null;
  const row = r.rows[0] as unknown as {
    nom: string;
    done: number;
    webp: number;
    miniature: number;
  };
  return row;
}

async function listBaseNames(dir: string): Promise<Set<string>> {
  try {
    const files = await readdir(dir);
    return new Set(
      files
        .filter((f) => /\.(heic|webp|jpe?g)$/i.test(f))
        .map((f) => f.replace(/\.(heic|webp|jpe?g)$/i, ''))
    );
  } catch {
    return new Set();
  }
}

Given('la table souvenir est initialisée', async () => {
  await ensureSouvenirTable(db);
});

Then('la table souvenir existe', async () => {
  const exists = await souvenirTableExists(db);
  if (!exists) throw new Error("La table souvenir n'existe pas");
});

Then(
  'la table souvenir contient les colonnes id, nom, done, webp, miniature',
  async () => {
    const hasColumns = await souvenirTableHasColumns(db, [
      'id',
      'nom',
      'done',
      'webp',
      'miniature',
    ]);
    if (!hasColumns)
      throw new Error('La table souvenir ne contient pas les colonnes attendues');
  }
);

Given('un fichier HEIC {string} dans data\\/input', async ({}, filename: string) => {
  test.skip(true, SKIP_CA2);
  void filename;
});

When('je lance le script convert-heic-to-webp', async () => {
  test.skip(true, SKIP_CA2);
});

Then(
  'un souvenir {string} existe en base avec done={int}, webp={int}, miniature={int}',
  async ({}, nom: string, done: number, webp: number, miniature: number) => {
    const row = await getSouvenirByNom(nom);
    if (!row) throw new Error(`Souvenir "${nom}" introuvable en base`);
    if (row.done !== done || row.webp !== webp || row.miniature !== miniature) {
      throw new Error(
        `Souvenir "${nom}" a done=${row.done}, webp=${row.webp}, miniature=${row.miniature} (attendu: ${done}, ${webp}, ${miniature})`
      );
    }
  }
);

Given(
  'des fichiers webp dans data\\/souvenirs\\/webp et data\\/souvenirs\\/miniature',
  async () => {
  // Les dossiers existent déjà (données du projet)
  const webp = await listBaseNames(join(process.cwd(), 'data', 'souvenirs', 'webp'));
  const miniature = await listBaseNames(
    join(process.cwd(), 'data', 'souvenirs', 'miniature')
  );
  if (webp.size === 0 && miniature.size === 0) {
    throw new Error('Aucun fichier webp dans data/souvenirs pour tester CA4');
  }
});

When('je lance le script db:souvenirs-sync', async () => {
  await runScript('db:souvenirs-sync');
});

Then('la table souvenir contient un enregistrement pour chaque fichier trouvé', async () => {
  const doneDir = join(process.cwd(), 'data', 'input', 'done');
  const webpDir = join(process.cwd(), 'data', 'souvenirs', 'webp');
  const miniatureDir = join(process.cwd(), 'data', 'souvenirs', 'miniature');
  const [doneSet, webpSet, miniatureSet] = await Promise.all([
    listBaseNames(doneDir),
    listBaseNames(webpDir),
    listBaseNames(miniatureDir),
  ]);
  const expected = new Set([...doneSet, ...webpSet, ...miniatureSet]);
  const r = await db.execute({ sql: 'SELECT nom FROM souvenir', args: [] });
  const inDb = new Set(
    r.rows.map((row) => (row as unknown as { nom: string }).nom)
  );
  for (const nom of expected) {
    if (!inDb.has(nom)) {
      throw new Error(`Souvenir "${nom}" absent de la table`);
    }
  }
});

Then(
  'chaque enregistrement a done, webp et miniature cohérents avec la présence des fichiers',
  async () => {
    const doneDir = join(process.cwd(), 'data', 'input', 'done');
    const webpDir = join(process.cwd(), 'data', 'souvenirs', 'webp');
    const miniatureDir = join(process.cwd(), 'data', 'souvenirs', 'miniature');
    const [doneSet, webpSet, miniatureSet] = await Promise.all([
      listBaseNames(doneDir),
      listBaseNames(webpDir),
      listBaseNames(miniatureDir),
    ]);
    const r = await db.execute({
      sql: 'SELECT nom, done, webp, miniature FROM souvenir',
      args: [],
    });
    for (const row of r.rows) {
      const { nom, done, webp, miniature } = row as unknown as {
        nom: string;
        done: number;
        webp: number;
        miniature: number;
      };
      const expectDone = doneSet.has(nom) ? 1 : 0;
      const expectWebp = webpSet.has(nom) ? 1 : 0;
      const expectMiniature = miniatureSet.has(nom) ? 1 : 0;
      if (done !== expectDone || webp !== expectWebp || miniature !== expectMiniature) {
        throw new Error(
          `Souvenir "${nom}": attendu done=${expectDone}, webp=${expectWebp}, miniature=${expectMiniature} ; trouvé ${done}, ${webp}, ${miniature}`
        );
      }
    }
  }
);
