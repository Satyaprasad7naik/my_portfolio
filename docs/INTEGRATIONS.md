# Integration details and limitations

## Email

The website posts enquiries to the Express API. The API uses Gmail SMTP via Nodemailer. The Gmail username, App Password and destination inbox are server environment variables; they must never go in React source or a `VITE_` variable. Google may require 2-Step Verification before creating App Passwords, and some managed accounts may disallow them.

## WhatsApp

The profile/contact button uses a `https://wa.me/` link and needs only an international-format phone number. The optional server notification adapter uses Meta's WhatsApp Cloud API. Supply a valid Cloud API access token, sender Phone Number ID, recipient number, and a currently supported Graph API version. Meta account onboarding, permissions, number setup and messaging policy requirements remain external prerequisites. A user-initiated WhatsApp conversation and business-initiated notifications may have different template/window rules.

Current official starting points:
- https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
- https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
- https://developers.facebook.com/docs/graph-api/guides/versioning

## Facebook / Instagram

Only profile links are implemented. Publishing content, reading analytics, managing DMs, or pulling Instagram business account information requires a Meta app, OAuth flow, permissions, app review where applicable, and token storage/refresh. Do not treat a public profile URL as an authenticated integration.

Starting point: https://developers.facebook.com/docs/graph-api

## Production requirements

- Use HTTPS and set `CLIENT_ORIGIN` explicitly.
- Set secrets in the hosting service's server environment settings.
- Rotate tokens/app passwords if exposed.
- Configure monitoring and a retention/deletion policy for incoming enquiry data.
- Verify actual Meta/Gmail permissions with a controlled test submission before launch.
