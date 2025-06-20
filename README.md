# Proxmox Mail Gateway Automation and Monitoring System

A modern web-based system to automate email security tasks, monitor spam and virus metrics, and enhance administrative control over Proxmox Mail Gateway (PMG). Built with Node.js, React, and Telegram Bot API.

## 🔍 Overview

This system was developed during an internship at Trusted IT Business (TITB) to solve real-world challenges with PMG, including:

- Manual quarantine management
- Lack of modern dashboards and alerting
- Slow response to email threats

The solution offers:
- A responsive dashboard for real-time email threat insights
- Automation scripts for quarantine cleanup and reporting
- A Telegram bot for admin alerts and mobile control


## This system aims to modernize and automate critical email security operations using Proxmox Mail Gateway.







## 🚀 Features

### ✅ REST API (Node.js)
- View and manage spam/virus/quarantine data
- Release, delete quarantined emails
- Manage blacklists/whitelists
- Manage Rule for the System
- Secure with JWT/API Key

### 📊 Web Dashboard (React)
- Real-time visualization of mail stats
- Spam/virus trends via Chart.js
- User-friendly for technical & non-technical users
- Able to set and delete rule

### 🔁 Automation Scripts
- Scheduled cleanup of old quarantines (via `node-cron`)
- Email reports sent daily or weekly

### 🤖 Telegram Bot
- Instant alerts for mail threats or PMG events
- Mobile admin commands: `/status`, `/release`, etc.

---

## 🛠 Tech Stack

| Purpose        | Technology                |
|----------------|----------------------------|
| Backend API    | Node.js + Express          |
| Frontend UI    | React                      |
| Charts         | Chart.js                   |
| Bot Integration| Telegram Bot API Grammy    |
| Scheduling     | node-cron                  |
| Testing        | Thunder Client             |
| Auth & Security| JWT, .env config           |

---

## ⚙️ Setup Instructions

### 1. Clone the Repo
```bash
git clone https://github.com/Ritsumeotakiri/Proxmox_MailGateway_Automatic_System.git
```
### 2. Install Dependencies
#### Backend
```bash
cd pmg-backend
npm install
```
#### Frontend
```bash
npm install
```
### 3. Environment Configuration
#### Create a .env file in backend/ with:
```bash
PORT=3000
MONGO_URI=your_mongodb_url
PMG_API_URL=https://your-proxmox-ip:8006
PMG_USERNAME=yourUserName
PMG_PASSWORD=yourPMGpassword
JWT_SECRET=your_jwt_secret
TELEGRAM_BOT_TOKEN=your_bot_token
MONGO_URI=Yourmongodb uri
TELEGRAM_ADMIN_ID=YourTelegramAdminID
```
## 📄 License & Ownership

This project is fully reserved and developed by Say Sakphearith.
All rights to the source code, architecture, and implementation are retained by the author.
Unauthorized use, or redistribution is strictly prohibited.
 

## Contact
- Developer: Say Sakphearith (Cambodia Academy of Digital Technology)
- Company: Trusted IT Business (TITB)
- Internship Period: May – August 2025
- Supervisor: Kheang KimAng



