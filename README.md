# CoNext — Company Website

A responsive Next.js company website based on the CoNext light-blue brand.

## Included

- Responsive company homepage
- About page
- Services page
- Partnership / commercial-model page
- Contact page with a form that saves enquiries through a separate Express contact server
- CoNext brand logo and handshake hero banner
- Mobile navigation-friendly layout
- SEO metadata / Open Graph image
- Contact icons and reusable components
- Compliance / transparency language for legitimate cross-border collaboration

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Production build:

```bash
npm run build
npm start
```

## IMPORTANT — update before deployment

Edit `src/config/site.ts` and replace these placeholders with verified company details:

- `email`
- `phone`
- `linkedin`
- `website`

Also update the `metadataBase` URL in `src/app/layout.tsx` if the production domain is different.

## Branding assets

Assets are under `public/brand/`:

- `conext-logo.png`
- `conext-handshake-hero.png`

Contact icons are under `public/icons/`.

## Contact form

The contact form posts to a separate Express server (`server/`), which saves each enquiry to a CSV file.

### 1. Configure

```bash
cp server/.env.example server/.env
cp .env.local.example .env.local
```

### 2. Install and run the contact server

```bash
cd server && npm install && cd ..
npm run dev:mail
```

### 3. Run the website

```bash
npm run dev
```

Website: `http://localhost:3000`  
Contact API: `http://localhost:4000`

Production:

```bash
npm run start:mail
```

Set `FRONTEND_ORIGIN` to your live site origin(s), and `NEXT_PUBLIC_MAIL_API_URL` to the public contact-server URL.

Each enquiry is appended to `server/data/contacts.csv` with:

| Field | Purpose |
| --- | --- |
| `id` | Unique row id |
| `name` | Sender name |
| `gmail` | Sender email |
| `company` | Optional organisation |
| `content` | Message body |
| `created_at` | UTC ISO timestamp |
| `ip` | Request IP for basic abuse/debug trail |

The CSV file is created automatically on the first submission.

### CoNext Assist (AI chat)

The bottom-right Assist button opens an AI chat grounded in CoNext business content.

1. Add your OpenAI-compatible key to `server/.env` (OpenAI or OpenRouter):

```bash
# OpenRouter
OPENAI_API_KEY=sk-or-v1-...
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=openai/gpt-4o-mini
```

2. Restart the contact server (`npm run dev:mail`).

Chat requests go to `POST /api/assist`. Knowledge used by the assistant lives in `server/businessKnowledge.js`.

## Deployment

The project can be deployed to Vercel, Netlify with Next.js support, or any Node.js server capable of running Next.js.
