import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const SEOHelmet: React.FC<SEOHelmetProps> = ({
  title = 'MerchDrop - Creator Merchandise Platform',
  description = 'Shop official merch from independent artists, or create and sell your own on MerchDrop.',
  keywords = 'artist merch, creator merchandise, Nigerian artists, t-shirts, hoodies, MerchDrop',
  image = '/Merchdrop.png',
  url = window.location.href,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
}) => {
  const siteTitle = 'MerchDrop';
  // Social apps need absolute image URLs.
  const imageUrl = image.startsWith('http') ? image : `${window.location.origin}${image}`;
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author || siteTitle} />
      <link rel="canonical" href={url} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@merchdrop" />

      {/* Article specific tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta httpEquiv="Content-Language" content="en" />
      
      {/* Favicon and App Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Structured Data for Products */}
      {type === 'product' && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: title,
            description: description,
            image: imageUrl,
            url: url,
            brand: {
              '@type': 'Brand',
              name: siteTitle,
            },
          })}
        </script>
      )}
    </Helmet>
  );
};

export { SEOHelmet };
export default SEOHelmet;