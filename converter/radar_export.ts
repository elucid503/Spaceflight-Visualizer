import * as fs from 'fs';

// Normalization divisors — update if source data changes
// All axes are capped at 100 after normalization, so these set the "full score" reference point.
const MAX_LAUNCH_COUNT = 1037.0; // Soyuz all-time total
const MAX_LEO_KG       = 95000.0; // SLS Block 1
const MAX_CADENCE      = 37.0;   // SpaceX peak launches/year
// Orbit diversity: derived from data at runtime (most distinct orbit types across any family)

// ── CSV parser ────────────────────────────────────────────────────────────────

function parseCSV(content: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const headers = splitCSVLine(lines[0]!);
  const rows = lines.slice(1).map(line => {
    const values = splitCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
    return row;
  });
  return { headers, rows };
}

function splitCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { fields.push(current); current = ''; }
      else { current += ch; }
    }
  }
  fields.push(current);
  return fields;
}

// ── Per-family accumulators ───────────────────────────────────────────────────

interface FamilyAccum {
  launchCount: number;
  successSum: number;
  leoSum: number;
  leoCount: number; // only rows with a numeric LEO value
  minYear: number;
  maxYear: number;
  orbitTypes: Set<string>;
}

function makeAccum(): FamilyAccum {
  return {
    launchCount: 0,
    successSum: 0,
    leoSum: 0,
    leoCount: 0,
    minYear: Infinity,
    maxYear: -Infinity,
    orbitTypes: new Set(),
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

function buildRadarCSV(inputFile: string, outputFile: string): void {
  console.log(`Reading ${inputFile}...`);
  const content = fs.readFileSync(inputFile, 'utf-8');

  console.log('Parsing CSV...');
  const { rows } = parseCSV(content);
  console.log(`  ${rows.length} rows`);

  const families = new Map<string, FamilyAccum>();

  for (const row of rows) {
    const family = row['Vehicle Family']?.trim();
    if (!family) continue;

    if (!families.has(family)) families.set(family, makeAccum());
    const acc = families.get(family)!;

    acc.launchCount++;

    if (row['Outcome']?.trim() === 'Success') acc.successSum++;

    const leo = parseFloat(row['Leo Capacity Kg'] ?? '');
    if (!isNaN(leo)) { acc.leoSum += leo; acc.leoCount++; }

    // Date Utc format: MM/DD/YYYY
    const dateParts = (row['Date Utc'] ?? '').split('/');
    const year = dateParts.length === 3 ? parseInt(dateParts[2]!) : NaN;
    if (!isNaN(year)) {
      if (year < acc.minYear) acc.minYear = year;
      if (year > acc.maxYear) acc.maxYear = year;
    }

    const orbit = row['Orbit Abbreviation']?.trim();
    if (orbit) acc.orbitTypes.add(orbit);
  }

  console.log(`  ${families.size} vehicle families found`);

  // Derive orbit diversity max from data
  const maxOrbitTypes = Math.max(...[...families.values()].map(a => a.orbitTypes.size));
  console.log(`  Max distinct orbit types (any family): ${maxOrbitTypes}`);

  // ── Build output rows ────────────────────────────────────────────────────

  // Long format: one row per (family, axis) — required by Infotopics Radar Chart.
  // Map Dimensions → Series, X-Axis → Axis, Measures → Value in the extension config.
  const outputHeaders = ['Series', 'Axis', 'Value'];
  const outputRows: string[][] = [];

  const cap = (v: number) => Math.min(v, 100);

  const axes: Array<{ label: string; compute: (acc: FamilyAccum) => number }> = [
    {
      label: 'Launch Count (Norm)',
      compute: acc => (acc.launchCount / MAX_LAUNCH_COUNT) * 100,
    },
    {
      label: 'Success Rate (0-100)',
      compute: acc => acc.launchCount > 0 ? (acc.successSum / acc.launchCount) * 100 : 0,
    },
    {
      label: 'LEO Capacity (Norm)',
      compute: acc => acc.leoCount > 0 ? (acc.leoSum / acc.leoCount / MAX_LEO_KG) * 100 : 0,
    },
    {
      label: 'Annual Cadence (Norm)',
      compute: acc => {
        const activeYears = (acc.minYear === Infinity || acc.maxYear === -Infinity)
          ? 1
          : acc.maxYear - acc.minYear + 1;
        return (acc.launchCount / activeYears / MAX_CADENCE) * 100;
      },
    },
    {
      label: 'Orbit Diversity (Norm)',
      compute: acc => (acc.orbitTypes.size / maxOrbitTypes) * 100,
    },
  ];

  for (const [family, acc] of [...families.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    for (const axis of axes) {
      outputRows.push([family, axis.label, cap(axis.compute(acc)).toFixed(2)]);
    }
  }

  // ── Write CSV ────────────────────────────────────────────────────────────

  const csvLines = [
    outputHeaders.join(','),
    ...outputRows.map(r => r.map(escapeField).join(',')),
  ];
  fs.writeFileSync(outputFile, csvLines.join('\n') + '\n', 'utf-8');

  console.log(`\nDone.`);
  console.log(`  Families: ${outputRows.length}`);
  console.log(`  Output:   ${outputFile}`);
}

function escapeField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// ── Entry point ───────────────────────────────────────────────────────────────

const inputFile  = '../spaceflight_data.csv';
const outputFile = '../radar_data.csv';

try {
  buildRadarCSV(inputFile, outputFile);
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}
