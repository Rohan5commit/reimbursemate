# ReimburseMate — Setup Guide

## Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn
- NVIDIA NIM API key (get one at [build.nvidia.com](https://build.nvidia.com))

## Installation

```bash
cd reimbursemate
npm install
```

## Environment Variables

Create `.env.local` in the project root:

```bash
NVIDIA_NIM_API_KEY=nvapi-your-key-here
```

Or configure the API key through the in-app Settings modal (stored in localStorage).

## Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running Tests

```bash
npm test
```

## Building for Production

```bash
npm run build
npm start
```

## NVIDIA NIM Setup

1. Go to [build.nvidia.com](https://build.nvidia.com)
2. Create an account
3. Navigate to API Catalog
4. Generate an API key (starts with `nvapi-`)
5. Paste the key in the app's Settings modal or add to `.env.local`

### Models Used

- **Text extraction**: `nvidia/llama-3.1-nemotron-70b-instruct`
- **Image OCR**: `nvidia/neva-22b`

## Project Structure

```
reimbursemate/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── screens/      # Page screens
│   │   └── layout/       # App shell
│   └── lib/
│       ├── ai/           # NVIDIA NIM client
│       ├── demo/         # Demo presets
│       ├── policy/       # Policy engine
│       ├── schemas/      # Zod schemas
│       └── state/        # React Context store
├── docs/                 # Documentation
├── .env.local            # Environment variables
└── package.json
```

## Troubleshooting

- **API key error**: Ensure your NVIDIA NIM key is valid and starts with `nvapi-`
- **Extraction fails**: Try pasting text manually or using a demo preset
- **Build errors**: Run `npm install` to ensure all dependencies are installed
