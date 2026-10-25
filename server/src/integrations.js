import nodemailer from 'nodemailer';
import { digitsOnly } from './validation.js';


export async function sendGmailContact(contact, env = process.env) {
  const inbox = env.CONTACT_INBOX || env.CONTACT_EMAIL;
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD || !inbox) throw new Error('Gmail contact delivery is not configured.');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD }
  });
  const safeMessage = contact.message.replace(/\r/g, '');
  const content = [
    'New portfolio enquiry',
    '',
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    `Phone / WhatsApp: ${contact.phone || 'Not supplied'}`,
    `Project type: ${contact.projectType}`,
    '',
    'Message:',
    safeMessage
  ].join('\n');
  await transporter.sendMail({
    from: `Portfolio contact <${env.GMAIL_USER}>`,
    to: inbox,
    replyTo: contact.email,
    subject: `[Portfolio enquiry] ${contact.projectType} — ${contact.name}`,
    text: content
  });
  return true;
}

export async function sendWhatsAppNotification(contact, env = process.env) {
  const { WHATSAPP_ACCESS_TOKEN: token, WHATSAPP_PHONE_NUMBER_ID: senderId, WHATSAPP_TO_NUMBER: recipient } = env;
  if (!token || !senderId || !recipient) throw new Error('WhatsApp Cloud API notification is not configured.');
  const version = String(env.WHATSAPP_API_VERSION || 'v26.0').replace(/[^v0-9.]/g, '');
  const phone = digitsOnly(recipient);
  if (phone.length < 10 || phone.length > 15) throw new Error('WhatsApp notification recipient number is invalid.');
  const body = [
    'New portfolio enquiry',
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    `Phone: ${contact.phone || 'Not supplied'}`,
    `Project: ${contact.projectType}`,
    `Message: ${contact.message}`
  ].join('\n');
  const response = await fetch(`https://graph.facebook.com/${version}/${encodeURIComponent(senderId)}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to: phone, type: 'text', text: { preview_url: false, body } }),
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) {
    const details = await response.text().catch(() => 'No error details');
    throw new Error(`WhatsApp Cloud API returned ${response.status}: ${details.slice(0, 500)}`);
  }
  return true;
}
