## 1. Introduction
Bhu-Darpan is a conceptual, AI-powered "digital twin" of India's climate system, designed as an
interactive web dashboard. It fuses multiple national data sources — satellite feeds (INSAT-3D/3DR,
Oceansat), Bhuvan and MOSDAC portals, IMD ground station and gridded rainfall/temperature
records, and reanalysis datasets (IMDAA/ERA5) — into a single, continuously updating
representation of the atmosphere and land surface.
The project demonstrates how such a system could allow planners, researchers, and policymakers to
observe the current climate state, forecast short-term rainfall and temperature trends, and simulate
"what-if" scenarios (such as a weaker monsoon or a temperature spike) to understand their
downstream effects on soil moisture, drought risk, crop stress, and reservoir inflow — before they
actually occur.
The prototype focuses on a pilot region, Marathwada in Maharashtra, chosen for its rain-shadow
location east of the Western Ghats, high monsoon variability, and history of recurring drought —
making it a demanding and meaningful test case for the system.
## 2. Objective of the Project
● To build a single, interactive interface that fuses heterogeneous national climate datasets into one
continuously updating climate state.
● To visualise district-level climate indicators (rainfall anomaly, temperature anomaly, soil moisture)
on an interactive map.
● To provide a short-term forecasting view (14-day rainfall and temperature outlook) with
uncertainty bands.
● To let users run "what-if" scenarios by adjusting rainfall and temperature sliders and instantly see
the simulated impact on drought risk, crop stress, and reservoir inflow.
● To lay out a realistic roadmap for scaling the system from a single-region proof-of-concept to a
pan-India operational climate twin.
## 3. Tools and Technologies Used
Category Technology
Markup & Structure HTML5
Styling CSS3 (custom properties/variables, Flexbox, Grid, keyframe
animations, media queries)
Scripting Vanilla JavaScript (DOM manipulation, event handling,
IntersectionObserver API)
Charting Library Chart.js (v4.4.1, via CDN) — line and bar charts with uncertainty
bands
Graphics Inline SVG (dynamically generated district map, markers, scan-line
animation)
Fonts Google Fonts — Space Grotesk, IBM Plex Sans, IBM Plex Mono
Conceptual Data Sources INSAT-3D/3DR, Oceansat, Bhuvan, MOSDAC, IMD station &
gridded data, IMDAA/ERA5 reanalysis
Conceptual AI/ML Models ML-based bias correction & ensemble data assimilation; ConvLSTM
/ Temporal Fusion Transformer for forecasting
## 4. Project File Structure
The project is currently implemented as a single self-contained HTML file, structured internally as
follows:
● <head> — Meta tags, Google Fonts import, Chart.js CDN import, and a single internal <style>
block containing all CSS (root variables, layout, component styles, animations, responsive media
queries).
● Navigation bar — Sticky header with brand logo and section anchor links (Architecture,
Dashboard, What-If, Forecast, Roadmap).
● Hero section — Introductory heading, description, call-to-action buttons, and a live telemetry
panel.
● Architecture section (#architecture) — Four-stage data pipeline (Ingest → Fuse → Predict →
Apply) shown as clickable stage cards.
● Dashboard section (#dashboard) — Interactive SVG district map of Marathwada with layer
toggles (rainfall/temperature/soil moisture), a clickable legend, district chips, and a pilot-snapshot
status panel.
● What-If section (#whatif) — Scenario simulator with rainfall and temperature sliders, four live
impact cards, and a Chart.js bar chart comparing baseline vs. scenario values.
● Forecast section (#forecast) — Two Chart.js line charts (rainfall and temperature) showing a
14-day observed-vs-predicted outlook with toggleable uncertainty bands.
● Roadmap section (#roadmap) — A four-phase vertical timeline from single-region
proof-of-concept to pan-India operational deployment.
● Footer — Project name and tagline.
● <script> — All JavaScript logic: map rendering, legend/filter logic, telemetry and status
interactions, chart initialisation, slider-driven scenario calculations, scroll-reveal animations, and a
toast-notification helper.
## Problems Faced
● Data fusion complexity: Reconciling satellite retrievals with sparse, unevenly distributed IMD
ground station data required conceptually designing an ML-based bias-correction step rather than
a simple averaging approach.
● Rendering a realistic but simplified map: Since no GeoJSON boundary data was used, district
boundaries had to be approximated with a single stylised SVG outline while keeping district
markers positioned proportionally.
● Keeping the UI responsive under many interactive layers: Coordinating the map, legend
filters, district chips, and info panel so they always stay in sync required carefully centralising state
(current layer, highlighted district, legend filter) in JavaScript.
● Balancing animation with performance: Multiple simultaneous CSS animations (pulsing
markers, scan-line, glow effects) needed a `prefers-reduced-motion` fallback to avoid
overwhelming lower-powered devices and to respect accessibility preferences.
● Simulating realistic what-if outputs: Translating rainfall/temperature slider changes into
plausible soil-moisture, drought-risk, crop-stress, and reservoir-inflow values required designing
simplified but directionally sound formulas in the absence of a real hydrological model.
● Chart uncertainty bands: Configuring Chart.js to render shaded upper/lower uncertainty bands
alongside observed and predicted lines — while keeping them independently toggleable —
needed careful dataset ordering and fill configuration.
