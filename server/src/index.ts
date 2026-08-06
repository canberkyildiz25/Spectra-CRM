import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'express-async-errors';
import { connectDB } from './config/database';

// Import routes
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import taskRoutes from './routes/tasks';
import statsRoutes from './routes/stats';
import opportunityRoutes from './routes/opportunities';
import proposalRoutes from './routes/proposals';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 5000;

// Connect to database
connectDB();

// Middleware
// CLIENT_URL may hold a single origin or a comma-separated list. If it is unset
// we reflect whatever origin asks, so a fresh deployment still works before the
// variable is filled in. Auth is a Bearer token from localStorage, never a
// cookie, so there are no credentials to protect by pinning the origin.
const allowedOrigins = (process.env.CLIENT_URL ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/proposals', proposalRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🔗 API available at http://localhost:${PORT}/api`);
});

export default app;
