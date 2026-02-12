# Railway MongoDB Connection Troubleshooting

## Issue Summary

**Date**: February 12, 2026
**Status**: ✅ RESOLVED
**Severity**: High (Production service down)

### Problem Statement
Backend service on Railway could not connect to MongoDB instance. The application was working several days ago but suddenly stopped connecting. Backend service was continuously crashing with DNS resolution errors.

---

## Investigation Process

### Phase 1: Initial Discovery

**Commands Used:**
```bash
railway status
railway logs --service backend
railway variables --service backend
railway deployment list
```

**Findings:**
- ✅ MongoDB service exists and is "Online"
- ✅ Backend service deployed successfully (no build errors)
- ✅ All required environment variables present (JWT_SECRET, MONGODB_URI, NODE_ENV)
- ❌ Backend crashing with DNS resolution error

### Phase 2: Error Analysis

**Backend Error Logs:**
```
Attempting MongoDB connection to: mongodb://[CREDENTIALS]@MongoDB.railway.internal:27017
CORS enabled for origins: [ 'https://frontend-production-7270.up.railway.app' ]
Server running on port 5000 in production mode
Error connecting to MongoDB: getaddrinfo ENOTFOUND mongodb.railway.internal
```

**Key Observation:**
- Connection string: `MongoDB.railway.internal` (capital M)
- Error message: `mongodb.railway.internal` (lowercase m)
- DNS resolution failing despite service being online

### Phase 3: Configuration Verification

**MongoDB Service Details:**
```bash
railway variables --service MongoDB
```

**Key Variables:**
- `MONGOHOST`: `MongoDB.railway.internal`
- `MONGO_URL`: `mongodb://mongo:[PASSWORD]@MongoDB.railway.internal:27017`
- `MONGO_PUBLIC_URL`: `mongodb://mongo:[PASSWORD]@shinkansen.proxy.rlwy.net:58247`
- `RAILWAY_PRIVATE_DOMAIN`: `MongoDB.railway.internal`
- Service Status: Active/Online

**Backend Service Details:**
- `MONGODB_URI`: `mongodb://mongo:[PASSWORD]@MongoDB.railway.internal:27017`
- `NODE_ENV`: `production`
- `JWT_SECRET`: ✅ Present
- Both services in same project: `2cd2fd97-ea97-4a68-abd9-f094be65d18e`
- Both services in same environment: `c81d723e-8d69-4e39-a389-fe2f485236b0`

### Phase 4: Troubleshooting Attempts

**Attempt 1: Simplified Hostname**
- Changed `MONGODB_URI` from `MongoDB.railway.internal:27017` to `MongoDB:27017`
- **Result**: ❌ Still failed with `getaddrinfo ENOTFOUND mongodb`

**Attempt 2: Service Reference Variable**
- Changed `MONGODB_URI` to `${{MongoDB.MONGO_URL}}`
- Triggered redeploy
- **Result**: ❌ Still failed with same DNS error

**Attempt 3: Public MongoDB URL** ✅
- Changed `MONGODB_URI` to public proxy URL: `mongodb://mongo:[PASSWORD]@shinkansen.proxy.rlwy.net:58247`
- Triggered redeploy
- **Result**: ✅ SUCCESS - Connection established

---

## Root Cause

**Railway Private Networking DNS Failure**

Railway's internal DNS service could not resolve the private networking hostname `MongoDB.railway.internal`, despite:
- MongoDB service being online and healthy
- Both services being in the same Railway project and environment
- Private networking being properly configured
- Service variables being correctly set

This appears to be an infrastructure issue with Railway's private networking DNS resolution system, not a configuration error in the application code.

---

## Solution Implemented

### Current Configuration (Working)

**Backend MONGODB_URI:**
```
mongodb://mongo:HWvIaKOWvPJgJgcediNCpBGzsmReHtad@shinkansen.proxy.rlwy.net:58247
```

**Connection Method:**
- Using Railway's TCP proxy (public endpoint)
- Connection is secure through Railway's managed proxy
- Port: 58247 (proxied to MongoDB's internal port 27017)

**Verification:**
```
MongoDB connected successfully to: shinkansen.proxy.rlwy.net
```

### Why This Works

Railway's TCP proxy provides a stable public endpoint that bypasses the private networking DNS system. The connection still goes through Railway's infrastructure and is secured by Railway's proxy layer.

---

## Backend Connection Code

The MongoDB connection is handled in `backend/src/config/db.js`:

```javascript
const connectDB = async () => {
  try {
    // Validate MONGODB_URI in production
    if (!process.env.MONGODB_URI && process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: MONGODB_URI environment variable is required in production');
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tableau-migrations-dev';

    // Log connection attempt (mask credentials)
    console.log(`Attempting MongoDB connection to: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//[CREDENTIALS]@')}`);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000,
    });

    console.log(`MongoDB connected successfully to: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};
```

**No code changes were required** - the issue was purely configuration/infrastructure related.

---

## Future Recommendations

### Short-term (Current Solution)
✅ **Keep using the public MongoDB URL**
- Application is working
- Connection is secure via Railway's TCP proxy
- No immediate action required
- Monitor for any performance issues (unlikely)

### Long-term Options

#### Option 1: Contact Railway Support
If private networking is preferred for security/compliance reasons:
1. Open a Railway support ticket
2. Reference this issue: "Private networking DNS not resolving `MongoDB.railway.internal`"
3. Provide project ID: `2cd2fd97-ea97-4a68-abd9-f094be65d18e`
4. Railway may need to check their internal DNS configuration

#### Option 2: Try Service Renaming
Railway's DNS might be case-sensitive:
1. Rename MongoDB service to all lowercase "mongodb" in Railway dashboard
2. Update `MONGODB_URI` to reference lowercase service name
3. Test if `mongodb.railway.internal` resolves correctly

#### Option 3: Alternative MongoDB Hosting
If Railway's MongoDB continues to have issues:
- MongoDB Atlas (official MongoDB cloud hosting)
- Other managed MongoDB providers
- Self-hosted MongoDB on different infrastructure

---

## Lessons Learned

### Key Takeaways
1. **Private networking can fail silently** - Services appear healthy but DNS resolution fails
2. **Public URLs are valid alternatives** - Railway's TCP proxy is secure and reliable
3. **Service variables don't always work** - `${{Service.VARIABLE}}` references may not resolve correctly
4. **DNS case sensitivity** - Private networking hostnames may be case-sensitive in Railway

### Diagnostic Commands for Future Issues

```bash
# Check service status
railway status

# View backend logs
railway logs --service backend --lines 100

# Check environment variables
railway variables --service backend
railway variables --service MongoDB

# View recent deployments
railway deployment list

# Redeploy a service
railway up --service backend --detach

# Set environment variable
railway variables --service backend --set VARIABLE_NAME='value'
```

---

## Configuration Reference

### Working Backend Environment Variables

```
MONGODB_URI=mongodb://mongo:HWvIaKOWvPJgJgcediNCpBGzsmReHtad@shinkansen.proxy.rlwy.net:58247
JWT_SECRET=8a9f3b1e7d2c5a0b4e9f8d7c6b5a43210fedcba9876543210abcdef012345678
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://frontend-production-7270.up.railway.app
```

### MongoDB Service Info

```
Service Name: MongoDB
Region: europe-west4-drams3a
Public Domain: shinkansen.proxy.rlwy.net:58247
Private Domain: MongoDB.railway.internal (not working)
Database: tableau-migrations
Volume: mongodb-volume
```

### Service URLs

- **Frontend**: `https://frontend-production-7270.up.railway.app`
- **Backend**: `https://backend-production-bd14.up.railway.app`
- **MongoDB Public**: `shinkansen.proxy.rlwy.net:58247`

---

## Testing the Fix

### Verify MongoDB Connection

1. Check backend logs for success message:
```bash
railway logs --service backend
```

Expected output:
```
MongoDB connected successfully to: shinkansen.proxy.rlwy.net
```

2. Test login functionality:
- Navigate to frontend URL
- Attempt to log in with valid credentials
- Should successfully authenticate

3. Test database operations:
- Create a new migration
- Update migration questions
- Verify data persists

---

## Timeline

- **Feb 8, 2026 11:33 AM**: Last successful deployment before issue
- **Feb 12, 2026**: Issue reported - backend unable to connect to MongoDB
- **Feb 12, 2026**: Investigation completed - DNS resolution failure identified
- **Feb 12, 2026**: Fix implemented - switched to public MongoDB URL
- **Feb 12, 2026**: Verified working - user able to log in successfully

---

## Related Files

- `/backend/src/config/db.js` - MongoDB connection logic
- `/backend/src/server.js` - Express server startup and environment validation
- `/docker-compose.yml` - Local development MongoDB configuration
- `/.env.example` - Environment variable template
- `/CLAUDE.md` - Project documentation

---

## Contact Information

**Project**: TCM Management
**Railway Project ID**: `2cd2fd97-ea97-4a68-abd9-f094be65d18e`
**Environment**: production
**Region**: europe-west4-drams3a

For Railway support: https://railway.app/help
