# MongoDB Models Documentation

## Customer Schema

```typescript
interface ICustomer {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  status: 'prospect' | 'customer' | 'inactive';
  source?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Opportunity Schema

```typescript
interface IOpportunity {
  _id: ObjectId;
  title: string;
  customerId: ObjectId; // Reference to Customer
  amount: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number; // 0-100
  expectedCloseDate?: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Task Schema

```typescript
interface ITask {
  _id: ObjectId;
  title: string;
  description?: string;
  assignedTo: ObjectId; // Reference to User
  relatedTo: {
    type: 'customer' | 'opportunity' | 'general';
    id?: ObjectId;
  };
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## User Schema

```typescript
interface IUser {
  _id: ObjectId;
  username: string;
  email: string;
  password: string; // Hashed
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Indexes to Create

```javascript
// Customers
db.customers.createIndex({ email: 1 }, { unique: true });
db.customers.createIndex({ status: 1 });
db.customers.createIndex({ createdAt: -1 });

// Opportunities
db.opportunities.createIndex({ customerId: 1 });
db.opportunities.createIndex({ stage: 1 });
db.opportunities.createIndex({ createdAt: -1 });

// Tasks
db.tasks.createIndex({ assignedTo: 1 });
db.tasks.createIndex({ status: 1 });
db.tasks.createIndex({ dueDate: 1 });

// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
```

## Sample Data

```javascript
// Insert sample customer
db.customers.insertOne({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  company: "Tech Corp",
  status: "prospect",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Insert sample user
db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  password: "$2a$10...", // hashed password
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```
