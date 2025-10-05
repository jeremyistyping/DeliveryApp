export const generateOrderNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const timestamp = now.getTime();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `ORD-${year}${month}${day}-${timestamp.toString().slice(-4)}${random}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with +62
  if (cleaned.startsWith('0')) {
    return `+62${cleaned.substring(1)}`;
  }
  
  // If starts with 62, add +
  if (cleaned.startsWith('62')) {
    return `+${cleaned}`;
  }
  
  // If no country code, assume Indonesian
  return `+62${cleaned}`;
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const generateTrackingNumber = (courier: string): string => {
  const prefix = courier.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  
  return `${prefix}${timestamp.slice(-6)}${random}`;
};