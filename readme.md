# Language App Frontend

A React + TypeScript frontend for a language learning application that generates AI-powered flashcards, supports challenge gameplay, and integrates with a FastAPI backend for authentication, flashcard generation, caching, and game question delivery.

---

## Features

- Phrase flashcard generation
- Topic-based flashcard generation
- Challenge / game mode
- Source and target language selection
- Validation to prevent identical source and target languages
- Searchable topic input with creatable autocomplete
- Structured dropdowns for difficulty and text type
- Flashcard answer selection and feedback
- Session-based authentication UI
- Google login
- Guest login via magic link
- Protected app routes

---

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Axios
- React Select

---

## Project Structure

```text
src/
├── api/
│   └── flashcards.ts
├── components/
│   ├── AppLayout.tsx
│   ├── AuthGate.tsx
│   ├── ErrorMessage.tsx
│   ├── FlashcardResult.tsx
│   ├── GameCard.tsx
│   ├── LoginOverlay.tsx
│   └── RequireAuth.tsx
├── hooks/
│   └── useAuth.ts
├── pages/
│   ├── GamePage.tsx
│   ├── LoginPage.tsx
│   ├── MagicLogin.tsx
│   ├── PhrasePage.tsx
│   └── TopicPage.tsx
├── types/
│   └── flashcard.ts
├── App.tsx
├── index.css
└── main.tsx
```

---

## Requirements

* Node.js 20.19+ or 22.12+
* npm
* Running backend API

---

## Installation

### 1. Install dependencies

```bash
npm install
```

### 2. Install frontend-specific packages

If they are not already installed:

```bash
npm install axios react-router-dom react-select
```

---

## Environment Variables

Create a `.env` file in the frontend project root.

Example:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

If using `localhost` consistently in your local environment:

```env
VITE_API_BASE_URL=http://localhost:8000
```

The frontend should use the same host convention as the backend session/auth setup.

---

## Running Locally

Start the development server:

```bash
npm run dev
```

If you want Vite to bind explicitly to `127.0.0.1`:

```bash
npm run dev -- --host 127.0.0.1
```

Typical local frontend URL:

```text
http://127.0.0.1:5173
```

or

```text
http://localhost:5173
```

Use the same host convention consistently across frontend and backend auth configuration.

---

## Backend Dependency

This frontend expects a FastAPI backend that provides:

* session-based authentication
* `/auth/me`
* `/auth/logout`
* `/auth/google/login`
* `/auth/magic-link/start`
* `/auth/magic-link/redeem`
* `/api/flashcards/phrase`
* `/api/flashcards/topic`
* `/api/game/next-question`

The backend must support credentials-based requests and CORS for the frontend origin.

---

## Main Screens

### Login Page

`LoginPage.tsx`

Provides:

* Google login
* Guest login via magic link

### Magic Login Page

`MagicLogin.tsx`

Handles:

* reading the `token` query parameter
* redeeming the guest magic link
* redirecting back into the app after successful login

### Phrase Page

`PhrasePage.tsx`

Provides:

* multi-line phrase input
* source language dropdown
* target language dropdown
* text type dropdown
* number of options input
* validation for invalid language pairs
* session-based "Try Another" behavior with seen-card tracking

### Topic Page

`TopicPage.tsx`

Provides:

* topic input with searchable creatable autocomplete
* difficulty dropdown
* source and target language dropdowns
* text type dropdown
* number of options input
* session-based "Try Another" behavior with seen-card tracking

### Game Page

`GamePage.tsx`

Provides:

* challenge mode with:

  * score
  * lives
  * difficulty progression
  * source and target language dropdowns
  * text type dropdown
  * non-repeating question flow
  * prefetching of next question
  * buffered next-question loading

---

## Authentication Flow

### Logged-in Users

Authenticated users can access:

* Phrase mode
* Topic mode
* Challenge mode

The navbar displays:

* avatar initials
* display name or username
* account type
* logout button

### Unauthenticated Users

Unauthenticated users see:

* the application shell
* blurred preview of app content
* login overlay

This is handled by `AuthGate.tsx` and `LoginOverlay.tsx`.

### Session Check

`useAuth.ts` fetches:

```text
GET /auth/me
```

with:

```ts
credentials: "include"
```

to detect the current authenticated user.

---

## Routing

The app uses React Router.

Routes:

* `/login`
* `/magic-login`
* `/`
* `/topic`
* `/game`

`App.tsx` wires routing, shared layout, and auth gating.

---

## Layout

`AppLayout.tsx` provides:

* shared top navigation
* Phrase / Topic / Challenge links
* current user display
* logout action
* avatar circle with initials

---

## API Layer

`src/api/flashcards.ts`

Contains API calls for:

* phrase flashcard generation
* topic flashcard generation
* next game question retrieval

All requests use the backend base URL from `VITE_API_BASE_URL`.

---

## Types

`src/types/flashcard.ts`

Contains frontend types for:

* flashcard responses
* phrase request payloads
* topic request payloads
* game-related types

---

## UI Behavior

### Source / Target Language Validation

Phrase, Topic, and Game pages prevent the source language and target language from being identical.

This is enforced in the frontend UI by:

* filtering target language options
* disabling actions when invalid
* showing an error message when needed

### Text Type

Text type is represented as a dropdown because it uses a controlled set of values.

### Difficulty

Difficulty is represented as a dropdown because it uses a controlled set of values.

### Topic

Topic uses a creatable searchable autocomplete so the user can:

* pick a suggested topic
* type a custom topic
* quickly reuse common topics

### Flashcard Answering

`FlashcardResult.tsx` supports:

* answer option selection
* check answer
* correct / incorrect feedback
* try again
* try another
* exhausted-state handling

### Game Answering

`GameCard.tsx` supports:

* answer selection
* correct/wrong result handling
* progression to next question

---

## Styling

Global styles live in:

```text
src/index.css
```

The styling includes:

* app shell layout
* topbar and nav tabs
* panels and cards
* button styles
* form layout
* responsive adjustments
* avatar circle
* blurred preview mode
* loading spinner
* answer option states
* game stats

---

## Guest Login Flow

1. User clicks **Continue as Guest**
2. Frontend calls:

```text
POST /auth/magic-link/start
```

3. Backend returns a login link
4. Frontend redirects to that link
5. `MagicLogin.tsx` redeems the token via:

```text
POST /auth/magic-link/redeem
```

6. Backend sets the session cookie
7. Frontend redirects into the app

---

## Google Login Flow

1. User clicks **Continue with Google**
2. Frontend navigates to:

```text
/auth/google/login
```

3. Backend redirects to Google
4. Google redirects back to backend callback
5. Backend creates session and redirects to frontend
6. Frontend session is then available through `/auth/me`

---

## Logout Flow

The logout button sends:

```text
POST /auth/logout
```

and then returns the user to the app shell, where unauthenticated users see the blurred preview and login overlay.

---

## Challenge Mode Details

Challenge mode uses:

* score tracking
* 3 lives
* dynamic difficulty progression
* prefetching for smoother gameplay
* backend batch question support
* non-repeating question tracking using `exclude_source_texts`

Game progression:

* score increases on correct answer
* a life is removed on wrong answer
* game ends when lives reach zero

---

## Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## Notes

* Authentication relies on browser cookies, so frontend requests to auth-protected backend endpoints must use:

```ts
credentials: "include"
```

* Local development works best when frontend and backend use a consistent host convention (`localhost` or `127.0.0.1`) across all auth-related URLs.
* The frontend assumes the backend handles session storage, validation, and renewal.

---

## Example Development Workflow

### Terminal 1: backend

```bash
uvicorn app.main:app --reload
```

### Terminal 2: frontend

```bash
npm run dev
```

Then open the frontend URL shown by Vite.

---

## Current User Display

The navbar uses:

* `display_name` when available
* fallback to `username` otherwise

This is especially useful for:

* Google users with real profile names
* local users with generated usernames
* guest users with generated guest identities

---

## Frontend Libraries in Use

### React Router

Used for:

* page routing
* login redirect handling
* layout structure

### Axios

Used for:

* backend API calls in the flashcard/game API layer

### React Select

Used for:

* searchable, creatable topic autocomplete in Topic mode

---

## Commands

Install:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Run dev server on a specific host:

```bash
npm run dev -- --host 127.0.0.1
```

Build:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

