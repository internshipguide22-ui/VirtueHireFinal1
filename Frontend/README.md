# VirtueHire Frontend: Premium Recruitment Experience

## 💎 Frontend Design Philosophy
VirtueHire's frontend is crafted using **React 19** with a focus on visual excellence and intuitive user experience. We prioritize:
- **Premium Aesthetics**: Harmonious color palettes, smooth transitions, and glassmorphism.
- **Micro-animations**: Subtle hover effects and interactive elements that make the app feel alive.
- **Informative Dashboards**: Clean, data-driven interfaces for both candidates and HR professionals.

---

## 📂 Project Structure
```text
src/
├── components/          # Reusable UI components
│   ├── Admin/           # Admin-specific modules
│   ├── Candidate/       # Candidate dashboard & assessments
│   ├── HR/              # HR monitoring & management
│   └── NewComponents/   # Latest UI/UX refactors
├── services/            # API service layer (Axios)
├── config.js            # Centralized environment configuration
├── App.js               # Main routing & application entry
└── index.css            # Global design system & utility classes
```

---

## ⚙ Centralized Configuration (`src/config.js`)
To simplify transitions between development (localhost) and production, all backend URLs are centralized:
```javascript
export const API_BASE_URL = isLocal ? "http://localhost:8081/api" : "https://backend.virtuehire.in/api";
export const WS_BASE_URL = isLocal ? "http://localhost:8081" : "https://backend.virtuehire.in";
```
All components should import these constants instead of hardcoding URLs.

---

## 🚀 Key Modules

### 📡 Live Monitoring
Uses **STOMP/WebSockets** to provide HR with instant updates on candidate assessment progress. The monitoring system tracks:
- Question progression
- Time remaining
- Tab switching/proctoring alerts

### 🎓 Assessment System
Dynamic multi-level assessments that adapt to candidate skills. Features specialized proctoring to ensure test integrity.

### 💼 HR Management
A powerful admin tool for reviewing HR registrations, verifying professional identity, and managing the hiring pipeline.

---

## 🔨 How to Contribute
1.  **Strictly follow the design system**: Use existing CSS tokens and Lucide react icons.
2.  **Use the Centralized Service**: Always use `api.js` for REST calls to ensure proper base URL handling.
3.  **Componentize**: Keep complex logic inside hooks and keep components focused on UI.
