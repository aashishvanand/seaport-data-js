# Seaport Data React Sample

A React application demonstrating [`seaport-data-js`](https://www.npmjs.com/package/seaport-data-js) — search, browse, and visualize seaport data sourced from the NGA World Port Index.

This is the `reactjs-sample` branch of the [seaport-data-js](https://github.com/aashishvanand/seaport-data-js) repository (the `main` branch holds the library itself). It mirrors the structure of [airport-data-js's `reactjs-sample` branch](https://github.com/aashishvanand/airport-data-js/tree/reactjs-sample).

## Features

- **Search** — by UN/LOCODE, name (with autocomplete), country code, harbor size, or harbor type
- **Statistics** — port counts by harbor size/type and container-facility coverage for a given country
- **Deepest Ports** — rank ports within a country by channel depth or max vessel draft
- **Distance Calculator** — great-circle distance between two ports, with a map
- **Nearby Ports** — find ports within a radius of any coordinate (or your current location)
- **Validation** — check whether a UN/LOCODE exists in the dataset
- **Interactive Map** — Leaflet-based, dark/light theme aware
- **Libraries** — links to `seaport-data-js` and its sibling `airport-data-js`

## Getting Started

```bash
npm install
npm run dev
```

Visit the printed local URL (default `http://localhost:3000`).

### Build & deploy

```bash
npm run build
npm run deploy   # deploys to Cloudflare Workers via wrangler
```

## Stack

- [vinext](https://www.npmjs.com/package/vinext) (Next.js-compatible app router on Vite) + React 19
- MUI v7
- Leaflet / react-leaflet for maps
- Deployed on Cloudflare Workers

## Data note

`seaport-data-js` sources its port data from the public-domain [NGA World Port Index](https://msi.nga.mil/Publications/WPI) (Pub. 150). See the `main` branch's README for full data provenance and licensing details.

## License

CC BY 4.0. See [LICENSE](LICENSE).
