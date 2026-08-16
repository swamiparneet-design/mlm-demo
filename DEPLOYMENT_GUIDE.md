# Railway Deployment Guide

## ✅ Configuration Ready for Railway

Your project is now configured for Railway deployment using **Railpack** (Railway's automatic build system).

## 🚀 Deployment Steps

### 1. Connect Your Repository
- Go to your Railway project dashboard
- Connect the GitHub repository: `swamiparneet-design/mlm-demo`
- Railway will automatically detect the `.NET` + `Node.js` setup

### 2. Add MySQL Database
- In Railway dashboard, click **"New"** → **"MySQL"**
- Wait for the database to provision
- Railway will automatically set these environment variables:
  - `MYSQL_HOST`
  - `MYSQL_PORT`
  - `MYSQL_USERNAME`
  - `MYSQL_PASSWORD`
  - `MYSQL_DATABASE`

### 3. Set JWT Secret
Add this environment variable to your service:
```
JWT_SECRET = YourSuperSecretJWTKeyHere123!@#
```

### 4. Deploy
- Railway will automatically build and deploy
- The build process:
  1. Restores .NET dependencies
  2. Installs Node.js dependencies
  3. Builds Angular frontend
  4. Copies frontend to backend wwwroot
  5. Runs database migrations
  6. Starts the ASP.NET Core application

### 5. Get Your URL
Once deployed, you'll receive a URL like:
```
https://mlm-demo-production.up.railway.app
```

## 📋 Configuration Files Added

1. **railway.json** - Tells Railway how to build and deploy
2. **start.sh** - Build script that:
   - Builds Angular frontend
   - Copies to backend wwwroot
   - Runs database migrations
   - Starts the application

## 🔧 Environment Variables

Railway will automatically provide:
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USERNAME`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

You need to add:
- `JWT_SECRET` - Your JWT signing key (use a strong random string)

## 🎯 What Happens During Deployment

1. **Build Phase**
   - .NET SDK installs dependencies
   - Node.js builds Angular app
   - Frontend files copied to `backend/MLM.API/wwwroot`

2. **Deploy Phase**
   - Database migrations run automatically
   - Default admin user is seeded
   - Application starts on port 8080

3. **Runtime**
   - Single URL serves both API and frontend
   - API endpoints: `https://your-url.up.railway.app/api/*`
   - Frontend: `https://your-url.up.railway.app`

## 🐛 Troubleshooting

### Build Fails
- Check Railway build logs in the dashboard
- Ensure all dependencies are in package.json and .csproj files
- Verify the start.sh script has execute permissions

### Database Connection Issues
- Ensure MySQL service is connected
- Check environment variables are set correctly
- Verify connection string format in appsettings.Production.json

### Application Crashes
- Check logs in Railway dashboard
- Verify JWT_SECRET is set
- Ensure database migrations ran successfully

## 📊 Monitoring

- Use Railway's built-in monitoring dashboard
- View real-time logs
- Monitor resource usage
- Set up alerts for failures

## 💰 Cost Estimation

Railway's free tier includes:
- $5/month credit
- Shared CPU
- 512MB RAM
- 1GB disk storage

This should be sufficient for:
- Development/testing
- Small production workloads
- Low to moderate traffic

## 🎉 Success!

Once deployed, share the Railway URL with your client. They'll have access to:
- Login/Register page
- User dashboard
- Admin panel (with admin credentials)
- All MLM features

**Default Admin Credentials** (after seeding):
- Email: `admin@mlm.com`
- Password: `Admin@123`

---

**Need help?** Check the Railway documentation or contact support.