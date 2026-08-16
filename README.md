# MLM Project

A full-stack Multi-Level Marketing (MLM) application built with .NET 8 backend and Angular 21 frontend.

## 🚀 Deployment Guide

### Railway Deployment (Free Tier)

This project is configured for easy deployment on Railway with a single service that serves both the API and frontend.

#### Step-by-Step Instructions:

1. **Connect GitHub Repository**
   - Go to [Railway](https://railway.app) and sign in
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `swamiparneet-design/mlm-demo` repository

2. **Add MySQL Database**
   - In your Railway project, click "New" → "MySQL"
   - Wait for the database to provision

3. **Configure Environment Variables**
   
   In Railway dashboard, add these variables to your service:
   
   ```
   MYSQL_HOST = {{MYSQL_HOST}}
   MYSQL_PORT = 3306
   MYSQL_USERNAME = {{MYSQL_USERNAME}}
   MYSQL_PASSWORD = {{MYSQL_PASSWORD}}
   MYSQL_DATABASE = mlmdb
   JWT_SECRET = YourSuperSecretJWTKeyHere123!@#
   ```
   
   > Railway will automatically provide the MySQL connection variables. You only need to add `JWT_SECRET`.

4. **Deploy**
   - Railway will automatically detect the Dockerfile and build the application
   - The build process will:
     - Build the .NET 8 backend
     - Build the Angular frontend
     - Serve both from a single URL

5. **Get Your URL**
   - Once deployed, Railway provides a URL like: `https://your-project.up.railway.app`
   - Share this single URL with your client!

### What's Included:

✅ **Backend API**: .NET 8 Web API with JWT authentication  
✅ **Frontend**: Angular 21 SPA with modern UI  
✅ **Database**: MySQL with Entity Framework Core  
✅ **Authentication**: JWT-based auth system  
✅ **Authorization**: Role-based access (Admin/User)  
✅ **CORS**: Configured for production  

### Features:

- User registration and login with OTP verification
- Admin dashboard with user management
- Zone and stage management
- Placement tree visualization
- Payout tracking
- Referral system
- Responsive design with Tailwind CSS

### Tech Stack:

**Backend:**
- .NET 8
- Entity Framework Core 9
- MySQL (Pomelo provider)
- JWT Authentication
- Swagger/OpenAPI

**Frontend:**
- Angular 21
- TypeScript
- Tailwind CSS
- Chart.js

### Default Credentials (after seeding):

- **Admin**: admin@mlm.com / Admin@123
- **Demo User**: user@mlm.com / User@123

### Local Development:

```bash
# Backend
cd backend
dotnet restore
dotnet run --project MLM.API

# Frontend (in another terminal)
cd frontend
npm install
npm start
```

### Important Notes:

- The application serves the Angular frontend from the backend's `wwwroot` folder in production
- All API calls use relative paths (`/api`) so they work seamlessly
- Database migrations run automatically on startup
- The application seeds default admin and demo user data on first run

---

**Client URL Format**: `https://your-project-name.up.railway.app`

Share this single URL with your client - they'll have access to both the login page and the full application!