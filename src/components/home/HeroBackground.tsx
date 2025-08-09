import React from 'react';

const HeroBackground: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
    {/* Subtle dot grid pattern using currentColor (foreground token) */}
    <svg className="absolute inset-0 h-full w-full opacity-10 text-foreground">
      <defs>
        <pattern id="hero-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-dots)" />
    </svg>

    {/* Soft radial accents to add depth while staying monochrome */}
    <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-foreground/5 blur-3xl" />
    <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-foreground/5 blur-3xl" />

    {/* Hairline divider for structure */}
    <div className="absolute inset-x-0 top-0 h-px bg-border/60" />
  </div>
);

export default HeroBackground;
