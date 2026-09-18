/**
 * Sanity-checks data/ports.json for duplicate primary keys and missing coordinates.
 * Usage: npx tsx scripts/check_duplicates.ts
 */

import fs from 'fs-extra';
import path from 'node:path';

interface Port {
    wpi_number: number;
    locode: string | null;
    name: string;
    latitude: number | null;
    longitude: number | null;
}

async function main(): Promise<void> {
    const ports: Port[] = await fs.readJson(path.join(__dirname, '../data/ports.json'));

    const seen = new Map<number, number>();
    for (const p of ports) {
        seen.set(p.wpi_number, (seen.get(p.wpi_number) ?? 0) + 1);
    }
    const dupes = [...seen.entries()].filter(([, count]) => count > 1);
    if (dupes.length > 0) {
        console.error('Duplicate wpi_number values found:', dupes);
        process.exitCode = 1;
    } else {
        console.log(`OK: all ${ports.length} wpi_number values are unique.`);
    }

    const missingCoords = ports.filter(p => p.latitude == null || p.longitude == null);
    if (missingCoords.length > 0) {
        console.error(`${missingCoords.length} ports missing coordinates:`, missingCoords.map(p => p.wpi_number));
        process.exitCode = 1;
    } else {
        console.log('OK: all ports have coordinates.');
    }
}

main();
