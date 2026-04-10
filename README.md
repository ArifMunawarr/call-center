# Voice Call System (1v1)

Real-time voice call between **User App** and **Command Center App** using Socket.IO for signaling and Agora for media.

## Architecture

```
call/
├── call-backend/        # Node.js + Express + Socket.IO signaling server
├── user-app/            # React (Vite) - User side
├── command-center-app/  # React (Vite) - Command Center side
└── README.md
```

## Prerequisites

- Node.js 18+
- Agora account (https://console.agora.io) — get your App ID & App Certificate

## Environment Variables

Edit `call-backend/.env`:

```
PORT=4000
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
```

> **Note:** For testing without Agora credentials, the backend returns `token: null` and the SDK will attempt to connect with App ID only (works if your Agora project has no certificate enabled).

## Installation & Running

### 1. Call Backend (Port 4000)

```bash
cd call-backend
npm install
node index.js
```

### 2. User App (Port 3001)

```bash
cd user-app
npm install
npm run dev
```

### 3. Command Center App (Port 3002)

```bash
cd command-center-app
npm install
npm run dev
```

## Usage Flow

1. Open **Command Center App** at `http://localhost:3002` — it auto-connects to the backend as `admin_1`
2. Open **User App** at `http://localhost:3001` — it auto-connects as `user_1`
3. Click **"Call Command Center"** in User App
4. Command Center sees incoming call modal → **Accept** or **Reject**
5. On Accept → both apps join the Agora voice channel
6. Either side can **End Call** or **Mute**

## Ports

| Service              | Port |
|----------------------|------|
| Call Backend         | 4000 |
| User App             | 3001 |
| Command Center App   | 3002 |
