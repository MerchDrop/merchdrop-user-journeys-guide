/**
 * Utility functions for generating and matching pretty links (slugs) for products.
 */

export const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

export const getProductUrl = (product?: { id?: string; slug?: string | null; title?: string | null; name?: string | null } | null): string => {
  if (!product) return '/products';
  if (product.slug && product.slug.trim()) {
    return `/product/${product.slug.trim()}`;
  }
  const title = product.title || product.name;
  if (title) {
    const generated = slugify(title);
    if (generated) {
      return `/product/${generated}`;
    }
  }
  return `/product/${product.id || ''}`;
};
