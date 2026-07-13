# Stockholm Swing 🎺

[![Validate data](https://github.com/ranveeraggarwal/swsthlm/actions/workflows/validate-data.yml/badge.svg)](https://github.com/ranveeraggarwal/swsthlm/actions/workflows/validate-data.yml)
[![License: BSL 1.1](https://img.shields.io/badge/license-BSL--1.1-blue)](../LICENSE)

> Your single, lightweight, optimized guide to Lindy Hop, Balboa, Shag, and Blues social dancing and workshops in Stockholm.

Stockholm Swing is a Next.js-powered web application that aggregates swing dance events across Stockholm. It is a fully static site, built at deploy time from structured CSV files in `/data` and rebuilt on every push to `main`, keeping the local community informed about upcoming social dances, live bands, and workshops.

## 🚀 Features

- **Comprehensive Calendar**: Track events for Lindy Hop, Balboa, Shag, and Blues.
- **Client-Side Filtering**: Easily filter events by style, date, and venue.
- **Chrome Extension Scraper**: Includes a custom Chrome extension (`/scrapers/chromeext`) that automates scraping event data directly from local studio websites (e.g., Chicago75) into the required CSV format.
- **Modern Stack**: Built with Next.js 15 App Router, React 19, and Tailwind CSS 4.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Parsing**: [PapaParse](https://www.papaparse.com/)
- **Deployment & Analytics**: [Vercel](https://vercel.com)

## 🏃 Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🧪 Tests & data validation

```bash
npm test               # unit tests: series expansion + the data validator
npm run validate:data  # schema + integrity check over /data
```

The same schema check runs in CI on every PR that touches `/data` (see `.github/workflows/validate-data.yml`).

## 🕸 Web Scraper

The `/scrapers/chromeext` directory contains a one-click Chrome Extension used by admins to extract event data from dance studio websites into a ready-to-paste CSV format. 
1. Load unpacked extension in `chrome://extensions/`
2. Navigate to an event page
3. Click the extension icon to instantly copy the parsed CSV row to your clipboard.

## 🤝 Community

This project is built to support the local Stockholm swing dance community and is not affiliated with any specific studio. Contributions, bug reports, and feature requests are welcome!
