# DormChef Software Architecture Guide

## Overview
DormChef is a full-stack web application built with **Next.js 15** that helps college students plan meals, share recipes, and connect with friends. The application follows a modern **full-stack architecture** where both frontend and backend logic coexist in a single Next.js project.

## Technology Stack
- **Frontend**: React 19 + Next.js 15 (App Router)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **File Storage**: Cloudinary
- **Deployment**: Vercel

---

## Frontend Architecture

The frontend consists of React components and Next.js pages that handle the user interface and user interactions.

### Frontend Files Location: `src/app/` and `src/components/`

### 1. Pages (Route Components)
Located in `src/app/` - these define the application routes and main user interfaces:

- **`src/app/page.tsx`** - Homepage/landing page
- **`src/app/dashboard/page.tsx`** - Main dashboard after login
- **`src/app/recipes/page.tsx`** - Recipe browsing and search page
- **`src/app/recipes/add/page.tsx`** - Recipe creation form
- **`src/app/meal-planner/page.tsx`** - Weekly meal planning interface
- **`src/app/shopping-list/page.tsx`** - Shopping list management
- **`src/app/friends/page.tsx`** - Friend management and social features
- **`src/app/profile/page.tsx`** - User profile management
- **`src/app/sign-in/[[...sign-in]]/page.tsx`** - Clerk authentication sign-in
- **`src/app/sign-up/[[...sign-up]]/page.tsx`** - Clerk authentication sign-up

### 2. Layout Components
- **`src/app/layout.tsx`** - Root layout component that wraps all pages, includes:
  - Font configuration (Inter and Poppins)
  - Global metadata
  - Clerk authentication provider
  - Global CSS imports

### 3. Reusable Components
Located in `src/components/`:
- **`src/components/RecipeCard.tsx`** - Displays recipe information in card format
- **`src/components/SearchFilters.tsx`** - Handles recipe filtering functionality

### 4. Frontend Utilities
- **`src/lib/utils/index.ts`** - Utility functions for the frontend
- **`src/types/index.ts`** - TypeScript type definitions shared across frontend
- **`src/middleware.ts`** - Next.js middleware for authentication and route protection

---

## Backend Architecture

The backend is built using Next.js API Routes, providing RESTful endpoints for the frontend to consume.

### Backend Files Location: `src/app/api/`

### 1. Recipe Management APIs
- **`src/app/api/recipes/route.ts`** - Main recipe endpoints
  - `GET /api/recipes` - Fetch recipes with search, filtering, and pagination
  - `POST /api/recipes` - Create new recipes
- **`src/app/api/recipes/[id]/route.ts`** - Individual recipe operations
  - `GET /api/recipes/[id]` - Fetch specific recipe
  - `PUT /api/recipes/[id]` - Update recipe
  - `DELETE /api/recipes/[id]` - Delete recipe

### 2. Meal Planning APIs
- **`src/app/api/meal-plans/route.ts`** - Meal plan management
  - `GET /api/meal-plans` - Fetch user's meal plans
  - `POST /api/meal-plans` - Create new meal plan
- **`src/app/api/meal-plans/[id]/route.ts`** - Individual meal plan operations

### 3. Shopping List APIs
- **`src/app/api/shopping-list/route.ts`** - Shopping list management
  - `GET /api/shopping-list` - Fetch shopping lists
  - `POST /api/shopping-list` - Create/update shopping list

### 4. Social Features APIs
- **`src/app/api/friends/route.ts`** - Friend system management
  - `GET /api/friends` - Get friends list
  - `POST /api/friends` - Send friend request
- **`src/app/api/friends/[id]/route.ts`** - Individual friend operations
- **`src/app/api/friends/list/route.ts`** - Friend list operations

### 5. User Management APIs
- **`src/app/api/users/search/route.ts`** - User search functionality
- **`src/app/api/profile/route.ts`** - User profile management
- **`src/app/api/upload/profile-picture/route.ts`** - Profile picture upload via Cloudinary

### 6. Backend Utilities
- **`src/lib/prisma.ts`** - Database connection and Prisma client configuration

---

## Database Architecture

### Database Schema Location: `prisma/schema.prisma`

The database uses **PostgreSQL** with **Prisma ORM** for data modeling and database operations.

### Core Models:

1. **User Model** - Stores user account information
   - Authentication data (integrated with Clerk)
   - Profile information (name, email, school, dietary restrictions)
   - Relationships to recipes, meal plans, shopping lists, and friendships

2. **Recipe Model** - Stores recipe data
   - Basic info (title, description, image)
   - Ingredients (JSON format)
   - Instructions (array of strings)
   - Metadata (prep time, cook time, servings, difficulty, tags)
   - Privacy settings (public/private)

3. **MealPlan Model** - Weekly meal planning
   - Links to user and planned meals
   - Week-based organization

4. **PlannedMeal Model** - Individual meal entries
   - Links meals to specific days and meal types
   - References recipes

5. **Friendship Model** - Social connections
   - Friend request system with status tracking
   - Bidirectional relationships

6. **ShoppingList Model** - Shopping list management
   - Week-based shopping lists
   - Items stored as JSON

7. **Authentication Models** (Account, Session, VerificationToken) - Support NextAuth/Clerk integration

### Database Utilities:
- **`prisma/seed.ts`** - Database seeding script for development

---

## Request Flow Example

Here's how a typical request flows through the application:

1. **User Action**: User clicks "Add Recipe" button in the frontend
2. **Frontend Route**: `/recipes/add` page loads (`src/app/recipes/add/page.tsx`)
3. **Form Submission**: User fills form and submits
4. **API Call**: Frontend makes POST request to `/api/recipes`
5. **Backend Processing**: `src/app/api/recipes/route.ts` handles the request
6. **Authentication**: Clerk verifies user authentication
7. **Database Operation**: Prisma creates new recipe in PostgreSQL
8. **Response**: API returns success/error response
9. **Frontend Update**: Page updates to show success message or redirect

---

## Key Architectural Patterns

### 1. **Full-Stack Next.js Pattern**
- Single codebase for both frontend and backend
- Shared TypeScript types between frontend and backend
- API routes colocated with page components

### 2. **Database-First Design**
- Prisma schema defines the data structure
- Generated types ensure type safety across the stack
- Migration-based database evolution

### 3. **Component-Based UI**
- Reusable React components
- Tailwind CSS for consistent styling
- Layout-based route organization

### 4. **RESTful API Design**
- Resource-based URL structure
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Consistent error handling and response formats

### 5. **Authentication-First Security**
- Clerk handles user authentication
- Middleware protects routes
- User context available throughout the application

---

## Development vs Production

### Development Environment
- **Frontend**: Runs on Next.js dev server (typically port 3000)
- **Backend**: API routes served by same Next.js dev server
- **Database**: Local PostgreSQL or development database

### Production Environment
- **Frontend**: Static/server-rendered pages served by Vercel
- **Backend**: API routes run as Vercel serverless functions
- **Database**: Production PostgreSQL database

## ASCII Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                DORMCHEF ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                   FRONTEND                                       │
│                               (React + Next.js)                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │     PAGES       │  │   COMPONENTS    │  │    UTILITIES    │                 │
│  │  src/app/       │  │ src/components/ │  │   src/lib/      │                 │
│  │                 │  │                 │  │   src/types/    │                 │
│  │ • page.tsx      │  │ • RecipeCard    │  │ • utils/        │                 │
│  │ • dashboard/    │  │ • SearchFilters │  │ • prisma.ts     │                 │
│  │ • recipes/      │  │                 │  │ • types/        │                 │
│  │ • meal-planner/ │  │                 │  │                 │                 │
│  │ • shopping-list/│  │                 │  │                 │                 │
│  │ • friends/      │  │                 │  │                 │                 │
│  │ • profile/      │  │                 │  │                 │                 │
│  │ • sign-in/      │  │                 │  │                 │                 │
│  │ • sign-up/      │  │                 │  │                 │                 │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
│                                                                                 │
│                                    │                                            │
│                              HTTP Requests                                      │
│                                    │                                            │
├────────────────────────────────────┼────────────────────────────────────────────┤
│                           121         ▼                                            │
│                                 BACKEND                                         │
│                            (Next.js API Routes)                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │   API ROUTES    │  │  AUTHENTICATION │  │   MIDDLEWARE    │                 │
│  │  src/app/api/   │  │     (Clerk)     │  │ src/middleware  │                 │
│  │                 │  │                 │  │                 │                 │
│  │ • recipes/      │  │ • User auth     │  │ • Route protect │                 │
│  │ • meal-plans/   │  │ • Session mgmt  │  │ • Auth checks   │                 │
│  │ • shopping-list/│  │ • JWT tokens    │  │                 │                 │
│  │ • friends/      │  │                 │  │                 │                 │
│  │ • profile/      │  │                 │  │                 │                 │
│  │ • users/        │  │                 │  │                 │                 │
│  │ • upload/       │  │                 │  │                 │                 │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
│                                                                                 │
│                                    │                                            │
│                              Database Queries                                   │
│                                    │                                            │
├────────────────────────────────────┼────────────────────────────────────────────┤
│                                    ▼                                            │
│                                DATABASE                                         │
│                            (PostgreSQL + Prisma)                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │     MODELS      │  │   RELATIONSHIPS │  │     TOOLS       │                 │
│  │                 │  │                 │  │                 │                 │
│  │ • User          │  │ User ←→ Recipe  │  │ • schema.prisma │                 │
│  │ • Recipe        │  │ User ←→ MealPlan│  │ • seed.ts       │                 │
│  │ • MealPlan      │  │ Recipe ←→ Meals │  │ • migrations/   │                 │
│  │ • PlannedMeal   │  │ User ←→ Friends │  │                 │                 │
│  │ • Friendship    │  │ User ←→ Shopping│  │                 │                 │
│  │ • ShoppingList  │  │                 │  │                 │                 │
│  │ • Account       │  │                 │  │                 │                 │
│  │ • Session       │  │                 │  │                 │                 │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL SERVICES                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │     CLERK       │  │   CLOUDINARY    │  │     VERCEL      │                 │
│  │  Authentication │  │  Image Storage  │  │   Deployment    │                 │
│  │                 │  │                 │  │                 │                 │
│  │ • User mgmt     │  │ • Profile pics  │  │ • Static files  │                 │
│  │ • Sign in/up    │  │ • Recipe images │  │ • API functions │                 │
│  │ • Sessions      │  │ • Optimization  │  │ • Edge network  │                 │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

DATA FLOW:
User Interaction → Frontend Pages → API Routes → Database → Response → UI Update

EXAMPLE REQUEST FLOW:
┌─────────┐    HTTP POST     ┌─────────┐    Prisma Query    ┌─────────┐
│Frontend │ ──────────────► │ Backend │ ─────────────────► │Database │
│Page     │                 │API Route│                    │         │
└─────────┘ ◄────────────── └─────────┘ ◄───────────────── └─────────┘
             JSON Response              Query Results
```

This architecture provides a cohesive, type-safe, and scalable foundation for the DormChef application while maintaining developer productivity through the tight integration of frontend and backend concerns.