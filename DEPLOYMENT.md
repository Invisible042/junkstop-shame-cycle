# JunkStop Deployment Guide

## Replit Deployment

Your JunkStop application is configured for automatic deployment on Replit.

### Current Configuration

The app is set up as a monorepo with:
- **Backend**: FastAPI server on port 5000
- **Frontend**: React Native/Expo mobile app
- **Database**: PostgreSQL (automatically configured)

### Deployment Steps

1. **Automatic Deployment**: 
   - Click the "Deploy" button in Replit
   - The backend will be deployed and accessible via your Replit domain

2. **Environment Variables**:
   - `DATABASE_URL` - Auto-configured by Replit
   - `OPENROUTER_API_KEY` - Optional, for enhanced AI features

3. **Custom Domain** (Optional):
   - Configure custom domain in Replit deployment settings
   - Update CORS settings if needed

### Development Workflows

**Backend Only**:
```bash
python start_backend.py
```

**Mobile Development**:
```bash
cd mobile && npm install --legacy-peer-deps && npm start
```

**Both (Monorepo)**:
```bash
# Install concurrently first
npm install concurrently
# Then run both
npx concurrently "python start_backend.py" "cd mobile && npm start"
```

### Production Considerations

1. **Security**:
   - Update CORS origins to specific domains
   - Set strong JWT secret
   - Enable HTTPS (handled by Replit)

2. **Database**:
   - Regular backups (Replit handles this)
   - Monitor connection limits
   - Index optimization for large datasets

3. **File Storage**:
   - Current: Local filesystem
   - Production: Consider cloud storage (AWS S3, Cloudinary)

4. **API Keys**:
   - Add OpenRouter API key for enhanced AI features
   - Consider rate limiting for API endpoints

### Mobile App Deployment

For mobile app deployment, you have several options:

1. **Web Version**: 
   - Already works via Expo web
   - Accessible through your deployed backend

2. **Native Apps**:
   - Use Expo Application Services (EAS)
   - Configure app.json for production builds
   - Submit to App Store/Google Play

### Monitoring

- Check workflow logs in Replit
- Monitor API response times
- Track database performance
- Set up error logging (consider Sentry)

### Scaling

- Replit Autoscale handles traffic spikes
- Database connection pooling already configured
- Consider caching for frequently accessed data

## Manual Deployment (Other Platforms)

### Docker Deployment

1. Create Dockerfile for backend
2. Set up Docker Compose with PostgreSQL
3. Configure environment variables
4. Deploy to your preferred cloud provider

### Traditional VPS Deployment

1. Set up Python 3.11+ environment
2. Install PostgreSQL
3. Configure reverse proxy (Nginx)
4. Set up SSL certificates
5. Configure systemd services

This setup provides a robust, production-ready deployment suitable for real users.