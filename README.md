# 📞 Voice Call System

Real-time **1v1 voice call** antara User App dan Command Center menggunakan **Socket.IO** untuk signaling dan **Agora RTC** untuk media/voice.

---

## 📁 Struktur Proyek

```
call/
├── call-backend/        # Node.js + Express + Socket.IO — signaling server & auth
├── user-app/            # React (Vite) — sisi pengguna (port 3001)
├── command-center-app/  # React (Vite) — sisi operator (port 3002)
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Node.js, Express, Socket.IO, better-sqlite3 |
| Frontend | React 19, Vite 8, Agora RTC SDK NG |
| Voice Call | Agora RTC (agora-rtc-sdk-ng) |
| Auth | SHA-256 password hashing, session via localStorage / sessionStorage |
| Styling | Vanilla CSS (glassmorphism dark theme) |

---

## ⚙️ Prerequisites

- **Node.js** v18+ (disarankan v22)
- **Akun Agora** — https://console.agora.io (App ID & App Certificate)

---

## 🔑 Environment Variables

Buat/edit file `call-backend/.env`:

```env
PORT=4000
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
```

> **Catatan:** Tanpa certificate, backend akan return `token: null` dan SDK Agora tetap bisa berjalan menggunakan App ID only (pastikan project Agora tidak enforce certificate).

---

## 🚀 Instalasi & Menjalankan

### 1. Backend (Port 4000)

```bash
cd call-backend
npm install
node index.js
```

Backend akan otomatis membuat database SQLite dan men-seed akun default saat pertama kali dijalankan.

### 2. User App (Port 3001)

```bash
cd user-app
npm install
npm run dev
```

Buka: `https://localhost:3001`

### 3. Command Center (Port 3002)

```bash
cd command-center-app
npm install
npm run dev
```

Buka: `https://localhost:3002`

> **HTTPS wajib** karena Agora RTC memerlukan akses mikrofon yang hanya diizinkan di HTTPS. Kedua app menggunakan self-signed SSL via `@vitejs/plugin-basic-ssl` — abaikan peringatan SSL dari browser.

---

## 👤 Akun Default

Akun-akun ini di-seed otomatis saat backend pertama kali dijalankan.

### User App (`https://localhost:3001`)

| Username | Password | Nama |
|---|---|---|
| `user1` | `password123` | Ahmad Fauzi |
| `user2` | `password123` | Siti Nurhaliza |
| `user3` | `password123` | Budi Santoso |

### Command Center (`https://localhost:3002`)

| Username | Password | Role |
|---|---|---|
| `operator` | `admin123` | Operator Admin |

---

## 📡 Alur Panggilan

```
1. Operator login ke Command Center → terdaftar sebagai "operator" di backend
2. User login ke User App → terdaftar sebagai "user" di backend
3. User klik "Hubungi Command Center"
   └─ Backend emit "incoming-call" ke semua operator online
4. Operator melihat notifikasi panggilan masuk
   ├─ Accept → Backend notify user, keduanya join Agora channel
   └─ Reject → Panggilan ditolak, user diberi tahu
5. Di dalam call: keduanya bisa Mute / End Call
6. Salah satu end call → channel ditutup untuk keduanya
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/auth/login` | Login dengan username & password |
| `GET` | `/api/auth/verify/:userId` | Verifikasi sesi user |

### Users
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/users` | List semua user |
| `GET` | `/api/users/:id` | Get user by ID |
| `POST` | `/api/users` | Buat user baru |
| `DELETE` | `/api/users/:id` | Hapus user |

### Agora
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/generate-token` | Generate Agora RTC token |
| `GET` | `/agora-app-id` | Ambil App ID |

---

## 🔌 Socket.IO Events

### Client → Server
| Event | Payload | Deskripsi |
|---|---|---|
| `register-user` | `userId` | Daftarkan user online |
| `register-operator` | `operatorId` | Daftarkan operator online |
| `call-user` | `{ callerId }` | Mulai panggilan ke operator |
| `accept-call` | `{ callerId, channelName }` | Operator terima panggilan |
| `reject-call` | `{ callerId, channelName }` | Operator tolak panggilan |
| `end-call` | `{ channelName, userId }` | Akhiri panggilan |

### Server → Client
| Event | Payload | Deskripsi |
|---|---|---|
| `call-ringing` | `{ channelName }` | Panggilan sedang berdering |
| `incoming-call` | `{ callerId, callerName, channelName }` | Ada panggilan masuk |
| `call-accepted` | `{ channelName }` | Panggilan diterima |
| `call-rejected` | `{ reason }` | Panggilan ditolak |
| `call-ended` | `{ channelName }` | Panggilan berakhir |
| `call-taken` | `{ channelName, operatorId }` | Panggilan sudah diambil operator lain |

---

## 📦 Dependency Utama

### Backend (`call-backend/`)
```json
"express"           — HTTP server
"socket.io"         — Real-time signaling
"better-sqlite3"    — Database SQLite (users & accounts)
"agora-access-token"— Generate Agora RTC token
"dotenv"            — Environment variables
"cors"              — CORS middleware
```

### Frontend (`user-app/` & `command-center-app/`)
```json
"agora-rtc-sdk-ng"  — Agora Web SDK (voice call)
"socket.io-client"  — Koneksi ke signaling server
"react"             — UI framework
```

---

## 🔒 Keamanan

- Password di-hash menggunakan **SHA-256 + random salt** sebelum disimpan ke database
- Agora **App Certificate** hanya ada di backend, tidak pernah dikirim ke frontend
- Token Agora di-generate server-side dengan expiry 1 jam
- Role validation: user tidak bisa login sebagai operator dan sebaliknya

---

## 🌐 Port

| Service | Port | URL |
|---|---|---|
| Call Backend | 4000 | `http://localhost:4000` |
| User App | 3001 | `https://localhost:3001` |
| Command Center | 3002 | `https://localhost:3002` |

---

## 📝 Catatan Development

- Jalankan **backend terlebih dahulu** sebelum membuka frontend
- Jika `better-sqlite3` error setelah ganti versi Node, jalankan: `npm rebuild better-sqlite3` di folder `call-backend`
- Database SQLite (`call.db`) dibuat otomatis, **tidak perlu setup manual**
- File `.env`, database, `node_modules`, dan SSL cert **tidak di-commit** ke Git
