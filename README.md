# seaport-data-js

A comprehensive TypeScript library for retrieving seaport data by UN/LOCODE, country, harbor characteristics, and facilities — sourced from the NGA World Port Index (Pub. 150). Includes LLM tool definitions for AI integration.

Sibling project to [airport-data-js](https://github.com/aashishvanand/airport-data-js).

## Install

```bash
npm install seaport-data-js
```

## Usage

```typescript
import { getPortByLocode, findPorts, findNearestPort } from 'seaport-data-js';

const [rotterdam] = await getPortByLocode('NLRTM');
console.log(rotterdam.name, rotterdam.channel_depth_m); // "Rotterdam" 11

const largeSgPorts = await findPorts({ country_code: 'SG', harbor_size: 'Large' });

const nearest = await findNearestPort(1.29, 103.85);
console.log(nearest?.name, nearest?.distance); // nearest port + km
```

### LLM tool-calling

```typescript
import { portTools } from 'seaport-data-js/tools';

const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    messages: [...],
    tools: portTools.map(t => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters,
    })),
});
```

## API

- `getPortByLocode(locode)` — look up by 5-character UN/LOCODE (e.g. `"SGKEP"`)
- `getPortsByCountryCode(countryCode)` — all ports in a country
- `searchByName(query)` — substring match on name/alternate name
- `getAutocompleteSuggestions(query)` — up to 10 prefix matches
- `findNearbyPorts(lat, lon, radiusKm?)` — ports within a radius, nearest-first
- `findNearestPort(lat, lon, filters?)` — single nearest match
- `findPorts(filters)` — combine filters (country, harbor size/type, min channel depth, container/dry dock/pilotage flags)
- `getPortCount(filters?)`
- `getMultiplePorts(locodes[])`
- `calculateDistance(locode1, locode2)`
- `calculateDistanceMatrix(locodes[])`
- `getPortStatsByCountry(countryCode)`
- `validateLocode(code)`

See `types/index.d.ts` for the full `Port` interface (harbor size/type, depths, pilotage, tugs, cranes, lifts, supplies, repairs, dry dock, etc.).

## Data

- **Source**: [NGA World Port Index](https://msi.nga.mil/Publications/WPI) (Pub. 150), April 2025 edition — a public-domain work of the U.S. Government. 3,802 ports after deduplication.
- **Primary key**: `wpi_number` (NGA's own stable port ID). `locode` (UN/LOCODE) is populated for ~88% of ports; minor terminals without an assigned LOCODE have `locode: null`.
- **Important**: most boolean facility/service fields (cranes, pilotage, supplies, etc.) use three states — `true`, `false`, or `null` (meaning "not recorded by NGA", not "absent"). Don't treat `null`/missing as `false` — WPI's own coverage of these fields is sparse for many smaller ports.
- Data is refreshed by re-running `scripts/clean_wpi.py` (or its future TS equivalent) against a fresh WPI pull and regenerating `data/ports.json` → `src/ports.data.json` via `npm run generate:compressed`.

## License

CC BY 4.0 for this compilation and the library code. The underlying World Port Index data is a U.S. Government work and is public domain. See `LICENSE`.
