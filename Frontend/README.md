# Product Management Frontend

A modern, feature-based React application for product management built with TypeScript, Vite, and Tailwind CSS.

## 🏗️ Project Structure

```
src/
├── features/              # Feature-based modules
│   ├── products/         # Product management
│   │   ├── components/   # Product-specific components
│   │   ├── hooks/        # Product-specific hooks
│   │   ├── api/          # Product API services
│   │   └── pages/        # Product pages
│   ├── inventory/        # Inventory management
│   ├── orders/           # Order management
│   ├── suppliers/        # Supplier management
│   └── reports/          # Reporting module
│
├── shared/               # Shared resources
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Reusable hooks
│   └── utils/            # Utility functions
│
├── types/                # TypeScript type definitions
└── config/               # Configuration files
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎨 Features

- ✅ Feature-based architecture
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ React Router for navigation
- ✅ Axios for API calls
- ✅ Reusable components
- ✅ Custom hooks
- ✅ Form validation
- ✅ Pagination support
- ✅ Search and filtering

## 📦 Key Components

### Shared Components
- **Button** - Customizable button with variants and loading states
- **Input** - Form input with label, error, and helper text
- **Modal** - Accessible modal dialog
- **Table** - Generic table component
- **Layout** - Main application layout with sidebar

### Product Features
- **ProductList** - Grid view of products with pagination
- **ProductCard** - Individual product card
- **ProductForm** - Create/edit product form
- **ProductFilters** - Search and filter controls

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

## 📝 API Integration

The app connects to a NestJS backend running on `http://localhost:3000/api`. Make sure the backend is running before starting the frontend.
