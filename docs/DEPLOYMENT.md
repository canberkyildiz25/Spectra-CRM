# Deployment Guide - Intertek CRM

## Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Quick Start
```bash
# 1. Clone and install
cd Intertek-CRM
npm install --workspace=server
npm install --workspace=client

# 2. Setup environment
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# 3. Start services
npm run server    # Terminal 1
npm run client    # Terminal 2
```

---

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: mongodb://admin:admin123@localhost:27017

### Building Individual Docker Images

**Backend:**
```bash
cd server
docker build -t intertek-crm-backend:1.0 .
docker run -p 5000:5000 intertek-crm-backend:1.0
```

**Frontend:**
```bash
cd client
docker build -t intertek-crm-frontend:1.0 .
docker run -p 3000:3000 intertek-crm-frontend:1.0
```

---

## Cloud Deployment

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
cd client
vercel --prod
```

Environment variables:
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Heroku (Backend)

```bash
# Install Heroku CLI
npm i -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your_secret_key

# Deploy
git push heroku main
```

### MongoDB Atlas (Database)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster (Free tier available)
3. Get connection string
4. Update `MONGODB_URI` in .env

---

## Production Checklist

### Security
- [ ] Change JWT_SECRET to strong random value
- [ ] Enable HTTPS
- [ ] Setup CORS properly
- [ ] Validate all user inputs
- [ ] Use environment variables for sensitive data
- [ ] Enable MongoDB authentication
- [ ] Setup rate limiting
- [ ] Add CSRF protection

### Performance
- [ ] Enable caching headers
- [ ] Compress responses (gzip)
- [ ] Optimize database indexes
- [ ] Setup CDN for static assets
- [ ] Monitor API response times
- [ ] Setup error tracking (Sentry)

### Monitoring
- [ ] Setup application monitoring
- [ ] Setup error logging
- [ ] Setup performance monitoring
- [ ] Setup uptime monitoring
- [ ] Setup alerts

### Backups
- [ ] Daily database backups
- [ ] Backup configuration files
- [ ] Test backup restoration

---

## Environment Variables

### Backend Production
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=<generate-strong-random-key>
SERVER_PORT=5000
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Frontend Production
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## Monitoring & Maintenance

### Application Logs
```bash
# Docker
docker-compose logs -f backend
docker-compose logs -f frontend

# Heroku
heroku logs --tail
```

### Database Maintenance
```bash
# MongoDB Atlas provides built-in monitoring

# Local MongoDB stats
mongo
db.stats()
db.customers.stats()
```

### Performance Optimization
1. Monitor slow queries
2. Add database indexes
3. Cache frequently accessed data
4. Optimize API response times
5. Use pagination for large datasets

---

## Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose logs backend

# Verify environment variables
cat .env

# Verify database connection
mongosh "mongodb://localhost:27017"
```

### High memory usage
- Check for memory leaks
- Monitor Node.js process
- Increase container limits

### Database connection errors
- Verify MongoDB is running
- Check connection string
- Verify network connectivity
- Check MongoDB credentials

---

## Scaling

### Horizontal Scaling
1. Load balancer (nginx, HAProxy)
2. Multiple backend instances
3. MongoDB sharding
4. Cache layer (Redis)

### Vertical Scaling
1. Increase container resources
2. Optimize code
3. Database optimization
4. Add CDN

---

## Backup & Recovery

### Database Backup
```bash
# MongoDB Atlas automatic backups available

# Manual backup
mongodump --uri "mongodb://localhost:27017"

# Restore
mongorestore --uri "mongodb://localhost:27017"
```

### Application Backup
- Store code in Git
- Export database periodically
- Store .env files securely

---

## SSL/HTTPS Setup

### Using Let's Encrypt with nginx
```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Configure nginx to use certificate
```

### Automatic Renewal
```bash
sudo certbot renew --dry-run
```

---

## Support

For deployment issues:
1. Check logs
2. Verify environment variables
3. Test services locally
4. Review documentation
5. Check community forums

---

*Last Updated: May 6, 2026*
*Version: 1.0.0*
