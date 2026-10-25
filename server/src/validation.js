export function normaliseContact(input = {}) {
  return {
    name: typeof input.name === 'string' ? input.name.trim().replace(/\s+/g, ' ') : '',
    email: typeof input.email === 'string' ? input.email.trim().toLowerCase() : '',
    phone: typeof input.phone === 'string' ? input.phone.trim().slice(0, 30) : '',
    projectType: typeof input.projectType === 'string' ? input.projectType.trim().replace(/\s+/g, ' ').slice(0, 100) : '',
    message: typeof input.message === 'string' ? input.message.trim() : ''
  };
}

export function validateContact(input = {}) {
  const value = normaliseContact(input);
  const errors = [];
  if (value.name.length < 2 || value.name.length > 100) errors.push('Name must be between 2 and 100 characters.');
  if (value.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) errors.push('Enter a valid email address.');
  if (value.phone.length > 30) errors.push('Phone number is too long.');
  if (!value.projectType || value.projectType.length > 100) errors.push('Choose a project type.');
  if (value.message.length < 10 || value.message.length > 4000) errors.push('Message must be between 10 and 4,000 characters.');
  return { valid: errors.length === 0, value, errors };
}

export function digitsOnly(value = '') {
  return String(value).replace(/\D/g, '');
}
