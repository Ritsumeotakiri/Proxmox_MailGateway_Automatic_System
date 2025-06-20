# 📧 Proxmox Mail Gateway Automation and Monitoring System

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

---

## 🚀 Features

### ✅ REST API (Node.js)
- View and manage spam/virus/quarantine data
- Release, delete quarantined emails
- Manage blacklists/whitelists
- Secure with JWT/API Key

### 📊 Web Dashboard (React)
- Real-time visualization of mail stats
- Spam/virus trends via Chart.js
- User-friendly for technical & non-technical users

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
| Bot Integration| Telegram Bot API           |
| Scheduling     | node-cron                  |
| Testing        | Thunder Client             |
| Auth & Security| JWT, .env config           |

---

## 📂 Project Structure

