import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface AEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'software' | 'service';
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  canonical?: string;
  // AEO-specific props
  aiContext?: string;
  entityType?: 'SoftwareApplication' | 'Service' | 'Organization' | 'Product';
  features?: string[];
  useCases?: string[];
  targetAudience?: string[];
  pricing?: {
    model: 'free' | 'freemium' | 'subscription' | 'one-time';
    currency?: string;
    amount?: number;
  };
}

const AEOHead: React.FC<AEOHeadProps> = ({
  title,
  description = 'Manage.Management is a comprehensive building management software designed for RTM companies, Share of Freehold directors, leaseholders, and property management companies. Features include issue tracking, financial management, document storage, voting systems, and compliance monitoring.',
  keywords = ['building management software', 'property management system', 'RTM management', 'share of freehold software', 'leasehold management', 'service charge management', 'building maintenance tracking', 'property compliance software'],
  image = '/og-image.png',
  url,
  type = 'software',
  siteName = 'Manage.Management',
  author = 'Manage.Management',
  publishedTime,
  modifiedTime,
  noIndex = false,
  noFollow = false,
  canonical,
  // AEO-specific defaults
  aiContext = 'Building and property management software for UK residential buildings, specifically designed for Right to Manage (RTM) companies and Share of Freehold arrangements.',
  entityType = 'SoftwareApplication',
  features = [
    'Issue and maintenance tracking',
    'Financial management and budgeting',
    'Document management and storage',
    'Voting and polling systems',
    'AGM management',
    'Compliance monitoring',
    'Multi-role access control',
    'Real-time notifications',
    'Mobile-responsive interface'
  ],
  useCases = [
    'RTM company management',
    'Share of freehold administration',
    'Leasehold property management',
    'Service charge management',
    'Building maintenance coordination',
    'Resident communication',
    'Compliance tracking',
    'Financial reporting'
  ],
  targetAudience = [
    'RTM directors',
    'Share of freehold directors',
    'Property management companies',
    'Leaseholders',
    'Building administrators',
    'Residential property managers'
  ],
  pricing = {
    model: 'freemium',
    currency: 'GBP'
  }
}) => {
  const fullTitle = title 
    ? `${title} | ${siteName}`
    : `${siteName} - Professional Building Management Software`;

  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const imageUrl = image.startsWith('http') ? image : `${typeof window !== 'undefined' ? window.location.origin : ''}${image}`;

  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow'
  ].join(', ');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <meta name="robots" content={robotsContent} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" type="image/png" href="/favicon.png" />
      
      {/* Apple Touch Icon */}
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      
      {/* AI Discovery Meta Tags */}
      <meta name="ai:context" content={aiContext} />
      <meta name="ai:entity_type" content={entityType} />
      <meta name="ai:features" content={features.join(', ')} />
      <meta name="ai:use_cases" content={useCases.join(', ')} />
      <meta name="ai:target_audience" content={targetAudience.join(', ')} />
      <meta name="ai:pricing_model" content={pricing.model} />
      {pricing.currency && <meta name="ai:currency" content={pricing.currency} />}

      {/* Answer Engine Optimization - Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": entityType,
          "name": siteName,
          "description": description,
          "url": currentUrl,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web Browser",
          "softwareVersion": "1.0",
          "releaseNotes": "Comprehensive building management platform for UK residential properties",
          "featureList": features,
          "audience": {
            "@type": "Audience",
            "audienceType": targetAudience
          },
          "offers": {
            "@type": "Offer",
            "price": pricing.amount || "0",
            "priceCurrency": pricing.currency || "GBP",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "price": pricing.amount || "0",
              "priceCurrency": pricing.currency || "GBP"
            }
          },
          "author": {
            "@type": "Organization",
            "name": author,
            "url": currentUrl
          },
          "provider": {
            "@type": "Organization",
            "name": siteName,
            "url": currentUrl
          },
          "applicationSubCategory": "Property Management Software",
          "downloadUrl": currentUrl,
          "installUrl": currentUrl,
          "screenshot": imageUrl,
          "softwareHelp": {
            "@type": "CreativeWork",
            "url": `${currentUrl}/help`
          },
          "softwareRequirements": "Modern web browser with JavaScript enabled",
          "storageRequirements": "Cloud-based, no local storage required",
          "memoryRequirements": "Minimal - web-based application",
          "processorRequirements": "Any device capable of running a modern web browser",
          "permissions": "Internet access required",
          "countriesSupported": "United Kingdom",
          "inLanguage": "en-GB",
          "isAccessibleForFree": true,
          "usageInfo": {
            "@type": "CreativeWork",
            "name": "How to use Manage.Management",
            "description": "Comprehensive building management for RTM companies and Share of Freehold properties",
            "text": `Manage.Management is designed for: ${useCases.join(', ')}. Key features include: ${features.join(', ')}.`
          }
        })}
      </script>

      {/* FAQ Schema for Answer Engines */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is Manage.Management?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `Manage.Management is a comprehensive building management software platform designed specifically for UK residential properties. It serves RTM (Right to Manage) companies, Share of Freehold directors, leaseholders, and property management companies with tools for ${features.slice(0, 5).join(', ')}.`
              }
            },
            {
              "@type": "Question",
              "name": "Who can use Manage.Management?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `Manage.Management is designed for ${targetAudience.join(', ')}. The platform provides role-based access ensuring each user type sees relevant features and information.`
              }
            },
            {
              "@type": "Question",
              "name": "What are the main features of Manage.Management?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `Key features include: ${features.join(', ')}. The platform is specifically designed for UK building management requirements and compliance.`
              }
            },
            {
              "@type": "Question",
              "name": "How much does Manage.Management cost?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `Manage.Management operates on a ${pricing.model} model. The platform offers essential building management features with options for enhanced functionality.`
              }
            },
            {
              "@type": "Question",
              "name": "What types of buildings can use Manage.Management?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Manage.Management is designed for UK residential buildings including RTM-managed properties, Share of Freehold arrangements, leasehold buildings, and properties managed by professional management companies."
              }
            }
          ]
        })}
      </script>
    </Helmet>
  );
};

export default AEOHead;
