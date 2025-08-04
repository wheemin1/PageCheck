# Overview

MoCheck is a web-based performance analysis tool that provides rapid website performance auditing using Google PageSpeed Insights API. The application allows users to analyze websites for performance, accessibility, SEO, and best practices metrics in approximately 10 seconds. Key features include Core Web Vitals visualization, improvement recommendations, multi-format result export (PNG, PDF), KakaoTalk sharing, multi-language support (Korean, English, Japanese), and 30-minute result caching for improved user experience.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: SvelteKit with TypeScript for type safety and modern reactive UI development
- **Styling**: Tailwind CSS for utility-first styling with custom animations and responsive design
- **Build Tool**: Vite for fast development and optimized production builds
- **State Management**: Svelte stores for application state including loading states, results, and user preferences
- **Internationalization**: Custom i18n implementation supporting Korean, English, and Japanese with JSON translation files

## Backend Architecture
- **Serverless Functions**: Netlify Functions for API endpoints, eliminating need for traditional server infrastructure
- **API Integration**: Direct integration with Google PageSpeed Insights API v5 for performance data retrieval
- **CORS Handling**: Implemented in serverless functions to enable cross-origin requests from frontend

## Data Flow and Caching
- **Client-Side Caching**: SessionStorage-based caching system with 30-minute TTL to reduce API calls and improve response times
- **Data Processing**: Client-side transformation of PageSpeed Insights API responses into structured results with calculated overall scores using weighted averages

## Export and Sharing System
- **Image Export**: html-to-image library for PNG generation of results
- **PDF Generation**: pdf-lib for programmatic PDF creation with formatted performance reports
- **Social Sharing**: KakaoTalk SDK integration for Korean market social sharing capabilities

## Deployment Architecture
- **Static Site Hosting**: Netlify adapter for SvelteKit enabling static site generation with serverless function support
- **Environment Configuration**: Environment-based API key management for Google PageSpeed Insights API

# External Dependencies

## Core APIs
- **Google PageSpeed Insights API v5**: Primary data source for website performance metrics, Core Web Vitals, and Lighthouse audit results
- **API Key**: Required for PageSpeed Insights API access (stored in environment variables)

## Third-Party Services
- **Netlify**: Hosting platform providing both static site hosting and serverless function execution
- **KakaoTalk Platform**: Social sharing integration requiring Kakao app key configuration

## Frontend Libraries
- **html-to-image**: Converts DOM elements to PNG images for result export functionality
- **pdf-lib**: Client-side PDF generation for downloadable performance reports
- **Kakao JS SDK**: Official KakaoTalk sharing functionality

## Development Dependencies
- **ESLint + TypeScript ESLint**: Code quality and TypeScript-specific linting rules
- **Prettier**: Code formatting with Svelte plugin support
- **Vitest**: Testing framework with jsdom environment for component testing
- **PostCSS + Autoprefixer**: CSS processing for browser compatibility

## Font and Assets
- **Google Fonts**: Inter font family for consistent typography
- **Custom favicon and OG images**: Social media and browser tab optimization