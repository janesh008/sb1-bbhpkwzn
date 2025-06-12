import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function createImageUrl(src: string): string {
  // If the image is already a URL, return it
  if (src.startsWith('http')) return src;
  
  // Otherwise, assume it's a path to an image in Supabase storage
  // In a real app, you would construct the full URL
  return `https://your-project-url.supabase.co/storage/v1/object/public/images/${src}`;
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '';
  
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}