import { digitsOnly } from './validation.js';

export function getPublicConfig(env = process.env) {
  const cleanUrl = (raw = '') => {
    const value = String(raw).trim();
    if (!value) return '';
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
    } catch { return ''; }
  };
  return {
    contactEmail: String(env.CONTACT_EMAIL || '').trim(),
    whatsappPhone: digitsOnly(env.WHATSAPP_PHONE || ''),
    socials: {
      facebook: cleanUrl(env.FACEBOOK_URL),
      instagram: cleanUrl(env.INSTAGRAM_URL),
      linkedin: cleanUrl(env.LINKEDIN_URL),
      github: cleanUrl(env.GITHUB_URL)
    },
    integrations: {
      gmailConfigured: Boolean(env.GMAIL_USER && env.GMAIL_APP_PASSWORD && (env.CONTACT_INBOX || env.CONTACT_EMAIL)),
      whatsappCloudConfigured: Boolean(env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID && env.WHATSAPP_TO_NUMBER)
    }
  };
}

