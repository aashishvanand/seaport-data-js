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
export declare function getPortByLocode(locode?: string): Promise<Port[]>;
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
export declare function getPortsByCountryCode(countryCode?: string): Promise<Port[]>;
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
export declare function searchByName(query?: string): Promise<Port[]>;
/**
 * Returns up to 10 ports whose name starts with the given query, for autocomplete UIs.
 *
 * @param query - Partial search string.
 * @returns Array of up to 10 matching port objects.
 */
export declare function getAutocompleteSuggestions(query?: string): Promise<Port[]>;
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
export declare function findNearbyPorts(lat: number, lon: number, radiusKm?: number): Promise<PortWithDistance[]>;
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
export declare function findNearestPort(lat: number, lon: number, filters?: PortFilters): Promise<PortWithDistance | null>;
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
export declare function findPorts(filters?: PortFilters): Promise<Port[]>;
/**
 * Counts ports matching a combination of filters.
 *
 * @param filters - Filter criteria. See {@link PortFilters}.
 * @returns Number of matching ports.
 */
export declare function getPortCount(filters?: PortFilters): Promise<number>;
/**
 * Looks up multiple ports by their UN/LOCODEs in a single call.
 *
 * @param locodes - Array of UN/LOCODEs.
 * @returns Array of port objects (or null for codes with no match), same order and length as input.
 */
export declare function getMultiplePorts(locodes?: string[]): Promise<(Port | null)[]>;
/**
 * Computes the great-circle distance in kilometers between two ports.
 *
 * @param locode1 - UN/LOCODE of the first port.
 * @param locode2 - UN/LOCODE of the second port.
 * @returns Distance in kilometers, or null if either port isn't found.
 */
export declare function calculateDistance(locode1: string, locode2: string): Promise<number | null>;
/**
 * Computes a full pairwise distance matrix for a set of ports.
 *
 * @param locodes - Array of UN/LOCODEs.
 * @returns A {@link DistanceMatrix} with distances in kilometers, rounded to whole km.
 */
export declare function calculateDistanceMatrix(locodes?: string[]): Promise<DistanceMatrix>;
/**
 * Computes aggregated statistics for ports within a country.
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code.
 * @returns A {@link PortCountryStats} summary.
 */
export declare function getPortStatsByCountry(countryCode?: string): Promise<PortCountryStats>;
/**
 * Validates whether a string is a syntactically well-formed UN/LOCODE that exists in the dataset.
 *
 * @param code - The code to validate.
 * @returns True if the code exists in the dataset.
 */
export declare function validateLocode(code?: string): Promise<boolean>;
