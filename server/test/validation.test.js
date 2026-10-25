import test from 'node:test';
import assert from 'node:assert/strict';
import { normaliseContact, validateContact, digitsOnly } from '../src/validation.js';
import { getPublicConfig } from '../src/public-config.js';

test('normaliseContact trims and collapses name whitespace', () => {
  assert.equal(normaliseContact({ name: '  Satyaprasad   Naik  ' }).name, 'Satyaprasad Naik');
});

test('validateContact accepts a complete valid enquiry', () => {
  const result = validateContact({ name: 'Satyaprasad Naik', email: 'hello@example.com', phone: '+91 98765 43210', projectType: 'Website / digital experience', message: 'I would like to discuss a portfolio website.' });
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('validateContact rejects malformed email and too-short message', () => {
  const result = validateContact({ name: 'A', email: 'not-an-email', projectType: '', message: 'Hi' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.length >= 4);
});

test('digitsOnly strips phone formatting', () => {
  assert.equal(digitsOnly('+91 (98765) 43210'), '919876543210');
});

test('getPublicConfig never returns mail password or access token', () => {
  const config = getPublicConfig({ CONTACT_EMAIL: 'hello@example.com', GMAIL_USER: 'hello@gmail.com', GMAIL_APP_PASSWORD: 'secret', CONTACT_INBOX: 'hello@gmail.com', WHATSAPP_ACCESS_TOKEN: 'token-secret', WHATSAPP_PHONE_NUMBER_ID: '123', WHATSAPP_TO_NUMBER: '919876543210', INSTAGRAM_URL: 'javascript:alert(1)', FACEBOOK_URL: 'https://facebook.com/example' });
  assert.equal(config.contactEmail, 'hello@example.com');
  assert.equal(config.socials.instagram, '');
  assert.equal(config.socials.facebook, 'https://facebook.com/example');
  assert.equal(config.integrations.gmailConfigured, true);
  assert.equal(config.integrations.whatsappCloudConfigured, true);
  assert.equal(JSON.stringify(config).includes('secret'), false);
  assert.equal(JSON.stringify(config).includes('token-secret'), false);
});
