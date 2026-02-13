# 🎙️ REO – Rádio Escolar Online

REO (Rádio Escolar Online) is a modern web application designed to archive, organize, and stream school radio programs in a structured and accessible way.

The platform allows users to:

- Browse radio programs by year  
- Navigate program folders  
- Stream audio episodes  
- View cover images  
- Share and download content  

The project was initially scaffolded using Google AI Studio and has since been fully customized, structured, and deployed as a production-ready application.

---

## 🚀 Tech Stack

- React  
- TypeScript  
- Vite  
- TailwindCSS  
- Cloudflare Workers (Deployment)  
- Google Drive (Audio & Cover Storage)  
- Google Sheets (Episode Index via CSV)  

---

## 📁 Project Structure

REO-APP/  
│  
├── components/        Reusable UI components  
├── pages/             Main pages (Home, Archive, About)  
├── constants/         Navigation & static configuration  
├── Logo.tsx           Logo component  
├── Archive.tsx        Archive navigation logic  
├── vite.config.ts     Vite configuration  
└── wrangler.jsonc     Cloudflare deployment config  

---

## 🛠️ Local Development

Clone the repository:

git clone https://github.com/miguelaraujo-tech/REO-APP.git  
cd REO-APP  

Install dependencies:

npm install  

Run locally:

npm run dev  

The app will start at:  
http://localhost:5173  

---

## 🌍 Deployment

This project is deployed using Cloudflare Workers.

Build the project:

npm run build  

Deploy:

npx wrangler deploy  

Ensure wrangler.jsonc is correctly configured with the appropriate Worker name and Cloudflare account details.

---

## 📡 Data Source

Episodes are dynamically loaded from a published Google Sheets CSV file.

Each entry includes:
- Year  
- Program  
- Episode Title  
- Audio File ID  
- Cover Image ID  

This allows non-technical content updates without modifying the codebase.

---

## 🤖 AI-Assisted Foundation

This project was initially generated using Google AI Studio as a development starting point.

The application has since been:
- Refactored and structured  
- Custom-designed  
- Integrated with external storage  
- Optimized for deployment  
- Extended with additional features  

AI was used as a development accelerator, while architectural decisions, customization, and deployment were handled manually.

---

## 👨‍💻 Developer

Miguel Araújo  
Developer and maintainer of REO – Rádio Escolar Online

