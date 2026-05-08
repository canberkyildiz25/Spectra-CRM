# Intertek CRM Setup Guide

## Project Architecture

```
Intertek CRM (Full-Stack)
├── Frontend (Next.js)
│   ├── Components
│   ├── Pages/Routes
│   └── API Client
├── Backend (Node.js/Express)
│   ├── Controllers
│   ├── Models
│   ├── Routes
│   └── Middleware
└── Database (MongoDB)
```

## Database Models

### Customer
- firstName, lastName
- email, phone
- company
- address, city, country
- status (prospect, customer, inactive)
- source
- notes
- timestamps

### Opportunity
- title, description
- customerId (reference)
- amount
- stage (lead → closed-won/lost)
- probability
- expectedCloseDate
- timestamps

### Task
- title, description
- assignedTo (userId)
- relatedTo (customer/opportunity/general)
- priority (low, medium, high)
- status (pending, in-progress, completed)
- dueDate
- timestamps

### User
- username, email, password
- firstName, lastName
- role (admin, manager, user)
- isActive
- timestamps

## API Endpoints

### Authentication
- POST `/auth/register` - Create new user
- POST `/auth/login` - User login
- GET `/auth/me` - Get current user
- POST `/auth/logout` - User logout

### Customers
- GET `/customers` - List all customers
- GET `/customers/:id` - Get customer details
- POST `/customers` - Create customer
- PUT `/customers/:id` - Update customer
- DELETE `/customers/:id` - Delete customer

### Opportunities
- GET `/opportunities` - List all opportunities
- GET `/opportunities/:id` - Get opportunity details
- POST `/opportunities` - Create opportunity
- PUT `/opportunities/:id` - Update opportunity
- DELETE `/opportunities/:id` - Delete opportunity

### Tasks
- GET `/tasks` - List all tasks
- POST `/tasks` - Create task
- PUT `/tasks/:id` - Update task
- DELETE `/tasks/:id` - Delete task

## Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd Intertek-CRM
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
cp .env.example .env.local
npm run dev
```

### 4. MongoDB Setup
Make sure MongoDB is running:
```bash
mongod
```

## Development

### Terminal 1 - Backend
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd client
npm run dev
# Runs on http://localhost:3000
```

## Features to Implement

- [ ] User authentication (JWT)
- [ ] Customer management
- [ ] Opportunity tracking
- [ ] Task management
- [ ] Dashboard with analytics
- [ ] Email notifications
- [ ] Export reports (PDF, CSV)
- [ ] Activity timeline
- [ ] Search and filters
- [ ] Mobile responsive design

## Testing

```bash
# Backend tests
cd server
npm run test

# Frontend tests
cd client
npm run test
```

## Deployment

### Frontend (Vercel)
```bash
npm i -g vercel
vercel
```

### Backend (Heroku)
```bash
heroku login
heroku create your-app-name
git push heroku main
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB service is running
- Check MONGODB_URI in .env file
- Verify network connectivity

### CORS Error
- Check CORS configuration in backend
- Ensure frontend and backend URLs are correct

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Commit changes: `git commit -m 'Add feature'`
3. Push branch: `git push origin feature/name`
4. Create Pull Request

## License

© 2026 Intertek. All rights reserved.
