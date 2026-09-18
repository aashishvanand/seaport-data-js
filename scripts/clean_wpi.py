import json
import re
from collections import defaultdict, Counter

SRC = "/Users/aashishvanand/Code/seaport/data_source/wpi_april2025.geojson"
OUT = "/Users/aashishvanand/Code/seaport/data/ports.json"

MANUAL_ISO = {
    "Gibraltar": "GI",
    "Johnson Atoll": "UM",
    "Midway Islands": "UM",
    "Norfolk Island": "NF",
    "Palau": "PW",
    "Wake Island": "UM",
}

TRI = {"Yes": True, "No": False, "Unknown": None, "": None, " ": None, None: None}

def tri(v):
    if v is None:
        return None
    v = v.strip() if isinstance(v, str) else v
    return TRI.get(v, None)

REGION_SUFFIX_RE = re.compile(r"\s*--\s*\d+\s*$")

def clean_str(v):
    """Trim, collapse internal whitespace, and treat blank/'Unknown' as missing."""
    if v is None:
        return None
    if isinstance(v, str):
        v = re.sub(r"\s+", " ", v).strip()
        if not v or v == "Unknown":
            return None
        return v
    return v

def clean_region(v):
    """clean_str, plus strip the trailing WPI parent-region-id artifact (e.g. 'Iceland South Coast -- 490')."""
    v = clean_str(v)
    if v is None:
        return None
    v = REGION_SUFFIX_RE.sub("", v).strip()
    return v if v else None

def clean_num(v):
    if v is None:
        return None
    try:
        n = float(v)
    except (TypeError, ValueError):
        return None
    return None if n == 0 else n

def main():
    d = json.load(open(SRC))
    feats = d["features"]

    # --- build country name -> ISO alpha-2 map via majority vote on UN_LOCODE prefix
    votes = defaultdict(Counter)
    for f in feats:
        p = f["properties"]
        loc = (p.get("UN_LOCODE") or "").strip().replace(" ", "")
        name = (p.get("Country_Code") or "").strip()
        if len(loc) == 5:
            votes[name][loc[:2]] += 1
    country_iso = {name: counter.most_common(1)[0][0] for name, counter in votes.items()}
    country_iso.update(MANUAL_ISO)

    # --- dedupe by World_Port_Index_Number, keeping the record with more populated fields
    def completeness(props):
        return sum(1 for v in props.values() if v not in (None, "", " ", "Unknown", 0))

    best = {}
    for f in feats:
        p = f["properties"]
        wpi_num = p["World_Port_Index_Number"]
        if wpi_num not in best or completeness(p) > completeness(best[wpi_num]["properties"]):
            best[wpi_num] = f

    ports = []
    skipped_no_country = []
    for wpi_num, f in best.items():
        p = f["properties"]
        name = (p.get("Country_Code") or "").strip()
        iso = country_iso.get(name)
        if not iso:
            skipped_no_country.append(name)

        locode_raw = (p.get("UN_LOCODE") or "").strip().replace(" ", "")
        locode = locode_raw if len(locode_raw) == 5 else None

        port = {
            "wpi_number": wpi_num,
            "locode": locode,
            "name": clean_str(p.get("Main_Port_Name")),
            "alternate_name": clean_str(p.get("Alternate_Port_Name")),
            "country_code": iso,
            "country_name": name,
            "region": clean_region(p.get("Region_Name")),
            "water_body": clean_str(p.get("World_Water_Body")),
            "latitude": p.get("Latitude"),
            "longitude": p.get("Longitude"),

            "harbor_size": clean_str(p.get("Harbor_Size")),
            "harbor_type": clean_str(p.get("Harbor_Type")),
            "harbor_use": clean_str(p.get("Harbor_Use")),
            "shelter_afforded": clean_str(p.get("Shelter_Afforded")),

            "tidal_range_m": clean_num(p.get("Tidal_Range__m_")),
            "entrance_width_m": clean_num(p.get("Entrance_Width__m_")),
            "channel_depth_m": clean_num(p.get("Channel_Depth__m_")),
            "anchorage_depth_m": clean_num(p.get("Anchorage_Depth__m_")),
            "cargo_pier_depth_m": clean_num(p.get("Cargo_Pier_Depth__m_")),
            "oil_terminal_depth_m": clean_num(p.get("Oil_Terminal_Depth__m_")),
            "lng_terminal_depth_m": clean_num(p.get("Liquified_Natural_Gas_Terminal_")),
            "max_vessel_length_m": clean_num(p.get("Maximum_Vessel_Length__m_")),
            "max_vessel_beam_m": clean_num(p.get("Maximum_Vessel_Beam__m_")),
            "max_vessel_draft_m": clean_num(p.get("Maximum_Vessel_Draft__m_")),
            "offshore_max_vessel_length_m": clean_num(p.get("Offshore_Maximum_Vessel_Length_")),
            "offshore_max_vessel_beam_m": clean_num(p.get("Offshore_Maximum_Vessel_Beam__m")),
            "offshore_max_vessel_draft_m": clean_num(p.get("Offshore_Maximum_Vessel_Draft__")),

            "entrance_restriction_tide": tri(p.get("Entrance_Restriction___Tide")),
            "entrance_restriction_heavy_swell": tri(p.get("Entrance_Restriction___Heavy_Sw")),
            "entrance_restriction_ice": tri(p.get("Entrance_Restriction___Ice")),
            "entrance_restriction_other": tri(p.get("Entrance_Restriction___Other")),
            "overhead_limits": tri(p.get("Overhead_Limits")),
            "underkeel_clearance_mgmt": tri(p.get("Underkeel_Clearance_Management_")),
            "good_holding_ground": tri(p.get("Good_Holding_Ground")),
            "turning_area": tri(p.get("Turning_Area")),
            "port_security": tri(p.get("Port_Security")),
            "eta_message_required": tri(p.get("Estimated_Time_of_Arrival_Messa")),
            "quarantine_pratique": tri(p.get("Quarantine___Pratique")),
            "quarantine_sanitation": tri(p.get("Quarantine___Sanitation")),
            "quarantine_other": tri(p.get("Quarantine___Other")),
            "traffic_separation_scheme": tri(p.get("Traffic_Separation_Scheme")),
            "vessel_traffic_service": tri(p.get("Vessel_Traffic_Service")),
            "first_port_of_entry": tri(p.get("First_Port_of_Entry")),
            "us_representative": tri(p.get("US_Representative")),

            "pilotage_compulsory": tri(p.get("Pilotage___Compulsory")),
            "pilotage_available": tri(p.get("Pilotage___Available")),
            "pilotage_local_assistance": tri(p.get("Pilotage___Local_Assistance")),
            "pilotage_advisable": tri(p.get("Pilotage___Advisable")),
            "tugs_salvage": tri(p.get("Tugs___Salvage")),
            "tugs_assistance": tri(p.get("Tugs___Assistance")),

            "comm_telephone": tri(p.get("Communications___Telephone")),
            "comm_telefax": tri(p.get("Communications___Telefax")),
            "comm_radio": tri(p.get("Communications___Radio")),
            "comm_radiotelephone": tri(p.get("Communications___Radiotelephone")),
            "comm_airport": tri(p.get("Communications___Airport")),
            "comm_rail": tri(p.get("Communications___Rail")),
            "search_and_rescue": tri(p.get("Search_and_Rescue")),
            "navarea": clean_str(p.get("NAVAREA")),

            "facility_wharves": tri(p.get("Facilities___Wharves")),
            "facility_anchorage": tri(p.get("Facilities___Anchorage")),
            "facility_dangerous_cargo_anchorage": tri(p.get("Facilities___Dangerous_Cargo_An")),
            "facility_med_mooring": tri(p.get("Facilities___Med_Mooring")),
            "facility_beach_mooring": tri(p.get("Facilities___Beach_Mooring")),
            "facility_ice_mooring": tri(p.get("Facilities___Ice_Mooring")),
            "facility_ro_ro": tri(p.get("Facilities___Ro_Ro")),
            "facility_solid_bulk": tri(p.get("Facilities___Solid_Bulk")),
            "facility_liquid_bulk": tri(p.get("Facilities___Liquid_Bulk")),
            "facility_container": tri(p.get("Facilities___Container")),
            "facility_breakbulk": tri(p.get("Facilities___Breakbulk")),
            "facility_oil_terminal": tri(p.get("Facilities___Oil_Terminal")),
            "facility_lng_terminal": tri(p.get("Facilities___LNG_Terminal")),
            "facility_other": tri(p.get("Facilities___Other")),

            "medical_facilities": tri(p.get("Medical_Facilities")),
            "garbage_disposal": tri(p.get("Garbage_Disposal")),
            "chemical_holding_tank_disposal": tri(p.get("Chemical_Holding_Tank_Disposal")),
            "degaussing": tri(p.get("Degaussing")),
            "dirty_ballast_disposal": tri(p.get("Dirty_Ballast_Disposal")),

            "crane_fixed": tri(p.get("Cranes___Fixed")),
            "crane_mobile": tri(p.get("Cranes___Mobile")),
            "crane_floating": tri(p.get("Cranes___Floating")),
            "crane_container": tri(p.get("Cranes_Container")),
            "lift_over_100_tons": tri(p.get("Lifts___100__Tons")),
            "lift_50_100_tons": tri(p.get("Lifts___50_100_Tons")),
            "lift_25_49_tons": tri(p.get("Lifts___25_49_Tons")),
            "lift_0_24_tons": tri(p.get("Lifts___0_24_Tons")),

            "service_longshoremen": tri(p.get("Services___Longshoremen")),
            "service_electricity": tri(p.get("Services___Electricity")),
            "service_steam": tri(p.get("Services__Steam")),
            "service_navigation_equipment": tri(p.get("Services___Navigation_Equipment")),
            "service_electrical_repair": tri(p.get("Services___Electrical_Repair")),
            "service_ice_breaking": tri(p.get("Services___Ice_Breaking")),
            "service_diving": tri(p.get("Services__Diving")),

            "supply_provisions": tri(p.get("Supplies___Provisions")),
            "supply_potable_water": tri(p.get("Supplies___Potable_Water")),
            "supply_fuel_oil": tri(p.get("Supplies___Fuel_Oil")),
            "supply_diesel_oil": tri(p.get("Supplies___Diesel_Oil")),
            "supply_aviation_fuel": tri(p.get("Supplies___Aviation_Fuel")),
            "supply_deck": tri(p.get("Supplies___Deck")),
            "supply_engine": tri(p.get("Supplies___Engine")),

            "repairs": clean_str(p.get("Repairs")),
            "dry_dock": clean_str(p.get("Dry_Dock")),
            "railway": clean_str(p.get("Railway")),

            "sailing_directions": clean_str(p.get("Sailing_Direction_or_Publicatio")),
            "publication_link": clean_str(p.get("Publication_Link")),
            "standard_nautical_chart": clean_str(p.get("Standard_Nautical_Chart")),
            "digital_nautical_chart": clean_str(p.get("Digital_Nautical_Chart")),
        }
        ports.append(port)

    ports.sort(key=lambda x: x["wpi_number"])

    print("total input features:", len(feats))
    print("deduped to:", len(ports))
    print("countries missing ISO code:", set(skipped_no_country))
    print("ports missing locode:", sum(1 for p in ports if p["locode"] is None))

    import os
    os.makedirs("/Users/aashishvanand/Code/seaport/data", exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(ports, f, indent=None, separators=(",", ":"))
    print("wrote", OUT)

if __name__ == "__main__":
    main()
