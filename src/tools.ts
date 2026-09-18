/**
 * @module seaport-data/tools
 *
 * Pre-built JSON Schema tool definitions for all seaport-data functions.
 * Use these with LLM tool-calling frameworks like OpenAI function calling,
 * Anthropic tool use, Vercel AI SDK, or LangChain.
 *
 * @example
 * ```typescript
 * import { portTools } from 'seaport-data-js/tools';
 *
 * // OpenAI function calling
 * const response = await openai.chat.completions.create({
 *     model: 'gpt-4',
 *     messages: [...],
 *     tools: portTools.map(t => ({ type: 'function', function: t })),
 * });
 *
 * // Anthropic tool use
 * const response = await anthropic.messages.create({
 *     model: 'claude-sonnet-4-20250514',
 *     messages: [...],
 *     tools: portTools.map(t => ({
 *         name: t.name,
 *         description: t.description,
 *         input_schema: t.parameters,
 *     })),
 * });
 * ```
 */

export interface ToolDefinition {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, {
            type: string;
            description: string;
            enum?: string[];
            items?: { type: string };
            default?: unknown;
            minimum?: number;
            maximum?: number;
        }>;
        required: string[];
    };
}

export const portTools: ToolDefinition[] = [
    {
        name: 'getPortByLocode',
        description: 'Look up a seaport by its 5-character UN/LOCODE (2-letter country code + 3-letter location code, e.g. "SGKEP" for Keppel/Singapore, "NLRTM" for Rotterdam). Returns full port details including location, harbor characteristics, and facilities.',
        parameters: {
            type: 'object',
            properties: {
                locode: {
                    type: 'string',
                    description: '5-character UN/LOCODE (e.g., "SGKEP", "NLRTM", "USNYC")'
                }
            },
            required: ['locode']
        }
    },
    {
        name: 'getPortsByCountryCode',
        description: 'List all seaports in a given country.',
        parameters: {
            type: 'object',
            properties: {
                countryCode: {
                    type: 'string',
                    description: '2-letter uppercase ISO 3166-1 alpha-2 country code (e.g., "SG", "NL", "US")'
                }
            },
            required: ['countryCode']
        }
    },
    {
        name: 'searchByName',
        description: 'Search for seaports by name or alternate name using a case-insensitive substring match.',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Search text, e.g. "rotterdam"'
                }
            },
            required: ['query']
        }
    },
    {
        name: 'findNearbyPorts',
        description: 'Find all seaports within a given radius of a geographic point, sorted by distance.',
        parameters: {
            type: 'object',
            properties: {
                lat: { type: 'number', description: 'Latitude in decimal degrees' },
                lon: { type: 'number', description: 'Longitude in decimal degrees' },
                radiusKm: { type: 'number', description: 'Search radius in kilometers', default: 100 }
            },
            required: ['lat', 'lon']
        }
    },
    {
        name: 'findNearestPort',
        description: 'Find the single nearest seaport to a geographic point, optionally constrained by filters such as minimum channel depth or harbor size.',
        parameters: {
            type: 'object',
            properties: {
                lat: { type: 'number', description: 'Latitude in decimal degrees' },
                lon: { type: 'number', description: 'Longitude in decimal degrees' },
                country_code: { type: 'string', description: 'Restrict to a 2-letter ISO country code' },
                harbor_size: { type: 'string', description: 'Restrict to a harbor size', enum: ['Very Small', 'Small', 'Medium', 'Large'] },
                min_channel_depth_m: { type: 'number', description: 'Minimum channel depth in meters' }
            },
            required: ['lat', 'lon']
        }
    },
    {
        name: 'findPorts',
        description: 'Find seaports matching a combination of filters (harbor size/type, country, minimum channel depth, container facilities, dry dock, pilotage availability). All provided filters are combined with AND logic.',
        parameters: {
            type: 'object',
            properties: {
                country_code: { type: 'string', description: '2-letter ISO country code' },
                harbor_size: { type: 'string', description: 'Harbor size', enum: ['Very Small', 'Small', 'Medium', 'Large'] },
                harbor_type: { type: 'string', description: 'Harbor type, e.g. "Coastal (Natural)", "River Natural"' },
                harbor_use: { type: 'string', description: 'Harbor use, e.g. "Cargo", "Ferry", "Fishing"' },
                min_channel_depth_m: { type: 'number', description: 'Minimum channel depth in meters' },
                has_pilotage: { type: 'boolean', description: 'Only ports where pilotage is available' },
                has_container_facility: { type: 'boolean', description: 'Only ports with container handling facilities' },
                has_dry_dock: { type: 'boolean', description: 'Only ports with dry dock facilities' }
            },
            required: []
        }
    },
    {
        name: 'calculateDistance',
        description: 'Calculate the great-circle distance in kilometers between two seaports given their UN/LOCODEs.',
        parameters: {
            type: 'object',
            properties: {
                locode1: { type: 'string', description: 'UN/LOCODE of the first port' },
                locode2: { type: 'string', description: 'UN/LOCODE of the second port' }
            },
            required: ['locode1', 'locode2']
        }
    },
    {
        name: 'getPortStatsByCountry',
        description: 'Get aggregated statistics (counts by harbor size/type, container facility availability) for all seaports in a country.',
        parameters: {
            type: 'object',
            properties: {
                countryCode: { type: 'string', description: '2-letter uppercase ISO 3166-1 alpha-2 country code' }
            },
            required: ['countryCode']
        }
    },
    {
        name: 'validateLocode',
        description: 'Check whether a UN/LOCODE is well-formed and exists in the seaport dataset.',
        parameters: {
            type: 'object',
            properties: {
                code: { type: 'string', description: 'The UN/LOCODE to validate' }
            },
            required: ['code']
        }
    }
];
