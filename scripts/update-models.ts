/**
 * Fetches the current model list from llmgateway.io and writes it to
 * src/lib/models.json. Run manually or via the GitHub Actions schedule.
 *
 * Usage:  bun run update-models
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { transformModels } from '../src/lib/models.ts';

const API_URL = 'https://api.llmgateway.io/v1/models';
const OUT_PATH = resolve(import.meta.dir, '../src/lib/models.json');

console.log(`Fetching models from ${API_URL}…`);

const res = await fetch(API_URL);
if (!res.ok) {
	console.error(`HTTP ${res.status} ${res.statusText}`);
	process.exit(1);
}

const data = await res.json();
const raw = Array.isArray(data) ? data : (data.data ?? []);
const models = transformModels(raw);

writeFileSync(OUT_PATH, JSON.stringify(models, null, '\t') + '\n');
console.log(`✓ Written ${models.length} models to src/lib/models.json`);
