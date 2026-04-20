# Spaceflight Visualizer

## Overview

Comprehensive historical spaceflight dataset spanning from 1957 to present day, combining data from the GCAT (General Catalog of Artificial Space Objects) and Launch Library 2 (LL2) sources. Contains 7,264 primary launches with 40 data columns covering launch vehicles, missions, payloads, orbital parameters, and booster recovery information.

## Data Sources

### GCAT (General Catalog of Artificial Space Objects)
- **Source**: Jonathan McDowell's GCAT database
- **URL**: https://planet4589.org/space/gcat/
- **Data**: Historical launch logs and orbital catalog from 1957-present
- **Coverage**: Launch vehicles, dates, sites, payloads, orbital parameters

### Launch Library 2 (LL2)
- **Source**: The Space Devs Launch Library 2 API
- **URL**: https://lldev.thespacedevs.com/2.2.0/
- **Data**: Modern launch records (primarily 2024-2026) with mission details, recovery data
- **Coverage**: Mission types, descriptions, booster recovery, landing vessel information

## Dataset Statistics

| Metric | Value |
|--------|-------|
| Total Launches | 7,264 |
| Columns | 40 |
| Date Range | 1957-10-04 to 2026-03-16 |
| With Location Data | 4,212 (58.0%) |
| With Orbital Parameters | 3,440 (47.4%) |
| With Recovery Data | 179 (2.5%) |
| LL2 Matched Records | 245 (3.4%) |
| Vehicle Meta Matched | 7,084 (97.5%) |

## Column Definitions

### Core Launch Information (9 columns)

| Column | Type | Description |
|--------|------|-------------|
| launch_tag | String | Unique mission identifier (e.g., "2024-001", "1957 ALP") |
| launch_date | Date | Launch date in YYYY-MM-DD format |
| launch_success | Boolean | True if launch reached intended orbit/target |
| launch_site | String | Launch facility code (e.g., "CC", "VSFBS", "KSC") |
| launch_pad | String | Specific launch pad designation |
| location | String | Full launch location name (e.g., "Cape Canaveral SFS, FL, USA") |
| launch_lat | Float | Launch site latitude coordinate (-90 to 90) |
| launch_lon | Float | Launch site longitude coordinate (-180 to 180) |
| platform | String | Launch platform type (e.g., "Ground", "Sea", "Air") |

### Vehicle Information (8 columns)

| Column | Type | Description |
|--------|------|-------------|
| vehicle_name | String | Launch vehicle designation (e.g., "Falcon 9", "Soyuz-2-1A") |
| provider | String | Aerospace company or organization (e.g., "SpaceX", "Roscosmos") |
| vehicle_country | String | Country code of vehicle origin (e.g., "USA", "RUS", "CHN") |
| engine_type | String | Primary engine model (e.g., "Merlin 1D", "RD-107A/108A") |
| propellant_1 | String | Primary propellant type (e.g., "RP-1", "LOX", "UDMH", "HTPB") |
| propellant_2 | String | Secondary propellant type (e.g., "LOX", "N2O4", "N/A") |
| reusable_first_stage | Boolean | True if first stage is designed for reuse |
| lv_state | String | Country state/region code for vehicle operations |

### Mission Information (6 columns)

| Column | Type | Description |
|--------|------|-------------|
| mission_name | String | Primary mission name/designation from GCAT (preferred source) |
| mission_type | String | Mission category from LL2 (e.g., "Communications", "Earth Science", "Human Exploration") |
| mission_description | String | Detailed mission objectives and payload information from LL2 |
| launch_agency | String | Government or private agency directing/funding the launch |
| flight_id | String | Unique flight identification number from GCAT |
| orbit_class | String | Orbital destination classification (e.g., "LEO", "GEO", "MEO", "Escape") |

### Payload Information (5 columns)

| Column | Type | Description |
|--------|------|-------------|
| payload_name | String | Name of primary satellite/payload |
| sat_owner | String | Organization owning the satellite/payload |
| sat_state | String | Country where payload is registered |
| orbit_name | String | Specific orbital type designation (e.g., "Low Earth Orbit", "Geostationary Transfer Orbit") |
| booster_serial | String | Unique serial number of the booster/first stage |

### Orbital Parameters (5 columns)

| Column | Type | Description |
|--------|------|-------------|
| perigee_km | Float | Closest point to Earth in achieved orbit (kilometers) |
| apogee_km | Float | Farthest point from Earth in achieved orbit (kilometers) |
| inclination_deg | Float | Orbital inclination angle relative to Earth's equator (0-180 degrees) |
| has_orbital_params | Boolean | Flag indicating orbital parameter data availability |
| data_complete | Boolean | Flag indicating record has both orbital and recovery data |

### Booster Recovery Information (6 columns)

| Column | Type | Description |
|--------|------|-------------|
| booster_flight_number | Integer | Number of times this specific booster has been flown |
| booster_reused | Boolean | True if booster has been reflown from previous mission |
| recovery_attempted | Boolean | True if recovery operation was attempted |
| recovery_success | Boolean | True if recovery operation succeeded |
| recovery_type | String | Recovery method (e.g., "RTLS", "ASDS", "Parachute", "Splashdown") |
| recovery_vessel | String | Name of ship or platform used in recovery |
| has_recovery_data | Boolean | Flag indicating recovery data availability |

## Files

- `Spaceflight_Data.csv` - Main dataset (7,264 rows × 40 columns)
- `build_data.py` - Data processing script
- `README.md` - This documentation
