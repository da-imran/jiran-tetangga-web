# 🏡 JiranTetangga

A full-stack project designed to help residents of a dense neighbourhood in **Sungai Tiram, Penang** stay informed about local updates, report issues, and stay connected through a WhatsApp-integrated system. This repository is the frontend part of the whole project and built with Firebase Studio.

## 🚀 Features

- 📢 Get real-time updates on:
  - Road disruptions
  - Local events and ceremonies
  - Shop openings and closures
  - Park conditions
- 📬 Residents can report damages or concerns
- 🧠 Admin system for managing updates
- 🤖 Discord Webhook Notifications
- 🐳 Docker support + local and cloud deployment ready

---

## 🛠️ Technologies Used

| Layer        | Tech Stack           |
|--------------|----------------------|
| Frontend     | TypeScript, NextJS, Tailwind CSS (via Firebase 🔥)   |
| Backend      | Node.js + Express    |
| Database     | MongoDB              |
| Auth         | AES / JWT |
| Notification | Discord Webhook	|
| Container    | Docker, Docker Compose |
| CI Pipeline  | Github Action     |

---

## 📂 Frontend Project Structure
```bash
jiran-tetangga-web/
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
4.  **Run with Docker:** Run `docker compose up --build -d` in the project root.
5.  Environment Setup
 Create a .env file
```bash
NEXT_PUBLIC_API_BASE_URL='your localhost URI'
NEXT_PUBLIC_API_KEY='any random string'
```
<i>Sensitive information such as NEXT_PUBLIC_API_KEY, ENCRYPTION_KEY can be store using the Infisical secrets tools or you can just use any string for testing purposes</i>

## 📦 Docker Support 
1.  Docker support has been built into the project
2.  Contains `Dockerfile` and `docker-compose.yaml` for the Docker configurations
3.  Can easily run command `docker compose up --build -d` in CLI to start up the project
4.  **Requirement:** Docker

## 📌 Roadmap 
[x] Admin dahsboard </br>
[x] MongoDB setup </br>
[x] Password encryption & JWT configuration </br>
[x] Modular Express routing </br>
[x] NextJS frontend dashboard with Firebase Studio </br>
[x] Docker support </br>
[x] CI pipeline with Github Actions </br>
[] Discord webhook notification </br>

## 🤝 Contributing

This project is currently my second personal hobby project. Contributions and suggestions are welcome! Feel free to fork or open issues.

## 📜 License

This project is open-sourced under the MIT License.
