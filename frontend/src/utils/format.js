// src/utils/format.js

export const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

export const formatDate = (date) =>
  new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));

export const truncate = (str, n) =>
  str?.length > n ? str.substring(0, n) + '...' : str;

export const getImageUrl = (url) => {
  if (!url) return null;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ventech-backend-wyoc.onrender.com/api' : '');
  const backendUrl = apiUrl.replace(/\/api\/?$/, '');

  if (url.startsWith('/uploads')) {
    return backendUrl ? `${backendUrl}${url}` : url;
  }

  if (url.startsWith('uploads/')) {
    const normalizedUrl = `/${url}`;
    return backendUrl ? `${backendUrl}${normalizedUrl}` : normalizedUrl;
  }

  return url;
};

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
