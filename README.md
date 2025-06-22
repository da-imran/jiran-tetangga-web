# 🏡 JiranTetangga

A full-stack project designed to help residents of a dense neighbourhood in **Sungai Tiram, Penang** stay informed about local updates, report issues, and stay connected through a WhatsApp-integrated system.

## 🚀 Features

- 📢 Get real-time updates on:
  - Road disruptions
  - Local events and ceremonies
  - Shop openings and closures
  - Park conditions
- 📬 Residents can report damages or concerns
- 🧠 Admin system for managing updates and users
- 🤖 WhatsApp bot integration
- 🐳 Docker support + local and cloud deployment ready

---

## 🛠️ Technologies Used

| Layer        | Tech Stack           |
|--------------|----------------------|
| Frontend     | TypeScript, NextJS, Tailwind CSS (via Firebase 🔥)   |
| Backend      | Node.js + Express    |
| Database     | MongoDB              |
| Auth         | Encrypted password storage (AES) |
| Messaging    | WhatsApp Bot	|
| Container    | Docker, Docker Compose |
| Orchestration| Kubernetes (local + cloud) |
| CI/CD        | Github Action     |
| Monitoring   | Prometheus + Grafana |
| Testing      | Jest / Mocha	|

---

## 📂 Frontend Project Structure
```bash
jiran-tetangga-system/
├── LICENSE
├── README.md
├── apphosting.yaml
├── components.json
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── .idx/
│   └── dev.nix
├── .vscode/
│   └── settings.json
├── docs/
│   └── blueprint.md
├── src/
│   ├── ai/
│   │   ├── dev.ts
│   │   └── genkit.ts
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   └── tooltip.tsx
│   │   ├── dashboard-card.tsx
│   │   ├── header.tsx
│   │   └── issue-report-form.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   └── lib/
│       └── utils.ts
```

---

## Frontend Technology Stack

*   **NextJS:** A React framework for building server-side rendered and static websites.
*   **React:** A JavaScript library for building user interfaces.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.
*   **Firebase:** A platform for building web and mobile applications, providing services like hosting, databases, authentication, and more.

## ⚙️ Getting Started

1.  **Explore the code:** Begin by examining `/src/app/page.tsx` to understand the basic page structure.
2.  **Install dependencies:** Run `npm install` or `yarn install` in the project root.
3.  **Run locally:** Start the development server with `npm run dev` or `yarn dev`.
4.  **Deploy to Firebase:** Use the Firebase CLI to deploy your project. Refer to the Firebase documentation for detailed deployment instructions.

## 📦 Docker Support 
(Coming soon in Phase 3)

## 📌 Roadmap 
[x] Admin user creation API </br>
[x] MongoDB connection setup </br>
[x] Reversible password encryption </br>
[x] Modular Express routing </br>
[x] NextJS frontend dashboard </br>
[] WhatsApp bot notification </br>
[] CI/CD pipeline with GitLab </br>
[] Kubernetes orchestration </br>

## 🤝 Contributing

This project is currently my second personal hobby project. Contributions and suggestions are welcome! Feel free to fork or open issues.

## 📜 License

This project is open-sourced under the MIT License.