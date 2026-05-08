# Quick Start Guide - Intertek CRM

## ✅ Project Setup Complete!

Your Intertek CRM Full-Stack project is ready to develop. Here's what has been configured:

### 📁 Project Structure
```
Intertek CRM/
├── client/              # Next.js Frontend
│   ├── app/            # Pages & routing
│   ├── components/     # React components
│   ├── lib/           # Utilities & API calls
│   ├── styles/        # CSS styles
│   └── public/        # Static assets
├── server/             # Node.js/Express Backend
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── models/    # Database schemas
│   │   ├── controllers/ # Business logic
│   │   ├── middleware/ # Express middleware
│   │   ├── utils/     # Helper functions
│   │   └── config/    # Configuration
│   └── src/index.ts   # Entry point
├── shared/            # Shared Types & Utils
│   ├── types.ts      # TypeScript types
│   └── api.ts        # Axios instance
└── docs/             # Documentation
```

### 🚀 Getting Started

#### 1️⃣ **Install Dependencies**

```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install
```

#### 2️⃣ **Setup Environment Variables**

**Backend** - `server/.env`:
```
MONGODB_URI=mongodb://localhost:27017/intertek-crm
JWT_SECRET=your_jwt_secret_key_here
SERVER_PORT=5000
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Frontend** - `client/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### 3️⃣ **Start MongoDB**

Make sure MongoDB is running:
```bash
# Windows (if installed as service)
net start MongoDB

# Or run mongod manually
mongod
```

#### 4️⃣ **Run Development Servers**

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server will run on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Frontend will run on http://localhost:3000
```

Visit `http://localhost:3000` in your browser to see the CRM interface!

### 📚 Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 | React framework with SSR |
| Frontend Styling | Tailwind CSS | Utility-first CSS |
| State Management | Zustand | Global state |
| Backend | Express.js | REST API server |
| Database | MongoDB | NoSQL database |
| Authentication | JWT | Token-based auth |
| Language | TypeScript | Type-safe development |

### 📋 What's Included

✅ **Backend**
- Express.js server setup
- MongoDB connection config
- JWT utilities
- TypeScript configuration
- Error handling middleware

✅ **Frontend**
- Next.js 14 with App Router
- Tailwind CSS styling
- Zustand store setup
- API client utilities
- Responsive layout

✅ **Shared**
- TypeScript interfaces
- API response types
- Axios API instance

✅ **Documentation**
- API documentation
- Setup guide
- Development roadmap

### 🔄 API Structure

All API endpoints are under `/api` prefix:
- `POST /api/auth/login` - User authentication
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/opportunities` - List opportunities
- `GET /api/tasks` - List tasks

See [docs/API.md](docs/API.md) for complete API documentation.

### 📝 Development Tips

1. **Use Shared Types**: Import types from `shared/types.ts` for consistency
2. **Environment Variables**: Use `.env.example` as reference
3. **API Calls**: Use utilities in `lib/api-client.ts`
4. **State Management**: Use Zustand store in `lib/store.ts`
5. **Styling**: Use Tailwind classes for consistent styling

### 🎯 Next Steps

1. **Implement Authentication**
   - Create login form in frontend
   - Implement auth endpoints in backend
   - Setup protected routes

2. **Build Customer Module**
   - Create customer list page
   - Add customer form
   - Implement CRUD operations

3. **Add Dashboard**
   - Display key metrics
   - Show recent activities
   - Create sales pipeline view

### ❓ Troubleshooting

**Port Already in Use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify MongoDB is accessible on localhost:27017

**CORS Errors:**
- Check frontend and backend URLs match
- Verify CORS middleware in backend

### 📖 Documentation

- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [API Documentation](docs/API.md) - Complete API reference
- [Development Roadmap](docs/ROADMAP.md) - Feature roadmap

### 🤝 Support

For issues or questions:
1. Check the documentation files
2. Review the sample code
3. Check TypeScript types for interface details

---

**Happy coding! 🚀**

*Intertek CRM © 2026*
