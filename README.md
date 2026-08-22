# FaithForward Church Feedback Hub

A premium multi-step survey wizard built for collecting comprehensive data from local churches. Designed with a modern, responsive UI that works beautifully on phones, tablets, and desktops.

## Features

- **11-Step Survey Wizard** — Covers General Info, History, Pastors, Membership, Leadership, Ministries, Evangelism & Missions, Property & Assets, Financial Profile, Community Profile, and SWOT/Strategic Vision.
- **Interactive Church Directory** — Browse and select from 50 local churches with search filtering.
- **Free Navigation** — Jump between any section using the clickable step indicators; no forced linear progression.
- **Responsive Design** — Optimized breakpoints for ultra-small phones (360px), standard phones (480px), tablets (768px), iPads (992px), and desktops.
- **Data Export** — Submissions are structured as JSON and can be sent to a Google Sheets webhook, Formspree, or any custom API endpoint.
- **Local Sandbox Mode** — Works fully offline; responses are stored in the browser until a backend is configured.
- **Premium UI** — Glassmorphism effects, smooth animations, Google Fonts (Outfit), and a curated green/earth-tone color palette.

## Tech Stack

- **HTML5** — Semantic markup with accessibility in mind
- **CSS3** — Vanilla CSS with custom properties, flexbox, grid, and media queries
- **JavaScript** — Vanilla JS (no frameworks or build tools required)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   ```
2. Open `index.html` in your browser — no server or build step needed.

## Project Structure

```
├── index.html          # Main application page
├── styles.css          # Complete stylesheet with responsive breakpoints
├── app.js              # Application logic (wizard, validation, data extraction)
├── assets/
│   └── church_hero_banner.png   # Hero section background image
├── .gitignore
└── README.md
```

## License

This project is provided as-is for church administrative use.
