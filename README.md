# Auto Parts Management System

A full-stack auto parts inventory management system built with React (Frontend) and NestJS (Backend).

## 🚀 Quick Start

### Frontend
```bash
cd Frontend
npm install
npm run dev
```
Access at: http://localhost:5173

### Backend
```bash
cd backend
npm install
npm run start:dev
```
Access at: http://localhost:3000

## 📁 Project Structure

```
Project/
├── Frontend/          # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── features/  # Feature-based modules
│   │   ├── shared/    # Shared components and utilities
│   │   └── types/     # TypeScript type definitions
│   └── package.json
│
└── backend/           # NestJS + TypeScript
    ├── src/
    └── package.json
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS v4** for styling
- **React Router v7** for navigation
- **Axios** for API calls

### Backend
- **NestJS** with TypeScript
- **Express.js** as HTTP server
- Ready for database integration

## 📝 Features

- ✅ Auto parts inventory management
- ✅ Product CRUD operations (UI ready)
- ✅ Search and filtering
- ✅ Stock level tracking
- ✅ Responsive design
- ✅ Feature-based architecture

## 🔧 Development

### Frontend Development
The frontend uses a feature-based architecture for scalability. Each feature (products, inventory, orders, etc.) has its own components, hooks, and API services.

### Backend Development
The backend is set up with NestJS and ready for API implementation. Connect it to your preferred database (PostgreSQL, MongoDB, etc.).

## 📦 Next Steps

1. Implement backend API endpoints
2. Connect frontend to backend APIs
3. Add authentication
4. Set up database
5. Implement remaining features (Inventory, Orders, Suppliers, Reports)

## 📄 License

MIT
