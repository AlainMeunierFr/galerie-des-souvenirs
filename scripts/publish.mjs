#!/usr/bin/env node
/**
 * Script de publication : ESLint → TU → TI → BDD → E2E → Typecheck + Build → Commit → Push GitHub
 * À chaque erreur : log + prompt de correction → arrêt
 * Métriques : collecte statique au début, mise à jour progressive après chaque étape.
 */

import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  collectStaticMetrics,
  updateMetrics,
  parseJestJson,
  parsePlaywrightJson,
  parseJestOutput,
  parsePlaywrightOutput,
  computeInconsistencies,
} from './collect-metrics.mjs';

const LOGS_DIR = join(process.cwd(), 'logs');
const TEST_RESULTS_DIR = join(process.cwd(), 'test-results');
const PROMPT_FILE = join(process.cwd(), '.cursor', 'commands', 'fix-publish.md');
const pipelineStart = Date.now();

const STEPS = [
  {
    id: 'eslint',
    name: 'ESLint',
    cmd: 'npm',
    args: ['run', 'lint'],
    prompt: `## Erreur ESLint

L'étape **ESLint** a échoué. Consulte le log ci-dessous pour identifier les problèmes.

**Action** : Corriger les erreurs de lint signalées. Puis relancer \`npm run publish\`.`,
  },
  {
    id: 'tu',
    name: 'Tests unitaires (Jest)',
    cmd: 'npx',
    args: ['jest', '--config', 'jest.config.mjs', '--json', '--outputFile', 'test-results/jest-unit.json'],
    prompt: `## Erreur tests unitaires

L'étape **Tests unitaires (Jest)** a échoué. Consulte le log ci-dessous.

**Action** : Corriger les tests ou le code pour faire passer les TU. Puis relancer \`npm run publish\`.`,
  },
  {
    id: 'ti',
    name: 'Tests d\'intégration (Jest)',
    cmd: 'npx',
    args: ['jest', '--config', 'jest.integration.config.mjs', '--json', '--outputFile', 'test-results/jest-integration.json'],
    prompt: `## Erreur tests d'intégration

L'étape **Tests d'intégration (Jest)** a échoué. Consulte le log ci-dessous.

**Action** : Corriger les tests ou le code pour faire passer les TI. Puis relancer \`npm run publish\`.`,
  },
  {
    id: 'bdd',
    name: 'BDD (playwright-bdd)',
    cmd: 'npm',
    args: ['run', 'test:bdd'],
    prompt: `## Erreur BDD

L'étape **BDD (scénarios Gherkin)** a échoué. Consulte le log ci-dessous.

**Action** : Vérifier les fichiers .feature et les step definitions. Corriger les scénarios ou le code. Puis relancer \`npm run publish\`.`,
  },
  {
    id: 'e2e',
    name: 'E2E (Playwright)',
    cmd: 'npm',
    args: ['run', 'test:e2e'],
    prompt: `## Erreur E2E

L'étape **E2E (Playwright)** a échoué. Consulte le log ci-dessous.

**Action** : Corriger les tests E2E ou le comportement de l'application. Puis relancer \`npm run publish\`.`,
  },
  {
    id: 'typecheck',
    name: 'Contrôle de typage (TypeScript)',
    cmd: 'npx',
    args: ['tsc', '--noEmit'],
    prompt: `## Erreur TypeScript

L'étape **Contrôle de typage** a échoué. Consulte le log ci-dessous.

**Action** : Corriger les erreurs de typage. Puis relancer \`npm run publish\`.`,
  },
  {
    id: 'build',
    name: 'Build Next.js',
    cmd: 'npm',
    args: ['run', 'build'],
    prompt: `## Erreur Build

L'étape **Build Next.js** a échoué. Consulte le log ci-dessous.

**Action** : Corriger les erreurs de build. Puis relancer \`npm run publish\`.`,
  },
  {
    id: 'commit',
    name: 'Commit',
    cmd: process.platform === 'win32' ? 'cmd' : 'sh',
    args:
      process.platform === 'win32'
        ? ['/c', 'git add -A && (git diff --cached --quiet || git commit -m "chore: publication pipeline validé")']
        : ['-c', 'git add -A && (git diff --cached --quiet || git commit -m "chore: publication pipeline validé")'],
    prompt: `## Erreur Commit

L'étape **Commit** a échoué. Consulte le log ci-dessous.

**Action** : Résoudre le problème (conflits, fichiers verrouillés, etc.). Puis relancer \`npm run publish\`.`,
  },
  {
    id: 'push',
    name: 'Push GitHub',
    cmd: 'git',
    args: ['push'],
    prompt: `## Erreur Push GitHub

L'étape **Push** a échoué (réseau, authentification, conflits, etc.). Consulte le log ci-dessous.

**Action** : Résoudre le problème (git pull --rebase, credentials, etc.). Puis relancer \`npm run publish\`.`,
  },
];

function runStep(step) {
  return new Promise((resolve, reject) => {
    const child = spawn(step.cmd, step.args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });
    child.stderr?.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      const output = `=== stdout ===\n${stdout}\n=== stderr ===\n${stderr}`;
      // E2E : "No tests found" (dossier end-to-end vide) = succès, métriques à 0
      const e2eEmptyOk = step?.id === 'e2e' && /No tests found/i.test(stdout + stderr);
      if (code !== 0 && !e2eEmptyOk) {
        reject({ code, output, stdout, stderr });
      } else {
        if (e2eEmptyOk) {
          updateMetrics({ e2e: { passed: 0, failed: 0, skipped: 0, total: 0, durationMs: 0 } });
        }
        resolve({ stdout, stderr });
      }
    });

    child.on('error', (err) => {
      reject({ err, output: err.message });
    });
  });
}

function fail(step, error) {
  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true });
  }
  const logPath = join(LOGS_DIR, `publish-${step.id}-errors.txt`);
  const logContent = `=== ${step.name} - ÉCHEC ===\n\n${error.output || error.err?.message || JSON.stringify(error)}\n`;
  writeFileSync(logPath, logContent, 'utf-8');

  const promptContent = `${step.prompt}

---

**Log** : \`logs/publish-${step.id}-errors.txt\`

Pour analyser : utilise la commande \`/analyse-erreurs\` ou lis le fichier log.`;
  writeFileSync(PROMPT_FILE, promptContent, 'utf-8');

  console.error(`\n\n❌ ${step.name} a échoué.`);
  console.error(`   Log : ${logPath}`);
  console.error(`   Prompt de correction : ${PROMPT_FILE}`);
  console.error(`   Tape /fix-publish ou lis le prompt pour corriger.\n`);
  process.exit(1);
}

async function main() {
  console.log('🚀 Script de publication\n');

  // Métriques statiques au début (disponibles même en cas d'échec)
  if (!existsSync(TEST_RESULTS_DIR)) mkdirSync(TEST_RESULTS_DIR, { recursive: true });
  const staticMetrics = collectStaticMetrics();
  updateMetrics(staticMetrics);
  console.log('   📊 Métriques initiales collectées (public/metrics/publish-metrics.json)\n');

  for (const step of STEPS) {
    console.log(`\n▶ ${step.name}...`);
    try {
      const result = await runStep(step);
      console.log(`   ✓ ${step.name} OK`);

      // Métriques dynamiques : priorité API (JSON), fallback stdout
      const out = `${result?.stdout || ''}\n${result?.stderr || ''}`;
      if (step.id === 'tu') {
        const api = parseJestJson(join(TEST_RESULTS_DIR, 'jest-unit.json'));
        const fallback = Object.values(api).every((v) => v == null) ? parseJestOutput(out) : api;
        updateMetrics({ tu: fallback });
      } else if (step.id === 'ti') {
        const api = parseJestJson(join(TEST_RESULTS_DIR, 'jest-integration.json'));
        const fallback = Object.values(api).every((v) => v == null) ? parseJestOutput(out) : api;
        updateMetrics({ ti: fallback });
      } else if (step.id === 'bdd') {
        const api = parsePlaywrightJson(join(TEST_RESULTS_DIR, 'playwright-bdd.json'));
        const fallback = Object.values(api).every((v) => v == null) ? parsePlaywrightOutput(out) : api;
        updateMetrics({ bdd: fallback });
      } else if (step.id === 'e2e') {
        const api = parsePlaywrightJson(join(TEST_RESULTS_DIR, 'playwright-e2e.json'));
        const fallback = Object.values(api).every((v) => v == null) ? parsePlaywrightOutput(out) : api;
        updateMetrics({ e2e: fallback });
      }
      updateMetricsFromInconsistencies();
    } catch (error) {
      // Mettre à jour les métriques partielles (ex. Jest a écrit des résultats avant d'échouer)
      const out = `${error.stdout || ''}\n${error.stderr || ''}`;
      if (step.id === 'tu') {
        const api = parseJestJson(join(TEST_RESULTS_DIR, 'jest-unit.json'));
        const data = Object.values(api).some((v) => v != null) ? api : parseJestOutput(out);
        if (data.passed !== null || data.failed !== null) updateMetrics({ tu: data });
      } else if (step.id === 'ti') {
        const api = parseJestJson(join(TEST_RESULTS_DIR, 'jest-integration.json'));
        const data = Object.values(api).some((v) => v != null) ? api : parseJestOutput(out);
        if (data.passed !== null || data.failed !== null) updateMetrics({ ti: data });
      } else if (step.id === 'bdd') {
        const api = parsePlaywrightJson(join(TEST_RESULTS_DIR, 'playwright-bdd.json'));
        const data = Object.values(api).some((v) => v != null) ? api : parsePlaywrightOutput(out);
        if (data.passed !== null || data.failed !== null) updateMetrics({ bdd: data });
      } else if (step.id === 'e2e') {
        const api = parsePlaywrightJson(join(TEST_RESULTS_DIR, 'playwright-e2e.json'));
        const data = Object.values(api).some((v) => v != null) ? api : parsePlaywrightOutput(out);
        if (data.passed !== null || data.failed !== null) updateMetrics({ e2e: data });
      }
      updateMetricsFromInconsistencies();
      updateMetrics({ status: 'failed', failedAtStep: step.id });
      fail(step, error);
    }
  }

  updateMetricsFromInconsistencies();
  updateMetrics({
    status: 'success',
    failedAtStep: null,
    pipeline: { totalDurationMs: Date.now() - pipelineStart },
  });
  console.log('\n\n✅ Publication terminée avec succès.');
  console.log('   📊 Métriques : public/metrics/publish-metrics.json\n');
}

function updateMetricsFromInconsistencies() {
  const metricsPath = join(process.cwd(), 'public', 'metrics', 'publish-metrics.json');
  if (!existsSync(metricsPath)) return;
  try {
    const metrics = JSON.parse(readFileSync(metricsPath, 'utf-8'));
    const inconsistencies = computeInconsistencies(metrics);
    updateMetrics({ inconsistencies });
  } catch { /* ignore */ }
}

main();
