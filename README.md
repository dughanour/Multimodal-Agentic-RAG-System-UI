# Multimodal Agentic RAG System — Frontend

A modern chat interface for interacting with a **Multimodal Agentic RAG (Retrieval-Augmented Generation)** system. Built with Vue 3, this frontend connects to a FastAPI backend powered by LangGraph and LangChain, enabling real-time conversational AI with document ingestion, URL scraping, and supervisor-level control over agent behavior.

![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-3-FFD859)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Backend Integration](#backend-integration)
- [WebSocket Protocol](#websocket-protocol)
- [REST API Endpoints](#rest-api-endpoints)
- [State Management](#state-management)
- [Scripts](#scripts)

---

## Overview

This is the **frontend** for a multimodal agentic RAG system. The backend — a separate project — is built with **FastAPI**, **LangGraph**, and **LangChain**, orchestrating multiple AI agents that can reason over documents, images, and web content.

This frontend provides:

- A real-time **chat interface** with streaming agent responses over WebSocket
- **Document upload** and **URL scraping** for knowledge ingestion into the RAG pipeline
- **Session management** for maintaining multiple independent conversations
- **Supervisor controls** to guide agent behavior with custom instructions, strict-context mode, and temperature tuning

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (this repo)                 │
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │ Sidebar  │  │  Chat View   │  │  Settings Sidebar     │ │
│  │----------│  │--------------│  │-----------------------│ │
│  │ Sessions │  │ Messages     │  │ Strict Mode Toggle    │ │
│  │ Upload   │  │ Streaming    │  │ Temperature Slider    │ │
│  │ Scrape   │  │ Status/Think │  │ Supervisor Prompt     │ │
│  └──────────┘  └──────────────┘  └───────────────────────┘ │
│        │              │                     │               │
│        ▼              ▼                     ▼               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Pinia Stores (chat, session, settings)  │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │                                       │
│         ┌───────────┴───────────┐                          │
│         ▼                       ▼                          │
│  ┌─────────────┐     ┌──────────────────┐                  │
│  │  REST API   │     │  WebSocket       │                  │
│  │  (Axios)    │     │  (Singleton)     │                  │
│  └──────┬──────┘     └────────┬─────────┘                  │
└─────────┼──────────────────────┼────────────────────────────┘
          │                      │
          ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (separate repo)                    │
│                                                             │
│  FastAPI  +  LangGraph  +  LangChain                       │
│  ─────────────────────────────────────                     │
│  • Multi-agent orchestration (supervisor pattern)          │
│  • RAG pipeline with vector store retrieval                │
│  • Document processing (PDF, images, etc.)                 │
│  • Web scraping & content extraction                       │
│  • Streaming responses via WebSocket                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Features

### Real-Time Chat
- **WebSocket streaming** — agent responses stream token-by-token for a responsive feel
- **Routing status** — see which agent or tool the system is invoking in real time (e.g., "Searching documents...", "Analyzing image...")
- **Thinking indicator** — visual feedback while the agent processes your query

### Knowledge Ingestion
- **File upload** — drag or select files (PDF, images, etc.) to feed into the RAG knowledge base with upload progress tracking
- **URL scraping** — paste a URL and the backend will extract and index its content

### Session Management
- **Multiple conversations** — create, switch between, and manage independent chat sessions
- **Persistent history** — session messages are stored server-side and reloaded on switch
- **Auto-generated titles** — the backend streams title updates for sessions based on conversation content

### Supervisor Controls
- **Custom instructions** — provide system-level guidance to the supervisor agent
- **Strict mode** — toggle strict context retrieval to limit the agent to only retrieved documents
- **Temperature** — fine-tune response creativity/randomness (0.0 to 1.0)

---

## Tech Stack

| Layer            | Technology                              |
| ---------------- | --------------------------------------- |
| Framework        | Vue 3 (Composition API, `<script setup>`) |
| Language         | TypeScript 5.9                          |
| Build Tool       | Vite 7                                  |
| State Management | Pinia 3                                 |
| Routing          | Vue Router 4                            |
| HTTP Client      | Axios                                   |
| Styling          | Tailwind CSS 4                          |
| Icons            | PrimeIcons 7                            |
| Real-Time        | Native WebSocket (singleton service)    |

---

## Project Structure

```
src/
├── main.ts                  # App bootstrap — Vue, Pinia, Router, global styles
├── App.vue                  # Root layout — Navbar + Sidebar + RouterView + Settings
├── api.ts                   # Axios instance & REST helper functions
├── socket.ts                # WebSocket singleton service
├── style.css                # Tailwind imports + custom scrollbar styles
│
├── router/
│   └── index.ts             # Route definitions (home → HomeChatView)
│
├── stores/
│   ├── chat.ts              # Chat messages, WS event handling, send/connect/disconnect
│   ├── session.ts           # Session CRUD, current session tracking
│   └── settings.ts          # UI preferences — strict mode, temperature, instructions
│
├── views/
│   └── HomeChatView.vue     # Main chat view — message list, composer, thinking state
│
├── components/
│   ├── Navbar.vue           # Top bar — logo, sidebar toggles
│   ├── Sidebarv2.vue        # Left drawer — sessions, upload, scrape
│   └── SettingsSidebar.vue  # Right drawer — agent settings & supervisor prompt
│
└── assets/
    ├── EFESO_logo.png       # Brand logo used in the navbar
    └── vue.svg              # Default Vue logo
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** (comes with Node.js)
- The **backend server** running (FastAPI + LangGraph + LangChain)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Multimodal-Agentic-RAG-System-UI

# Install dependencies
npm install
```

### Development

```bash
# Start the dev server on port 3000
npm run dev
```

The app will be available at `http://localhost:3000`. Make sure the backend is running on `http://127.0.0.1:8000` (or update the environment variable).

### Production Build

```bash
# Type-check and build for production
npm run build

# Preview the production build locally
npm run preview
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

| Variable             | Description                          | Default                              |
| -------------------- | ------------------------------------ | ------------------------------------ |
| `VITE_API_BASE_URL`  | Base URL for all REST API calls      | `http://127.0.0.1:8000/api/v1`      |

> **Note:** The WebSocket connection URL is currently constructed in `src/socket.ts` using the pattern `ws://127.0.0.1:8000/api/v1/ws/chat/{sessionId}`. Update this if your backend runs on a different host or port.

---

## Backend Integration

This frontend is designed to work with the **Multimodal Agentic RAG System** backend, which provides:

- **Multi-agent orchestration** via LangGraph with a supervisor pattern
- **RAG pipeline** with vector store retrieval for grounded responses
- **Document processing** for PDFs, images, and other file types
- **Web scraping** and content extraction
- **Real-time streaming** of agent responses and routing events over WebSocket
- **Session persistence** with message history

The backend exposes both REST endpoints (for CRUD operations) and a WebSocket endpoint (for real-time chat).

---

## WebSocket Protocol

The frontend communicates with the backend via a WebSocket connection at:

```
ws://<host>:<port>/api/v1/ws/chat/{sessionId}
```

### Outbound Messages (Client → Server)

```json
{
  "content": "User's message text",
  "use_strict_context": false,
  "temperature": 0.0
}
```

### Inbound Messages (Server → Client)

| `type`         | `data`                    | Description                                      |
| -------------- | ------------------------- | ------------------------------------------------ |
| `ping`         | —                         | Heartbeat keepalive (ignored by client)           |
| `routing`      | Status text               | Agent routing info (triggers thinking indicator)  |
| `stream`       | Token chunk               | Streamed response token (appended to agent message) |
| `stream_end`   | —                         | Signals the end of a streamed response            |
| `title_update` | New session title         | Auto-generated title based on conversation        |
| `error`        | Error message             | Error from the backend agent pipeline             |

---

## REST API Endpoints

All endpoints are relative to `VITE_API_BASE_URL`:

| Method   | Endpoint                      | Description                           |
| -------- | ----------------------------- | ------------------------------------- |
| `POST`   | `/upload`                     | Upload a file (multipart/form-data)   |
| `POST`   | `/scrape`                     | Scrape and index a URL                |
| `POST`   | `/supervisor/instructions`    | Set supervisor agent instructions     |
| `POST`   | `/sessions`                   | Create a new chat session             |
| `GET`    | `/sessions`                   | List all chat sessions                |
| `GET`    | `/sessions/:id/messages`      | Get message history for a session     |
| `DELETE` | `/sessions/:id`               | Delete a chat session                 |

---

## State Management

State is managed with **Pinia** using the Composition API style:

### `chat` store
- **Messages** array with `{ type, text }` entries (`user`, `agent`, or `error`)
- WebSocket event handling — stream assembly, routing status, thinking state
- Connection lifecycle — `connect`, `disconnect`, `switchSession`, `sendMessage`

### `session` store
- Session CRUD via REST API
- Tracks `currentSessionId` and the full `sessions` list
- Loads message history on session switch

### `settings` store
- **Strict mode** — limits agent to retrieved context only
- **Temperature** — controls response randomness (0.0 – 1.0)
- **Supervisor instructions** — custom prompt for the supervisor agent

---

## Scripts

| Command          | Description                                |
| ---------------- | ------------------------------------------ |
| `npm run dev`    | Start Vite dev server on port 3000         |
| `npm run build`  | Type-check with `vue-tsc` and build for production |
| `npm run preview`| Preview the production build locally       |
