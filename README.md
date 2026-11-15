# FieldShift

**Adapt farms with NASA Earth observations and the knowledge farmers already have.**

FieldShift is a bilingual, browser-based prototype for exploring crop-rotation strategies. It pairs historical climate context from the NASA POWER API with a farmer-editable soil profile and transparent, adjustable rotation comparisons.

### Project pitch

Climate change does not affect every farm in the same way, and a single crop recommendation cannot reflect every farmer's priorities. FieldShift gives farmers an understandable place to compare possible crop sequences against regional climate history, locally known soil conditions and the priorities that matter to them. It makes the assumptions and limits visible, so the farmer remains the decision-maker.

**Challenge demo:** Start with the Konya example farm. Switch the map from its schematic view to the NASA MODIS Terra true-color imagery, note the image date and GIBS attribution, and click the map to select a location. Then show the historical NASA POWER rainfall and temperature summary, adjust water and soil priorities to see the three illustrative rotation scenarios re-rank, add a soil observation and export the comparison. Explain that the satellite image is visual context only and does not affect scores; climate values describe historical regional context, and rotation scores are heuristic—not forecasts, parcel measurements or promised yields.

## Run locally

No build step, package installation, API key, or framework is required. Open `index.html` in a modern browser to get started. If the browser restricts API requests from local files, serve this folder over HTTP instead:

```powershell
py -m http.server 8000
```

If `py` is not available, use:

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000>. The NASA POWER request and optional place search need an internet connection. If NASA POWER is unreachable, the app continues with clearly labelled illustrative example data.

## Using the app

1. Select the farm location by searching for a place or entering latitude and longitude; clicking the schematic world map also updates the location.
2. Review the historical rainfall, temperature, and dry-month indicators.
3. Optionally add soil observations, irrigation access, and the most recently planted crop.
4. Adjust water, soil-health, and income-stability priorities and compare the rotation scenarios. Choose a three-, four-, or five-season horizon.
5. Export the comparison to CSV for discussion with a local agricultural adviser.

Location, preferences, and notes are stored in this browser on this device using local storage. This prototype does not have accounts or transmit saved field notes to a server. A location search sends the search text to OpenStreetMap Nominatim (credited in the app). A successful climate-data request sends the selected coordinates to NASA POWER. When the satellite view is selected, the map requests NASA GIBS imagery tiles for the visible geographic area.

## Data and method

- **Live source when available:** [NASA POWER](https://power.larc.nasa.gov/) monthly point API, Agricultural community, using `T2M` (2 m air temperature) and `PRECTOTCORR` (corrected precipitation). The monthly API's year-based range requests the most recent ten completed calendar years, through the previous UTC year, consistent with the availability of the POWER monthly meteorological data.
- **NASA Earth-observation imagery:** [NASA GIBS](https://nasa-gibs.github.io/gibs-api-docs/) WMTS tiles for the MODIS Terra Corrected Reflectance True Color layer, using the EPSG:4326 `250m` tile matrix at zoom level 6. The app displays a 5 × 2 tile view around the selected coordinates and labels the imagery date (seven days before the current UTC date). If tiles fail, the app reports the failure instead of presenting a fabricated image.
- **Imagery limits:** MODIS true color provides qualitative landscape context and can be obscured by clouds. It is not a crop-health or field-boundary product, does not measure soil moisture, and is not used in rotation scores. Selecting a location on the image updates the farm coordinates.
- **Meteorological provenance:** The requested POWER temperature and precipitation parameters are based on NASA's [MERRA-2 meteorological reanalysis](https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/). They are gridded regional estimates, not direct observations from a sensor on the selected farm.
- **Climate summary:** Groups monthly records by calendar month, averages temperature and precipitation across the returned years, converts the precipitation daily rate to an approximate monthly amount using the number of days in each month, then derives a mean annual rainfall, mean annual temperature, and count of months below 20 mm. Values represent a regional gridded climate product, not measurements at the selected field.
- **Rotation scores:** Transparent, adjustable heuristics based on general crop water, soil, heat, drought, and income attributes. Farmer-selected soil texture, organic-matter observation, irrigation access and most recent crop add small contextual adjustments; user-set priorities determine ranking. These are illustrative relative comparisons, not agronomic recommendations, validated crop models, forecasts, or yield predictions.
- **Other NASA sources:** SMAP soil moisture, GPM precipitation, and Landsat land observations are described as potential follow-up data sources; this prototype does not ingest them.
- **Fallback:** A fixed, illustrative Konya-area seasonal profile keeps the interface usable while offline or when the API fails. The interface labels these values as sample data; they are not current measurements for another location.

## Project files

- `index.html` — accessible single-page application and content.
- `styles.css` — responsive visual design and print styling.
- `app.js` — NASA POWER and GIBS/MODIS integration, location search, planning heuristics, local persistence, localization, and CSV export.

NASA is not affiliated with or endorsing this application. Use local soil tests and qualified agricultural advice when making farm-management decisions.
