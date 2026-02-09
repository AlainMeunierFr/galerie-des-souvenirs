#!/usr/bin/env node
/**
 * Collecte des métriques du projet (statique + API des outils).
 * Deux méthodes : parcours des fichiers (scan) et sorties JSON des outils (API).
 * Comparaison des deux pour détecter les incohérences.
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const METRICS_FILE = join(ROOT, 'public', 'metrics', 'publish-metrics.json');

/**
 * Collecte les métriques statiques (au début du pipeline).
 */
export function collectStaticMetrics() {
  const sprintsDir = join(ROOT, '.cursor', 'sprints');
  const testsDir = join(ROOT, 'tests');

  const us = collectUS(sprintsDir);
  const tu = collectTU(testsDir);
  const ti = collectTI(testsDir);
  const bdd = collectBDD(testsDir);

  return {
    timestamp: new Date().toISOString(),
    status: 'in_progress',
    failedAtStep: null,
    us,
    tu: { ...tu, passed: null, failed: null, skipped: null, total: null, durationMs: null },
    ti: { ...ti, passed: null, failed: null, skipped: null, total: null, durationMs: null },
    bdd: { ...bdd, passed: null, failed: null, skipped: null, total: null, durationMs: null },
    e2e: {
      scenarios: bdd.scenarios,
      stepsTotal: bdd.stepsTotal,
      passed: null,
      failed: null,
      skipped: null,
      total: null,
      durationMs: null,
    },
    pipeline: { totalDurationMs: null },
    inconsistencies: [],
  };
}

function collectUS(sprintsDir) {
  const result = { files: 0, sprints: 0, caTotal: 0, enCours: null };

  if (!existsSync(sprintsDir)) return result;

  const enCoursPath = join(sprintsDir, 'US en cours.md');
  if (existsSync(enCoursPath)) {
    const content = readFileSync(enCoursPath, 'utf-8');
    const line1 = content.split('\n')[0]?.trim();
    if (line1) result.enCours = line1;
  }

  const entries = readdirSync(sprintsDir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      result.sprints++;
      const subPath = join(sprintsDir, e.name);
      for (const f of readdirSync(subPath, { withFileTypes: true })) {
        if (f.isFile() && /^US-.+\.md$/.test(f.name)) {
          result.files++;
          const content = readFileSync(join(subPath, f.name), 'utf-8');
          const caMatches = content.match(/-\s+\*\*CA\d+/g);
          if (caMatches) result.caTotal += caMatches.length;
        }
      }
    }
  }
  return result;
}

function collectTU(testsDir) {
  const unitDir = join(testsDir, 'unit');
  let files = 0;
  let tests = 0;

  if (!existsSync(unitDir)) return { files: 0, tests: 0 };

  function walk(dir) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.test\.(ts|tsx)$/.test(e.name)) {
        files++;
        const content = readFileSync(p, 'utf-8');
        const itMatches = content.match(/\bit\s*\(/g);
        const testMatches = content.match(/\btest\s*\(/g);
        tests += (itMatches?.length || 0) + (testMatches?.length || 0);
      }
    }
  }
  walk(unitDir);
  return { files, tests };
}

function collectTI(testsDir) {
  const intDir = join(testsDir, 'integration');
  let files = 0;
  let tests = 0;

  if (!existsSync(intDir)) return { files: 0, tests: 0 };

  function walk(dir) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.integration\.test\.(ts|tsx)$/.test(e.name)) {
        files++;
        const content = readFileSync(p, 'utf-8');
        const itMatches = content.match(/\bit\s*\(/g);
        const testMatches = content.match(/\btest\s*\(/g);
        tests += (itMatches?.length || 0) + (testMatches?.length || 0);
      }
    }
  }
  walk(intDir);
  return { files, tests };
}

function collectBDD(testsDir) {
  const bddDir = join(testsDir, 'bdd');
  let featureFiles = 0;
  let scenarios = 0;
  let stepsTotal = 0;
  let stepDefinitionFiles = 0;

  if (!existsSync(bddDir)) return { featureFiles: 0, scenarios: 0, stepsTotal: 0, stepDefinitionFiles: 0 };

  function walk(dir) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.feature')) {
        featureFiles++;
        const content = readFileSync(p, 'utf-8');
        const scenarioMatches = content.match(/^\s*Scénario|^\s*Scenario(?!\s+Outline)/gm);
        scenarios += scenarioMatches?.length || 0;
        const stepMatches = content.match(/^\s*(Étant donné|Given|Quand|When|Alors|Then|Et|And)\s+/gm);
        stepsTotal += stepMatches?.length || 0;
      } else if (e.name.endsWith('.steps.ts')) {
        stepDefinitionFiles++;
      }
    }
  }
  walk(bddDir);
  return { featureFiles, scenarios, stepsTotal, stepDefinitionFiles };
}

/**
 * Lit le fichier JSON Jest et extrait les métriques (API outil).
 */
export function parseJestJson(filePath) {
  const result = { passed: null, failed: null, skipped: null, total: null, durationMs: null };
  if (!existsSync(filePath)) return result;
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    result.passed = data.numPassedTests ?? null;
    result.failed = data.numFailedTests ?? null;
    result.skipped = (data.numPendingTests ?? 0) + (data.numTodoTests ?? 0);
    result.total = data.numTotalTests ?? null;
    if (data.startTime != null && data.testResults?.length) {
      const last = data.testResults[data.testResults.length - 1];
      result.durationMs = last?.endTime && data.startTime ? Math.round(last.endTime - data.startTime) : null;
    }
  } catch { /* ignore */ }
  return result;
}

/**
 * Lit le fichier JSON Playwright et extrait les métriques (API outil).
 */
export function parsePlaywrightJson(filePath) {
  const result = { passed: null, failed: null, skipped: null, total: null, durationMs: null };
  if (!existsSync(filePath)) return result;
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    const stats = data.stats || {};
    result.passed = stats.expected ?? null;
    result.failed = stats.unexpected ?? null;
    result.skipped = stats.skipped ?? null;
    result.total = (result.passed ?? 0) + (result.failed ?? 0) + (result.skipped ?? 0);
    result.durationMs = stats.duration ? Math.round(stats.duration) : null;
  } catch { /* ignore */ }
  return result;
}

/**
 * Parse la sortie Jest (stdout) — fallback si JSON indisponible.
 */
export function parseJestOutput(output) {
  const result = { passed: null, failed: null, skipped: null, total: null, durationMs: null };
  const testsMatch = output.match(/Tests:\s+(?:(\d+)\s+passed,?\s*)?(?:(\d+)\s+failed,?\s*)?(?:(\d+)\s+skipped,?\s*)?(\d+)\s+total/);
  if (testsMatch) {
    result.passed = parseInt(testsMatch[1] || '0', 10);
    result.failed = parseInt(testsMatch[2] || '0', 10);
    result.skipped = parseInt(testsMatch[3] || '0', 10);
    result.total = parseInt(testsMatch[4] || '0', 10);
  }
  const timeMatch = output.match(/Time:\s+([\d.]+)\s*s/);
  if (timeMatch) result.durationMs = Math.round(parseFloat(timeMatch[1]) * 1000);
  return result;
}

/**
 * Parse la sortie Playwright (stdout) — fallback si JSON indisponible.
 */
export function parsePlaywrightOutput(output) {
  const result = { passed: null, failed: null, skipped: null, total: null, durationMs: null };
  const passedMatch = output.match(/(\d+)\s+passed/);
  const failedMatch = output.match(/(\d+)\s+failed/);
  const skippedMatch = output.match(/(\d+)\s+skipped/);
  const timeMatch = output.match(/\(([\d.]+)s\)/);
  if (passedMatch) result.passed = parseInt(passedMatch[1], 10);
  if (failedMatch) result.failed = parseInt(failedMatch[1], 10);
  if (skippedMatch) result.skipped = parseInt(skippedMatch[1], 10);
  if (result.passed != null || result.failed != null) {
    result.total = (result.passed ?? 0) + (result.failed ?? 0) + (result.skipped ?? 0);
  }
  if (timeMatch) result.durationMs = Math.round(parseFloat(timeMatch[1]) * 1000);
  return result;
}

/**
 * Calcule les incohérences entre scan (fichiers) et API (outils).
 */
export function computeInconsistencies(metrics) {
  const list = [];
  if (metrics.tu?.tests != null && metrics.tu?.total != null && metrics.tu.tests !== metrics.tu.total) {
    list.push({
      type: 'tu',
      message: 'TU : nombre de tests déclarés (scan) ≠ nombre exécutés (API)',
      scan: metrics.tu.tests,
      api: metrics.tu.total,
    });
  }
  if (metrics.ti?.tests != null && metrics.ti?.total != null && metrics.ti.tests !== metrics.ti.total) {
    list.push({
      type: 'ti',
      message: 'TI : nombre de tests déclarés (scan) ≠ nombre exécutés (API)',
      scan: metrics.ti.tests,
      api: metrics.ti.total,
    });
  }
  if (metrics.bdd?.scenarios != null && metrics.bdd?.total != null && metrics.bdd.scenarios !== metrics.bdd.total) {
    list.push({
      type: 'bdd',
      message: 'BDD : nombre de scénarios (scan) ≠ nombre exécutés (API)',
      scan: metrics.bdd.scenarios,
      api: metrics.bdd.total,
    });
  }
  if (metrics.e2e?.scenarios != null && metrics.e2e?.total != null && metrics.e2e.scenarios !== metrics.e2e.total) {
    list.push({
      type: 'e2e',
      message: 'E2E : nombre de scénarios (scan) ≠ nombre exécutés (API)',
      scan: metrics.e2e.scenarios,
      api: metrics.e2e.total,
    });
  }
  return list;
}

/**
 * Lit le fichier metrics actuel, le fusionne avec les nouvelles données, et sauvegarde.
 */
export function updateMetrics(updates) {
  let metrics = {};
  if (existsSync(METRICS_FILE)) {
    try {
      metrics = JSON.parse(readFileSync(METRICS_FILE, 'utf-8'));
    } catch { /* ignore */ }
  }

  const merged = deepMerge(metrics, updates);
  const dir = join(ROOT, 'public', 'metrics');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(METRICS_FILE, JSON.stringify(merged, null, 2), 'utf-8');
}

function deepMerge(target, source) {
  const out = { ...target };
  for (const k of Object.keys(source)) {
    if (source[k] !== null && typeof source[k] === 'object' && !Array.isArray(source[k])) {
      out[k] = deepMerge(out[k] || {}, source[k]);
    } else {
      out[k] = source[k];
    }
  }
  return out;
}
