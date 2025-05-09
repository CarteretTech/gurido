# Project Explanation

## Architecture Overview

This document explains the technical implementation and architecture of the cravenSEO project as of April 21, 2025.

## Tech Stack

- **Framework**: Astro
- **Styling**: Tailwind CSS with custom CSS variables
- **JavaScript**: Alpine.js for interactive elements, custom animation scripts
- **Theming**: Dark/light mode implementation with class-based switching
- **Deployment**: Netlify configuration with performance optimizations

## Core Components

### Layout Structure

The project uses a primary Layout.astro component that handles global elements:
- Meta tags and SEO configuration
- Critical CSS loading and inline styling for performance
- Global scripts initialization
- Dark mode switching mechanism with OS preference detection
- Header with dynamic transparency and scroll effects
- Footer with responsive grid layout
- Progress bar for reading position

### Theme System

The theme system implements a robust dark/light mode approach:
- Uses Tailwind's `dark:` variant with the `class` strategy
- Stores user preference in localStorage
- Respects OS-level preferences initially
- Provides smooth transitions between modes
- Updates meta theme-color for browser UI to match theme
- Uses CSS variables for consistent theming across components

### Animation System

The animation system combines several approaches:
- Custom Intersection Observer implementation in animations.js
- CSS classes (.animate-on-scroll, .animated) with configurable transitions
- Staggered animation delays via utility classes
- Alpine.js for interactive animations and transitions
- Performance optimizations with hardware acceleration
- Respects user preference for reduced motion

### SEO Implementation

- Semantic HTML structure throughout components
- Structured data (Schema.org) for LocalBusiness and FAQs
- Comprehensive meta tag strategy in the Layout component
- Performance optimization via proper asset loading
- Dynamic canonical URL handling
- CSS and JS optimizations for Core Web Vitals

### Content Management

Content is managed through JSON data files in the src/data directory:
- services.json - Service offerings with structured details
- locations.json - Geographic service areas with targeting data
- glossary.json - SEO terminology for educational content
- blog/posts.json - Blog content with structured metadata

## Performance Optimizations

- Fonts preloaded with optimal font-display strategy
- Images optimized and lazy-loaded with proper dimensions
- CSS organized with global variables and minimal specificity
- Scripts deferred when not critical to initial render
- Tailwind optimized for minimal CSS output
- Critical CSS inlined in the head
- Smooth theme transitions without layout shifts
- Alpine.js used for interactive elements without a heavy framework
