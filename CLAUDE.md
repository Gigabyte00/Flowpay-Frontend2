# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm test` - Run tests (currently not configured)

## Project Architecture

This is a React TypeScript application built with Vite for a financial payment platform called FlowPay. The app allows users to manage vendors, make payments, and track transactions.

### Key Architecture Components

**Authentication Flow:**
- Uses React Context (`AuthContext`) for user authentication state
- Stores user session in localStorage as `flowpay_user`
- App shows `LandingPage` when not authenticated, `Dashboard` when authenticated

**Data Management:**
- `DataContext` and `DataProvider` manage application state
- Contains mock data for vendors, transactions, cards, and recurring payments
- Demo mode enabled - all API calls return mock responses

**Payment Processing:**
- Integrates with Stripe for payment processing
- Uses Stripe Connect for vendor onboarding
- `ApiService` handles all API communications with mock responses in demo mode
- Payment methods include ACH, Wire, and Check

**Component Structure:**
- `src/components/Dashboard/` - Main dashboard with multiple content views
- `src/components/LandingPage.tsx` - Authentication/landing page
- `src/contexts/` - React contexts for auth and data
- `src/services/apiService.ts` - API service layer with Stripe integration

### Configuration

**Build Configuration:**
- Vite with React plugin
- TypeScript with strict mode enabled
- Tailwind CSS for styling with custom color palette
- Path alias: `@` points to `/src`
- Bundle splitting: separate chunks for vendor, charts, and icons

**Environment:**
- Demo mode is enabled (`CONFIG.DEMO_MODE = true`)
- Stripe publishable key is hardcoded for demo
- API base URL set to `http://localhost:4242/api`

### Key Features

- Vendor management with Stripe Connect onboarding
- Payment processing with multiple methods (ACH, Wire, Check)
- Transaction history and status tracking
- Recurring payment management
- Card management for payment sources
- Dashboard with multiple views (transactions, vendors, cards, recurring, settings)

### Artifact Alignment Notes

The current implementation has been verified to match the Claude Artifact (`flowpay-v8-react.tsx`) in terms of:
- UI/UX design and styling
- Component functionality and user interactions
- Chart implementations with proper gradients
- Logo design and branding
- Landing page layout and sections
- Dashboard functionality and navigation

**Key Advantages of Current Implementation:**
- **Modular Architecture**: Better maintainability with separate files for each component
- **TypeScript Support**: Proper type definitions and interfaces
- **Clean Import Structure**: Component-specific imports rather than a single massive file
- **Separation of Concerns**: Services, contexts, and components are properly separated

**Visual Parity Achieved:**
- All hover effects and animations match the artifact
- Chart gradients and styling are identical
- Button styling and interactions are consistent
- Error handling and loading states are properly implemented