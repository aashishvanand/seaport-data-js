import { ungzip } from 'pako';
import portsPayload from './ports.data.json';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Represents a single seaport record, sourced from the NGA World Port Index.
 *
 * @example
 * ```typescript
 * const [port] = await getPortByLocode('SGKEP');
 * console.log(port.name); // "Keppel - (East Singapore)"
 * console.log(port.country_code); // "SG"
 * ```
 */
export interface Port {
    /** NGA World Port Index number. Stable primary key for this dataset. */
    wpi_number: number;
    /** 5-character UN/LOCODE (2-letter country + 3-letter location), or null if never assigned */
    locode: string | null;
    /** Primary port name */
    name: string | null;
    /** Alternate/historical port name, if any */
    alternate_name: string | null;
    /** ISO 3166-1 alpha-2 country code */
    country_code: string | null;
    /** Full country name as published by NGA */
    country_name: string | null;
    /** NGA regional grouping (e.g. "India East Coast") */
    region: string | null;
    /** Body of water the port sits on */
    water_body: string | null;
    /** Latitude in decimal degrees */
    latitude: number;
    /** Longitude in decimal degrees */
    longitude: number;

    /** "Very Small" | "Small" | "Medium" | "Large" */
    harbor_size: string | null;
    /** e.g. "Coastal (Natural)", "River Natural", "Open Roadstead" */
    harbor_type: string | null;
    /** e.g. "Cargo", "Ferry", "Fishing", "Military" */
    harbor_use: string | null;
    /** "Poor" | "Fair" | "Good" | "Excellent" */
    shelter_afforded: string | null;

    tidal_range_m: number | null;
    entrance_width_m: number | null;
    channel_depth_m: number | null;
    anchorage_depth_m: number | null;
    cargo_pier_depth_m: number | null;
    oil_terminal_depth_m: number | null;
    lng_terminal_depth_m: number | null;
    max_vessel_length_m: number | null;
    max_vessel_beam_m: number | null;
    max_vessel_draft_m: number | null;
    offshore_max_vessel_length_m: number | null;
    offshore_max_vessel_beam_m: number | null;
    offshore_max_vessel_draft_m: number | null;

    entrance_restriction_tide: boolean | null;
    entrance_restriction_heavy_swell: boolean | null;
    entrance_restriction_ice: boolean | null;
    entrance_restriction_other: boolean | null;
    overhead_limits: boolean | null;
    underkeel_clearance_mgmt: boolean | null;
    good_holding_ground: boolean | null;
    turning_area: boolean | null;
    port_security: boolean | null;
    eta_message_required: boolean | null;
    quarantine_pratique: boolean | null;
    quarantine_sanitation: boolean | null;
    quarantine_other: boolean | null;
    traffic_separation_scheme: boolean | null;
    vessel_traffic_service: boolean | null;
    first_port_of_entry: boolean | null;
    us_representative: boolean | null;

    pilotage_compulsory: boolean | null;
    pilotage_available: boolean | null;
    pilotage_local_assistance: boolean | null;
    pilotage_advisable: boolean | null;
    tugs_salvage: boolean | null;
    tugs_assistance: boolean | null;

    comm_telephone: boolean | null;
    comm_telefax: boolean | null;
    comm_radio: boolean | null;
    comm_radiotelephone: boolean | null;
    comm_airport: boolean | null;
    comm_rail: boolean | null;
    search_and_rescue: boolean | null;
    /** NGA navigational area (Roman numeral, e.g. "XI") */
    navarea: string | null;

    facility_wharves: boolean | null;
    facility_anchorage: boolean | null;
    facility_dangerous_cargo_anchorage: boolean | null;
    facility_med_mooring: boolean | null;
    facility_beach_mooring: boolean | null;
    facility_ice_mooring: boolean | null;
    facility_ro_ro: boolean | null;
    facility_solid_bulk: boolean | null;
    facility_liquid_bulk: boolean | null;
    facility_container: boolean | null;
    facility_breakbulk: boolean | null;
    facility_oil_terminal: boolean | null;
    facility_lng_terminal: boolean | null;
    facility_other: boolean | null;

    medical_facilities: boolean | null;
    garbage_disposal: boolean | null;
    chemical_holding_tank_disposal: boolean | null;
    degaussing: boolean | null;
    dirty_ballast_disposal: boolean | null;

    crane_fixed: boolean | null;
    crane_mobile: boolean | null;
    crane_floating: boolean | null;
    crane_container: boolean | null;
    lift_over_100_tons: boolean | null;
    lift_50_100_tons: boolean | null;
    lift_25_49_tons: boolean | null;
    lift_0_24_tons: boolean | null;

    service_longshoremen: boolean | null;
    service_electricity: boolean | null;
    service_steam: boolean | null;
    service_navigation_equipment: boolean | null;
    service_electrical_repair: boolean | null;
    service_ice_breaking: boolean | null;
    service_diving: boolean | null;

    supply_provisions: boolean | null;
    supply_potable_water: boolean | null;
    supply_fuel_oil: boolean | null;
    supply_diesel_oil: boolean | null;
    supply_aviation_fuel: boolean | null;
    supply_deck: boolean | null;
    supply_engine: boolean | null;

    /** "None" | "Limited" | "Moderate" | "Major" | "Unknown" */
    repairs: string | null;
    /** Drydock capacity, e.g. "Small" | "Medium" | "Large" | "None" */
    dry_dock: string | null;
    /** Railway capacity, e.g. "Small" | "Medium" | "Large" | "None" */
    railway: string | null;

    sailing_directions: string | null;
    publication_link: string | null;
    standard_nautical_chart: string | null;
    digital_nautical_chart: string | null;
}

/**
 * A port record with distance from a reference point, returned by proximity search functions.
 *
 * @example
 * ```typescript
 * const nearest = await findNearestPort(1.35, 103.99);
 * console.log(nearest.distance); // 5.2 (km)
 * ```
 */
export interface PortWithDistance extends Port {
    /** Distance from the search point in kilometers */
    distance: number;
}

/**
 * Filter criteria for searching ports. All fields are optional and combined with AND logic.
 *
 * @example
 * ```typescript
 * // Find large, natural-harbor ports in Singapore with container facilities
 * const ports = await findPorts({
 *     country_code: 'SG',
 *     harbor_size: 'Large',
 *     has_container_facility: true
 * });
 * ```
 */
export interface PortFilters {
    locode?: string;
    country_code?: string;
    harbor_size?: string;
    harbor_type?: string;
    harbor_use?: string;
    shelter_afforded?: string;
    navarea?: string;
    /** Minimum channel depth in meters */
    min_channel_depth_m?: number;
    /** Filter to ports with any pilotage available */
    has_pilotage?: boolean;
    /** Filter to ports with container handling facilities */
    has_container_facility?: boolean;
    /** Filter to ports with dry dock facilities ("Small"/"Medium"/"Large") */
    has_dry_dock?: boolean;
}

/**
 * Aggregated statistics for ports in a country.
 *
 * @example
 * ```typescript
 * const stats = await getPortStatsByCountry('US');
 * console.log(stats.total);
 * console.log(stats.byHarborSize.Large);
 * ```
 */
export interface PortCountryStats {
    /** Total number of ports */
    total: number;
    /** Count of ports grouped by harbor size */
    byHarborSize: Record<string, number>;
    /** Count of ports grouped by harbor type */
    byHarborType: Record<string, number>;
    /** Number of ports with container handling facilities */
    withContainerFacility: number;
}

/**
 * Result of a distance matrix calculation between multiple ports.
 *
 * @example
 * ```typescript
 * const matrix = await calculateDistanceMatrix(['SGKEP', 'NLRTM', 'USNYC']);
 * console.log(matrix.distances['SGKEP']['NLRTM']); // km
 * ```
 */
export interface DistanceMatrix {
    /** Summary info for each port in the matrix */
    ports: Array<{
        locode: string;
        name: string | null;
    }>;
    /** Symmetric distance matrix: distances[locodeA][locodeB] = km (rounded) */
    distances: Record<string, Record<string, number>>;
}

// ============================================================================
// Internal State
// ============================================================================

let portsData: Port[] | null = null;
let locodeIndex: Map<string, Port[]> | null = null;
let countryIndex: Map<string, Port[]> | null = null;
let harborSizeIndex: Map<string, Port[]> | null = null;
let harborTypeIndex: Map<string, Port[]> | null = null;

interface GeoEntry {
    lat: number;
    lon: number;
    index: number;
}

let geoData: GeoEntry[] | null = null;

const DEG_TO_RAD: number = Math.PI / 180;
const EARTH_RADIUS_KM: number = 6371;

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Converts degrees to radians.
 * @private
 */
function toRad(deg: number): number {
    return deg * DEG_TO_RAD;
}

/**
 * Computes the Haversine great-circle distance between two points.
 * @private
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
}

/**
 * Decodes a base64 string into raw bytes.
 * Uses the `atob` global, available in both Node.js (16+) and browsers.
 * @private
 */
function base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

/**
 * Decompresses the gzipped port data into a usable array.
 * Lazy loads the data on first access.
 * @private
 */
function getData(): Port[] {
    if (!portsData) {
        const bytes = base64ToBytes(portsPayload.gzip);
        const json = ungzip(bytes, { toText: true } as const);
        portsData = JSON.parse(json) as Port[];
    }
    return portsData;
}

/**
 * Pre-computes geographic data (parsed lat/lon) for all ports.
 * @private
 */
function getGeoData(): GeoEntry[] {
    if (!geoData) {
        const data = getData();
        geoData = [];
        for (let i = 0; i < data.length; i++) {
            const port = data[i];
            const { latitude: lat, longitude: lon } = port;
            if (typeof lat === 'number' && typeof lon === 'number' && isFinite(lat) && isFinite(lon)) {
                geoData.push({ lat, lon, index: i });
            }
        }
    }
    return geoData;
}

/**
 * Builds and returns an index of ports by UN/LOCODE.
 * @private
 */
function getLocodeIndex(): Map<string, Port[]> {
    if (!locodeIndex) {
        const data = getData();
        locodeIndex = new Map();
        data.forEach(port => {
            if (port.locode) {
                if (!locodeIndex!.has(port.locode)) {
                    locodeIndex!.set(port.locode, []);
                }
                locodeIndex!.get(port.locode)!.push(port);
            }
        });
    }
    return locodeIndex;
}

/**
 * Builds and returns an index of ports by country code.
 * @private
 */
function getCountryIndex(): Map<string, Port[]> {
    if (!countryIndex) {
        const data = getData();
        countryIndex = new Map();
        data.forEach(port => {
            if (port.country_code) {
                if (!countryIndex!.has(port.country_code)) {
                    countryIndex!.set(port.country_code, []);
                }
                countryIndex!.get(port.country_code)!.push(port);
            }
        });
    }
    return countryIndex;
}

/**
 * Builds and returns an index of ports by harbor size.
 * @private
 */
function getHarborSizeIndex(): Map<string, Port[]> {
    if (!harborSizeIndex) {
        const data = getData();
        harborSizeIndex = new Map();
        data.forEach(port => {
            if (port.harbor_size) {
                if (!harborSizeIndex!.has(port.harbor_size)) {
                    harborSizeIndex!.set(port.harbor_size, []);
                }
                harborSizeIndex!.get(port.harbor_size)!.push(port);
            }
        });
    }
    return harborSizeIndex;
}

/**
 * Builds and returns an index of ports by harbor type.
 * @private
 */
function getHarborTypeIndex(): Map<string, Port[]> {
    if (!harborTypeIndex) {
        const data = getData();
        harborTypeIndex = new Map();
        data.forEach(port => {
            if (port.harbor_type) {
                if (!harborTypeIndex!.has(port.harbor_type)) {
                    harborTypeIndex!.set(port.harbor_type, []);
                }
                harborTypeIndex!.get(port.harbor_type)!.push(port);
            }
        });
    }
    return harborTypeIndex;
}

/**
 * Returns a shallow copy of a port object to prevent mutation of cached data.
 * @private
 */
function copyPort(port: Port): Port {
    return { ...port };
}

/**
 * Returns shallow copies of an array of port objects.
 * @private
 */
function copyPorts(ports: Port[]): Port[] {
    return ports.map(p => ({ ...p }));
}

/**
 * Validates a string against a regular expression and throws an error if it doesn't match.
 * @private
 */
function validateRegex(data: string, regex: RegExp, errorMessage: string): void {
    if (!regex.test(data)) {
        throw new Error(errorMessage);
    }
}

/**
 * Normalizes a UN/LOCODE for lookup: uppercase, strip whitespace.
 * @private
 */
function normalizeLocode(locode: string): string {
    return locode.toUpperCase().replace(/\s+/g, '');
}

/**
 * Set of allowed filter keys to prevent prototype pollution.
 * @private
 */
const ALLOWED_FILTER_KEYS = new Set<string>([
    'locode', 'country_code', 'harbor_size', 'harbor_type', 'harbor_use',
    'shelter_afforded', 'navarea', 'min_channel_depth_m', 'has_pilotage',
    'has_container_facility', 'has_dry_dock'
]);

/**
 * Internal implementation of findPorts that returns references (no copies).
 * @private
 */
function _findPortsInternal(filters: PortFilters = {}): Port[] {
    const filterKeys = Object.keys(filters);
    for (const key of filterKeys) {
        if (!ALLOWED_FILTER_KEYS.has(key)) {
            throw new Error(`Unrecognized filter key: '${key}'. Allowed keys: ${[...ALLOWED_FILTER_KEYS].join(', ')}`);
        }
    }

    let candidateSet: Port[] | null = null;

    for (const key of filterKeys) {
        const filterValue = (filters as Record<string, unknown>)[key];
        let indexed: Port[] | null = null;

        switch (key) {
            case 'locode':
                indexed = getLocodeIndex().get(normalizeLocode(filterValue as string)) || [];
                break;
            case 'country_code':
                indexed = getCountryIndex().get(filterValue as string) || [];
                break;
            case 'harbor_size':
                indexed = getHarborSizeIndex().get(filterValue as string) || [];
                break;
            case 'harbor_type':
                indexed = getHarborTypeIndex().get(filterValue as string) || [];
                break;
        }

        if (indexed !== null) {
            if (candidateSet === null) {
                candidateSet = indexed;
            } else {
                const refSet = new Set(indexed);
                candidateSet = candidateSet.filter(p => refSet.has(p));
            }
        }
    }

    const ports = candidateSet !== null ? candidateSet : getData();
    const indexedKeys = new Set(['locode', 'country_code', 'harbor_size', 'harbor_type']);

    const results = ports.filter(port => {
        for (const key of filterKeys) {
            const filterValue = (filters as Record<string, unknown>)[key];

            if (indexedKeys.has(key)) {
                if (candidateSet !== null) continue;
                if ((port as unknown as Record<string, unknown>)[key] !== filterValue) return false;
                continue;
            }

            switch (key) {
                case 'harbor_use':
                case 'shelter_afforded':
                case 'navarea':
                    if ((port as unknown as Record<string, unknown>)[key] !== filterValue) return false;
                    break;

                case 'min_channel_depth_m':
                    if ((port.channel_depth_m ?? 0) < (filterValue as number)) return false;
                    break;

                case 'has_pilotage':
                    if (Boolean(port.pilotage_available) !== (filterValue as boolean)) return false;
                    break;

                case 'has_container_facility':
                    if (Boolean(port.facility_container) !== (filterValue as boolean)) return false;
                    break;

                case 'has_dry_dock': {
                    const hasDryDock = Boolean(port.dry_dock && port.dry_dock !== 'None' && port.dry_dock !== 'Unknown');
                    if (hasDryDock !== (filterValue as boolean)) return false;
                    break;
                }
            }
        }
        return true;
    });

    return results;
}

// ============================================================================
// Core Search Functions
// ============================================================================

/**
 * Finds ports by their 5-character UN/LOCODE.
 *
 * @param locode - The UN/LOCODE of the port (e.g., 'SGKEP').
 * @returns Array of matching port objects.
 * @throws If the LOCODE format is invalid.
 *
 * @example
 * ```typescript
 * const [port] = await getPortByLocode('SGKEP');
 * console.log(port.name); // "Keppel - (East Singapore)"
 * ```
 */
export async function getPortByLocode(locode: string = ''): Promise<Port[]> {
    const normalized = normalizeLocode(locode);
    validateRegex(normalized, /^[A-Z]{2}[A-Z0-9]{3}$/, "Invalid UN/LOCODE format. Please provide a 5-character code, e.g., 'SGKEP'.");
    const results = getLocodeIndex().get(normalized) || [];
    return copyPorts(results);
}

/**
 * Finds all ports in a given country.
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'SG').
 * @returns Array of matching port objects.
 *
 * @example
 * ```typescript
 * const ports = await getPortsByCountryCode('SG');
 * ```
 */
export async function getPortsByCountryCode(countryCode: string = ''): Promise<Port[]> {
    validateRegex(countryCode, /^[A-Z]{2}$/, "Invalid country code format. Please provide a 2-letter uppercase ISO code, e.g., 'SG'.");
    const results = getCountryIndex().get(countryCode) || [];
    return copyPorts(results);
}

/**
 * Searches for ports by name (case-insensitive substring match against name and alternate_name).
 *
 * @param query - Search string.
 * @returns Array of matching port objects.
 *
 * @example
 * ```typescript
 * const results = await searchByName('rotterdam');
 * ```
 */
export async function searchByName(query: string = ''): Promise<Port[]> {
    if (!query || query.trim().length === 0) return [];
    const lowerQuery = query.toLowerCase();
    const data = getData();
    const results = data.filter(port =>
        (port.name && port.name.toLowerCase().includes(lowerQuery)) ||
        (port.alternate_name && port.alternate_name.toLowerCase().includes(lowerQuery))
    );
    return copyPorts(results);
}

/**
 * Returns up to 10 ports whose name starts with the given query, for autocomplete UIs.
 *
 * @param query - Partial search string.
 * @returns Array of up to 10 matching port objects.
 */
export async function getAutocompleteSuggestions(query: string = ''): Promise<Port[]> {
    if (!query || query.trim().length === 0) return [];
    const lowerQuery = query.toLowerCase();
    const data = getData();
    const results = data.filter(port => port.name && port.name.toLowerCase().startsWith(lowerQuery)).slice(0, 10);
    return copyPorts(results);
}

/**
 * Finds ports within a given radius of a geographic point.
 *
 * @param lat - Latitude in decimal degrees.
 * @param lon - Longitude in decimal degrees.
 * @param radiusKm - Search radius in kilometers (default 100).
 * @returns Array of matching ports, each annotated with a `distance` field, sorted nearest-first.
 *
 * @example
 * ```typescript
 * const nearby = await findNearbyPorts(1.29, 103.85, 50);
 * ```
 */
export async function findNearbyPorts(lat: number, lon: number, radiusKm: number = 100): Promise<PortWithDistance[]> {
    const data = getData();
    const geo = getGeoData();
    const results: PortWithDistance[] = [];

    for (const entry of geo) {
        const distance = haversineDistance(lat, lon, entry.lat, entry.lon);
        if (distance <= radiusKm) {
            results.push({ ...copyPort(data[entry.index]), distance: Math.round(distance * 100) / 100 });
        }
    }

    results.sort((a, b) => a.distance - b.distance);
    return results;
}

/**
 * Finds the single nearest port to a geographic point, optionally constrained by filters.
 *
 * @param lat - Latitude in decimal degrees.
 * @param lon - Longitude in decimal degrees.
 * @param filters - Optional filters to constrain the search (e.g. minimum channel depth).
 * @returns The nearest matching port with a `distance` field, or null if none found.
 *
 * @example
 * ```typescript
 * const nearest = await findNearestPort(1.35, 103.99);
 * ```
 */
export async function findNearestPort(lat: number, lon: number, filters: PortFilters = {}): Promise<PortWithDistance | null> {
    const candidates = Object.keys(filters).length > 0 ? _findPortsInternal(filters) : getData();
    let nearest: Port | null = null;
    let nearestDistance = Infinity;

    for (const port of candidates) {
        if (typeof port.latitude !== 'number' || typeof port.longitude !== 'number') continue;
        const distance = haversineDistance(lat, lon, port.latitude, port.longitude);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearest = port;
        }
    }

    if (!nearest) return null;
    return { ...copyPort(nearest), distance: Math.round(nearestDistance * 100) / 100 };
}

/**
 * Finds ports matching a combination of filters (AND logic).
 *
 * @param filters - Filter criteria. See {@link PortFilters}.
 * @returns Array of matching port objects.
 *
 * @example
 * ```typescript
 * const ports = await findPorts({ country_code: 'NL', harbor_size: 'Large' });
 * ```
 */
export async function findPorts(filters: PortFilters = {}): Promise<Port[]> {
    return copyPorts(_findPortsInternal(filters));
}

/**
 * Counts ports matching a combination of filters.
 *
 * @param filters - Filter criteria. See {@link PortFilters}.
 * @returns Number of matching ports.
 */
export async function getPortCount(filters: PortFilters = {}): Promise<number> {
    return _findPortsInternal(filters).length;
}

/**
 * Looks up multiple ports by their UN/LOCODEs in a single call.
 *
 * @param locodes - Array of UN/LOCODEs.
 * @returns Array of port objects (or null for codes with no match), same order and length as input.
 */
export async function getMultiplePorts(locodes: string[] = []): Promise<(Port | null)[]> {
    const index = getLocodeIndex();
    return locodes.map(code => {
        const normalized = normalizeLocode(code);
        const results = index.get(normalized);
        return results && results.length > 0 ? copyPort(results[0]) : null;
    });
}

/**
 * Computes the great-circle distance in kilometers between two ports.
 *
 * @param locode1 - UN/LOCODE of the first port.
 * @param locode2 - UN/LOCODE of the second port.
 * @returns Distance in kilometers, or null if either port isn't found.
 */
export async function calculateDistance(locode1: string, locode2: string): Promise<number | null> {
    const index = getLocodeIndex();
    const a = index.get(normalizeLocode(locode1))?.[0];
    const b = index.get(normalizeLocode(locode2))?.[0];
    if (!a || !b) return null;
    return Math.round(haversineDistance(a.latitude, a.longitude, b.latitude, b.longitude) * 100) / 100;
}

/**
 * Computes a full pairwise distance matrix for a set of ports.
 *
 * @param locodes - Array of UN/LOCODEs.
 * @returns A {@link DistanceMatrix} with distances in kilometers, rounded to whole km.
 */
export async function calculateDistanceMatrix(locodes: string[] = []): Promise<DistanceMatrix> {
    const index = getLocodeIndex();
    const resolved = locodes
        .map(code => ({ code: normalizeLocode(code), port: index.get(normalizeLocode(code))?.[0] ?? null }))
        .filter((entry): entry is { code: string; port: Port } => entry.port !== null);

    const ports = resolved.map(({ code, port }) => ({ locode: code, name: port.name }));
    const distances: Record<string, Record<string, number>> = {};

    for (const a of resolved) {
        distances[a.code] = {};
        for (const b of resolved) {
            distances[a.code][b.code] = a.code === b.code
                ? 0
                : Math.round(haversineDistance(a.port.latitude, a.port.longitude, b.port.latitude, b.port.longitude));
        }
    }

    return { ports, distances };
}

/**
 * Computes aggregated statistics for ports within a country.
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code.
 * @returns A {@link PortCountryStats} summary.
 */
export async function getPortStatsByCountry(countryCode: string = ''): Promise<PortCountryStats> {
    validateRegex(countryCode, /^[A-Z]{2}$/, "Invalid country code format. Please provide a 2-letter uppercase ISO code, e.g., 'SG'.");
    const ports = getCountryIndex().get(countryCode) || [];

    const byHarborSize: Record<string, number> = {};
    const byHarborType: Record<string, number> = {};
    let withContainerFacility = 0;

    for (const port of ports) {
        if (port.harbor_size) byHarborSize[port.harbor_size] = (byHarborSize[port.harbor_size] ?? 0) + 1;
        if (port.harbor_type) byHarborType[port.harbor_type] = (byHarborType[port.harbor_type] ?? 0) + 1;
        if (port.facility_container) withContainerFacility++;
    }

    return { total: ports.length, byHarborSize, byHarborType, withContainerFacility };
}

/**
 * Validates whether a string is a syntactically well-formed UN/LOCODE that exists in the dataset.
 *
 * @param code - The code to validate.
 * @returns True if the code exists in the dataset.
 */
export async function validateLocode(code: string = ''): Promise<boolean> {
    if (typeof code !== 'string') return false;
    const normalized = normalizeLocode(code);
    if (!/^[A-Z]{2}[A-Z0-9]{3}$/.test(normalized)) return false;
    return getLocodeIndex().has(normalized);
}
