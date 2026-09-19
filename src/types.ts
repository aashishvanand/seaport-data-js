export interface Port {
    wpi_number: number;
    locode: string | null;
    name: string | null;
    alternate_name: string | null;
    country_code: string | null;
    country_name: string | null;
    region: string | null;
    water_body: string | null;
    latitude: number;
    longitude: number;
    harbor_size: string | null;
    harbor_type: string | null;
    harbor_use: string | null;
    shelter_afforded: string | null;
    channel_depth_m: number | null;
    anchorage_depth_m: number | null;
    cargo_pier_depth_m: number | null;
    max_vessel_length_m: number | null;
    max_vessel_beam_m: number | null;
    max_vessel_draft_m: number | null;
    pilotage_compulsory: boolean | null;
    pilotage_available: boolean | null;
    facility_container: boolean | null;
    facility_dangerous_cargo_anchorage?: boolean | null;
    dry_dock: string | null;
    repairs: string | null;
    navarea: string | null;
    sailing_directions: string | null;
    publication_link: string | null;
    standard_nautical_chart: string | null;
    digital_nautical_chart: string | null;
    [key: string]: unknown;
}

export type SearchType = 'locode' | 'country' | 'name' | 'harbor_size' | 'harbor_type';
