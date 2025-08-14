import React from 'react';

const HeroBackground: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
    {/* Spline background with flowing organic shapes */}
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="spline-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--background))" />
          <stop offset="50%" stopColor="hsl(var(--foreground) / 0.15)" />
          <stop offset="100%" stopColor="hsl(var(--background))" />
        </linearGradient>
      </defs>
      
      {/* Main flowing spline shapes - more visible */}
      <path
        d="M0,300 Q200,100 400,200 T800,300 Q900,400 1000,200 L1000,0 L0,0 Z"
        fill="hsl(var(--foreground) / 0.08)"
        className="animate-pulse"
        style={{ animationDuration: '8s' }}
      />
      <path
        d="M0,600 Q300,400 600,500 T1000,600 L1000,1000 L0,1000 Z"
        fill="hsl(var(--foreground) / 0.06)"
        className="animate-pulse"
        style={{ animationDuration: '12s', animationDelay: '2s' }}
      />
      
      {/* Additional flowing shapes for more complexity */}
      <path
        d="M200,0 Q400,300 600,150 T1000,100 L1000,0 Z"
        fill="hsl(var(--foreground) / 0.04)"
        className="animate-pulse"
        style={{ animationDuration: '10s', animationDelay: '1s' }}
      />
      
      {/* Flowing curved lines - more visible */}
      <path
        d="M0,200 Q250,50 500,150 T1000,200"
        stroke="hsl(var(--foreground) / 0.15)"
        strokeWidth="3"
        fill="none"
        className="animate-pulse"
        style={{ animationDuration: '6s' }}
      />
      <path
        d="M0,800 Q300,600 600,700 T1000,800"
        stroke="hsl(var(--foreground) / 0.12)"
        strokeWidth="2"
        fill="none"
        className="animate-pulse"
        style={{ animationDuration: '10s', animationDelay: '1s' }}
      />
    </svg>

    {/* Floating organic blobs - more visible */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-foreground/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-foreground/6 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '3s' }} />
    <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-foreground/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />

    {/* Subtle dot grid overlay */}
    <svg className="absolute inset-0 h-full w-full opacity-5 text-foreground">
      <defs>
        <pattern id="hero-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-dots)" />
    </svg>
  </div>
);

export default HeroBackground;
