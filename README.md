# Spaceflight Visualizer

A data collection and visualization project for spaceflight launches, powered by The Space Devs' Launch Library 2 (LL2) API.

## Data Source

**API:** Launch Library 2 (LL2) - [ll.thespacedevs.com/2.2.0](https://ll.thespacedevs.com/2.2.0)

The LL2 API provides comprehensive, real-time data about space launches, vehicles, agencies, and related missions. Data is collected and aggregated from multiple authoritative sources including space agencies, launch providers, and aerospace databases.

For practical use, this requires an API key (set via `LL2_API_KEY` environment variable). Rate limiting applies; without a key the collector includes automatic retry logic with exponential backoff.

## Data Structure

The collected data is stored in `spaceflight_data.json` as a nested object where each key represents a launch record (e.g., `Launch_0001`, `Launch_0002`, etc.). Each launch record contains six major categories of information.

The collector only writes launches whose LL2 status is terminal (`Success`, `Failure`, or `Partial Failure`); in-flight or scheduled launches are skipped.

In the tables below, the **Type** column calls out machine-friendly formats, known discrete values produced by this project, or typical LL2 string shapes where helpful.

### General Info

| Attribute | Type | Description |
|-----------|------|-------------|
| `launch_id` | string (UUID) | Unique identifier for the launch |
| `launch_name` | string | Human-readable name of the launch (vehicle \| mission) |
| `slug` | string (kebab-case) | URL-friendly identifier for the launch |
| `date_utc` | string `MM/DD/YYYY` | Launch calendar date (UTC) |
| `launch_time_utc` | string `HH:MM:SS UTC` | Launch wall-clock time (UTC) |
| `window_start` | string \| null | Start of launch window as `MM/DD/YYYY` when LL2 provides `window_start` |
| `window_end` | string \| null | End of launch window as `MM/DD/YYYY` when LL2 provides `window_end` |
| `net_precision` | string \| null | LL2 NET precision label (free text from `net_precision.name`; often `null`) |
| `outcome` | `"Success"` \| `"Failure"` \| `"Partial Failure"` | Mapped from LL2 `status.id` (`3`, `4`, `7`); other statuses are not exported |
| `outcome_detail` | string \| null | LL2 `failreason` when present |
| `hold_reason` | string \| null | LL2 `holdreason` (may be empty string from API) |
| `weather_concerns` | string \| null | LL2 `weather_concerns` |
| `launch_site.name` | string | Launch pad identifier |
| `launch_site.location` | string | Launch facility location and country |
| `launch_site.country_code` | string (ISO 3166-1 alpha-3) | Pad country code when set; else from `location.country_code` |
| `launch_site.timezone` | string (IANA) | Timezone of the launch site (e.g. `America/New_York`) |
| `launch_site.latitude` | number \| null | Parsed from LL2 string latitude when present |
| `launch_site.longitude` | number \| null | Parsed from LL2 string longitude when present |
| `launch_site.map_url` | string \| null | Map URL when LL2 provides `map_url` |
| `launch_site.total_pad_launches` | number (≥ 0) | Total launches from this specific pad |
| `launch_site.total_location_launches` | number (≥ 0) | Total launches from this location/facility |
| `launch_site.total_location_landings` | number (≥ 0) | Total landings at this location |
| `pad_turnaround_days` | number \| null | Fractional days from ISO 8601 `pad_turnaround` (e.g. `P14DT6H`) |
| `webcast_live` | boolean | Whether LL2 marks a live webcast |
| `image_url` | string \| null | URL to launch image/photo |
| `mission_patch_url` | string \| null | URL to mission patch image |
| `info_url` | string \| null | URL to additional information |
| `video_url` | string \| null | URL to video (typically YouTube) |
| `flightclub_url` | string \| null | URL to Flight Club tracking page |
| `program` | string \| null | Space program name (e.g., "Artemis", "Starlink") |
| `program_type` | string \| null | LL2 program type `name` when nested object exists |
| `hashtag` | string \| null | Associated social media hashtag |
| `orbital_launch_count_all_time` | number \| null | All-time orbital launch count for this provider |
| `orbital_launch_count_ytd` | number \| null | Orbital launch count year-to-date for this provider |
| `pad_launch_count_all_time` | number \| null | All-time launch count for this specific pad |
| `agency_launch_count_all_time` | number \| null | All-time launch count for this agency |
| `agency_launch_count_ytd` | number \| null | Year-to-date launch count for this agency |
| `last_updated` | string (ISO 8601) | Timestamp of last LL2 update |

### Vehicle Information

| Attribute | Type | Description |
|-----------|------|-------------|
| `vehicle_name` | string | Short name of the launch vehicle/rocket |
| `vehicle_full_name` | string \| null | Complete name of the launch vehicle |
| `vehicle_family` | string \| null | Rocket family designation (e.g., "Falcon", "Atlas", "Soyuz") |
| `vehicle_variant` | string \| null | Specific variant of the vehicle |
| `vehicle_alias` | string \| null | Alternative names for the vehicle |
| `vehicle_active` | boolean | Whether the vehicle is currently in active service |
| `launch_provider` | string | Organization providing the launch service |
| `provider_type` | string \| null | LL2 agency `type` (common values include `"Government"`, `"Commercial"`, `"Multinational"`, `"Private"`) |
| `provider_country` | string \| null | ISO 3166-1 alpha-3 country code of the provider |
| `provider_total_launches` | number (≥ 0) | Total launch attempts by this provider |
| `provider_successful_launches` | number (≥ 0) | Successful launches by this provider |
| `provider_failed_launches` | number (≥ 0) | Failed launches by this provider |
| `provider_consecutive_successes` | number (≥ 0) | Current streak of consecutive successful launches |
| `manufacturer` | string | Company that built/manufactured the rocket |
| `manufacturer_country` | string \| null | ISO 3166-1 alpha-3 country code of manufacturer |
| `engine_type` | string | Heuristic lookup from known vehicle names (e.g. `"Merlin 1D"`, `"RD-107A / RD-0110"`, `"Unknown"`) |
| `propellants` | string | Heuristic lookup from known vehicle names (e.g. `"RP-1/LOX"`, `"LH2/LOX (Hydrolox)"`, `"Unknown"`) |
| `reusable` | boolean | LL2 launcher configuration `reusable` |
| `min_stages` | number \| null | Minimum number of stages |
| `max_stages` | number \| null | Maximum number of stages |
| `length_m` | number \| null | Vehicle length in meters |
| `diameter_m` | number \| null | Vehicle diameter in meters |
| `launch_mass_t` | number \| null | Launch mass in metric tons |
| `leo_capacity_kg` | number \| null | Low Earth Orbit payload capacity in kg |
| `gto_capacity_kg` | number \| null | Geostationary Transfer Orbit payload capacity in kg |
| `total_thrust_kn` | number \| null | Total thrust in kilonewtons |
| `launch_cost_usd` | string \| null | LL2 `launch_cost` (string payload from API) |
| `vehicle_total_launches` | number (≥ 0) | Total launches of this vehicle model |
| `vehicle_successful_launches` | number (≥ 0) | Successful launches of this vehicle model |
| `vehicle_failed_launches` | number (≥ 0) | Failed launches of this vehicle model |
| `vehicle_successful_landings` | number (≥ 0) | Successful booster recoveries |
| `vehicle_attempted_landings` | number (≥ 0) | Attempted booster recoveries |
| `vehicle_consecutive_successes` | number (≥ 0) | Current consecutive success streak for this vehicle |
| `maiden_flight_date` | string \| null | First flight as `MM/DD/YYYY` when LL2 provides `maiden_flight` |
| `vehicle_wiki_url` | string \| null | URL to Wikipedia or reference documentation |

### Mission Information

| Attribute | Type | Description |
|-----------|------|-------------|
| `mission_name` | string \| null | Name of the space mission |
| `mission_type` | string \| null | LL2 `mission.type` free text (e.g. `"Communications"`, `"Dedicated Rideshare"`, `"Test Flight"`) |
| `mission_description` | string \| null | Detailed description of mission objectives |
| `launch_designator` | string \| null | Official launch designator code |
| `agency_type` | string \| null | Same source as `provider_type` (LL2 LSP `type`) |
| `orbit_name` | string \| null | Target orbital regime from `mission.orbit.name` (e.g. `"Low Earth Orbit"`, `"Geostationary Transfer Orbit"`) |
| `orbit_abbreviation` | string \| null | From `mission.orbit.abbrev` (e.g. `"LEO"`, `"GTO"`, `"SSO"`, `"HEO"`) |
| `destination` | string \| null | Mission destination or target |
| `mission_end_date` | string \| null | `MM/DD/YYYY` when LL2 provides `spacecraft_stage.mission_end` |
| `crew_size` | number (≥ 0) | Count of union of `launch_crew` and `onboard_crew` on `spacecraft_stage` |
| `crew_members` | array | Array of crew member objects with properties: |
| `crew_members[].name` | string | Astronaut/cosmonaut name |
| `crew_members[].role` | string | LL2 role string (e.g. `"Commander"`, `"Pilot"`, `"Mission Specialist"`, `"Tourist"`) |
| `crew_members[].nationality` | string \| null | Astronaut's nationality |
| `crew_members[].date_of_birth` | string \| null | DOB as `MM/DD/YYYY` when present |
| `crew_members[].flights_count` | number | Always `0` here (full history would require LL2 `/astronaut/` lookups) |
| `crew_members[].time_in_space` | string \| null | Total time spent in space |
| `crew_members[].agency` | string \| null | Space agency affiliation |

### Payload Information

| Attribute | Type | Description |
|-----------|------|-------------|
| `payload_name` | string \| null | Spacecraft name, else mission name |
| `payload_type` | string \| null | From `spacecraft_config.type.name` when present (LL2 vocabulary; e.g. `"Cargo Dragon"`, `"Communications Satellite"`) |
| `spacecraft_name` | string \| null | Name of any crewed/uncrewed spacecraft |
| `spacecraft_serial` | string \| null | Serial number of the spacecraft |
| `spacecraft_human_rated` | boolean \| null | Whether the spacecraft is certified for human spaceflight |
| `spacecraft_crew_capacity` | number \| null | Maximum crew capacity |
| `spacecraft_payload_capacity_kg` | number \| null | Payload carrying capacity in kg |
| `spacecraft_height_m` | number \| null | Spacecraft height in meters |
| `spacecraft_diameter_m` | number \| null | Spacecraft diameter in meters |
| `payload_reused` | boolean \| null | First launcher stage `reused` when that stage exists |

### Orbit Specifics

| Attribute | Type | Description |
|-----------|------|-------------|
| `orbit_name` | string \| null | Same source as mission `orbit.name` |
| `orbit_abbreviation` | string \| null | Same source as mission `orbit.abbrev` |
| `perigee_km` | number \| null | Kilometers when LL2 exposes a numeric `perigee` on `mission.orbit` (currently uncommon in LL2 2.2.0 detailed launches) |
| `apogee_km` | number \| null | Kilometers: prefers numeric `apogee` on `mission.orbit` when present; otherwise falls back to LL2 launcher configuration `apogee` (vehicle-class reference altitude in LL2, not a measured mission osculating element) |
| `inclination_deg` | number \| null | Degrees when LL2 exposes numeric `inclination` on `mission.orbit` (currently uncommon in LL2 2.2.0 detailed launches) |

### Recovery Information

| Attribute | Type | Description |
|-----------|------|-------------|
| `booster_serial` | string \| null | Serial number of the booster stage |
| `booster_flight_number` | number \| null | Flight number for this booster |
| `reused` | boolean \| null | Whether this booster has been reused |
| `days_since_last_flight` | number \| null | Days elapsed since previous flight |
| `previous_mission` | string \| null | Name/identifier of the previous mission |
| `recovery_attempted` | boolean | `landing.attempt` from first stage or spacecraft stage (defaults `false`) |
| `recovery_success` | boolean \| null | Whether booster recovery was successful |
| `recovery_type` | string \| null | LL2 landing `type.abbrev` when present (e.g. `"ASDS"`, `"RTLS"`, `"Ocean"`, `"Ground Pad"`, `"Airport"`) |
| `recovery_vessel` | string \| null | LL2 landing `location.name` (drone ship name, etc.) |
| `recovery_vessel_landings` | number \| null | Total landings achieved by this recovery vessel |
| `recovery_location` | string \| null | Geographic location of recovery |
| `downrange_distance_km` | number \| null | Distance of booster downrange in km |
| `booster_total_flights` | number \| null | Total number of flights for this booster |
| `booster_successful_landings` | number (≥ 0) | Number of successful booster landings |
| `booster_attempted_landings` | number (≥ 0) | Number of booster landing attempts |
| `booster_status` | string \| null | Current status of the booster |

## Running the Collector

```bash
cd parser

bun install # Install dependencies

bun run collect # Collect launches (default behavior)

bun run collect:full # OR collect with custom limit

bun run collect:recent # OR collect recent launches only
```
