# Satyaprasad Naik — Full-Stack Portfolio

A VS Code-ready full-stack starter for the reimagined portfolio. It includes a responsive portfolio interface, interactive project details and filters, a React/Vite frontend, an Express API, a lead/enquiry form, Gmail delivery through server-side SMTP, configurable WhatsApp/social links, an optional WhatsApp Cloud API notification adapter, tests, and a small GitHub Actions workflow.

> **Connection status:** the source code and integration points are included. External accounts are not signed in or connected by this ZIP. You must add your own URLs, Gmail App Password, and (if desired) Meta WhatsApp Cloud API credentials in the root `.env` file. Instagram and Facebook are linked as profiles in this version; it does not publish posts or read insights through the Meta Graph API.

## 1. Requirements

- Node.js 20 or newer
- npm 10 or newer
- Visual Studio Code (recommended)
- A Gmail account with an App Password for email delivery, if using the contact form
- A WhatsApp number for the click-to-chat button; a WhatsApp Business Platform app is optional

## 2. Open in VS Code

1. Extract the ZIP folder.
2. Open the folder `satyaprasad-portfolio-fullstack` in VS Code.
3. In the integrated terminal, run:

   ```bash
   npm install
   ```

4. Copy the example environment file and edit it:

   **macOS/Linux**
   ```bash
   cp .env.example .env
   ```

   **Windows PowerShell**
   ```powershell
   Copy-Item .env.example .env
   ```

5. Replace placeholder values in `.env`. Do not paste tokens, app passwords or secrets into any frontend file.
6. Start frontend and backend together:

   ```bash
   npm run dev
   ```

7. Open **http://localhost:5173**. The API runs at **http://localhost:4000**.

Useful commands:

```bash
npm run dev:web    # frontend only
npm run dev:api    # API only
npm run build      # production frontend build
npm test           # server validation tests
npm run check      # tests + production build
npm start          # start API in production mode
```

## 3. Configure contact and profile links

Edit the root `.env` file:

- `CONTACT_EMAIL`: email address shown publicly by the website for direct email.
- `WHATSAPP_PHONE`: international phone digits, including country code, with no `+`, spaces or punctuation. India example format: `919876543210`.
- `FACEBOOK_URL`, `INSTAGRAM_URL`, `LINKEDIN_URL`, `GITHUB_URL`: real profile/page URLs. Leave a variable blank to hide that link.
- `CLIENT_ORIGIN`: frontend origin allowed by the API. During local development use `http://localhost:5173`; in production set your actual website origin(s), comma-separated if required.

The API sends only safe public contact settings from `GET /api/config`. Secret values are never returned to the browser.

## 4. Enable Gmail delivery for the enquiry form

1. Use the Gmail account you want to send from.
2. Enable 2-Step Verification in that Google account if required.
3. Create an **App Password** for the application. Do not use your normal Google account password.
4. Set these server-side variables in `.env`:

   ```dotenv
   GMAIL_USER=your-gmail-address@gmail.com
   GMAIL_APP_PASSWORD=your-google-app-password
   CONTACT_INBOX=where-you-want-enquiries-delivered@example.com
   CONTACT_EMAIL=the-public-contact-address@example.com
   ```

5. Restart `npm run dev` and submit a test enquiry.

The backend validates form data, limits contact submissions, and sends the enquiry to the configured inbox. The visitor's email is used as `Reply-To`; the form does not send arbitrary outbound email to the visitor. If Gmail is not configured, the API returns a clear setup error rather than claiming that the message was delivered.

## 5. WhatsApp connection options

### Simple WhatsApp click-to-chat

Set `WHATSAPP_PHONE` to your number with country code. The portfolio will display a WhatsApp link that opens a prefilled message in WhatsApp. This does not require a Meta API token.

### Optional WhatsApp Cloud API lead notification

For server-to-server alerts to a configured business destination, set:

```dotenv
WHATSAPP_ACCESS_TOKEN=your_meta_system_user_or_cloud_api_token
WHATSAPP_PHONE_NUMBER_ID=your_meta_sender_phone_number_id
WHATSAPP_TO_NUMBER=919876543210
WHATSAPP_API_VERSION=v26.0
```

Use the Graph API version currently supported for your Meta app. The notification uses the official Graph API endpoint. Your WhatsApp Business Platform account, phone number, permissions, recipient eligibility/consent, and Meta's messaging-window/template rules still apply. A token by itself does not complete Meta onboarding. Keep tokens private and rotate them if accidentally exposed.

## 6. Facebook and Instagram

This starter provides configurable, secure external links to Facebook and Instagram profiles/pages. Posting, managing messages, reading insights, or connecting an Instagram professional account through the Meta Graph API requires a Meta developer app, OAuth, required permissions, and in some cases app review. Those account-management features are **not activated by profile links** and should be built only after the specific Meta app and account permissions are supplied.

## 7. API endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | API liveness check |
| `GET` | `/api/config` | Public contact and social-link configuration, never secrets |
| `POST` | `/api/contact` | Validate enquiry and route to configured Gmail and/or WhatsApp Cloud API |

## 8. Git / GitHub

A `.gitignore`, VS Code workspace recommendations and a GitHub Actions build/test workflow are included. To begin tracking the extracted folder:

```bash
git init
git add .
git commit -m "Initial full-stack portfolio"
```

Create an empty repository on GitHub, then use the repository URL GitHub provides:

```bash
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git branch -M main
git push -u origin main
```

Never commit `.env`. The included `.gitignore` excludes it.

## 9. Deploying

Deploy the frontend and API with HTTPS. The most straightforward arrangement is:

- Build and host the Vite frontend from `client/` (`npm run build --workspace=client`; output directory `client/dist`).
- Host the Express API from the repository root using `npm start` or from the `server/` workspace with `npm start --workspace=server`.
- Set the API's environment variables on the hosting provider's secret/environment settings.
- Set `CLIENT_ORIGIN` to the deployed frontend origin. If frontend and backend use different domains, copy `client/.env.example` to `client/.env`, set `VITE_API_BASE_URL` to the HTTPS API origin, and rebuild the frontend. The API must allow the frontend origin in `CLIENT_ORIGIN`. If both are under one origin, configure a reverse proxy for `/api`.
- Do not publish `.env` or put SMTP/API tokens in variables prefixed with `VITE_`.

Before announcing the portfolio publicly, replace concept artwork/case-study descriptions with approved actual assets, confirm your exact role in each project, enter your correct contacts, test the mobile version, and submit a test enquiry in production.

## Folder map

```text
client/
  public/favicon.svg
  src/App.jsx                     React host, interactions and contact wiring
  src/main.jsx                    React entry point
  src/portfolio-content.html      Portfolio layout markup
  src/styles/portfolio.css        Portfolio visual system
  src/styles/integrations.css     Enquiry form + integration styling
  index.html                      SEO/browser shell
  vite.config.js                  Local API proxy
server/
  src/index.js                    Express routes and security middleware
  src/integrations.js             Gmail + WhatsApp Cloud API adapters
  src/validation.js               Input normalisation and validation
  test/validation.test.js         Node built-in tests
.env.example                     Server configuration template
client/.env.example              Optional frontend configuration notes
.github/workflows/ci.yml          Automated build + test check
.vscode/extensions.json          Suggested editor extensions
.vscode/tasks.json               VS Code run/build/test tasks
```
