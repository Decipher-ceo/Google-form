# ECWA Umuahia District Church Council - Strategic Feedback & Assessment Hub

A modern, responsive multi-portal web application for baseline data collection, strategic research, and assessment across ECWA Umuahia District Church Council.

## 🌟 Portals & Questionnaires

1. **Local Church Questionnaire (`lc.html`)** — Button 1
   - Complete 11-step questionnaire for all 61 Local Churches in the district.
   - Interactive directory search with live filtering by name or number.

2. **LCC Questionnaire (`lcc.html`)** — Button 2
   - Complete 10-step questionnaire for Local Church Councils (Sections A–J).
   - Selectable LCC Council cards with automatic name assignment.

3. **DCC Strategic Assessment (`dcc.html`)** — Button 3
   - Executive 22-step strategic portal for District Church Council leadership (Sections A–V).

## ✨ Key Features

- **Free Step Navigation** — Jump to any step instantly by clicking stepper indicators or navigating forward/backward without blocking validation.
- **Responsive Layout** — Tailored breakpoints supporting ultra-small phones (360px), smartphones (480px), tablets (768px), iPads (992px), and desktops.
- **Data Export & Local Backup** — Submissions stream to your configured webhook (Google Apps Script, Make.com, n8n, custom API) and auto-backup locally in browser storage (`localStorage`).
- **Dark Mode Support** — Seamless light/dark theme toggle with persistent preferences.

## 📁 Project Structure

```
├── index.html          # Strategic Hub Landing Page (Portals & Webhook Setup)
├── lc.html             # Button 1: Local Church Questionnaire Page (61 Churches)
├── lcc.html            # Button 2: LCC Questionnaire Page (LCC Councils)
├── dcc.html            # Button 3: DCC Strategic Assessment Portal (22 Steps)
├── styles.css          # Complete design system stylesheet & responsive rules
├── js/
│   ├── data.js         # Registry of 61 Local Churches & LCC Councils
│   ├── common.js       # Shared utilities (Theme Toggle, Modal, Toast Notifications)
│   ├── lc.js           # Button 1 Controller (Search filter, step navigation, submit)
│   ├── lcc.js          # Button 2 Controller (LCC selector, step navigation, submit)
│   └── dcc.js          # Button 3 Controller (DCC step navigation, submit)
├── assets/
│   ├── church Logo.jpeg # Official ECWA Umuahia DCC Logo
│   └── church_hero_banner.png # Hero section image
├── .gitignore
└── README.md
```

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Decipher-ceo/Google-form.git
   ```
2. Open `index.html` in any modern web browser — no build steps or dependencies required.
