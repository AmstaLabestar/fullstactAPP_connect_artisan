export function normalizeWhatsAppPhone(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) {
    return '';
  }

  let digits = trimmed.replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  return digits;
}

export function buildWhatsAppLink(phone: string, message?: string): string {
  const normalizedPhone = normalizeWhatsAppPhone(phone);
  if (!normalizedPhone) {
    return '';
  }

  const base = `https://wa.me/${normalizedPhone}`;
  const trimmedMessage = message?.trim();
  if (!trimmedMessage) {
    return base;
  }

  return `${base}?text=${encodeURIComponent(trimmedMessage)}`;
}

