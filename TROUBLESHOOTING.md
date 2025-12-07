# Troubleshooting Guide

## 500 Internal Server Error on Registration/Login

### Common Causes and Solutions

#### 1. **MongoDB Not Connected**
**Symptoms:** 500 error when trying to register/login

**Solution:**
- Check if MongoDB is running:
  ```bash
  # macOS
  brew services list | grep mongodb
  
  # Linux
  sudo systemctl status mongod
  ```
- Start MongoDB if not running:
  ```bash
  # macOS
  brew services start mongodb-community
  
  # Linux
  sudo systemctl start mongod
  ```
- Verify your MongoDB connection string in `backend/.env`:
  ```env
  MONGODB_URI=mongodb://localhost:27017/chess-platform
  ```
- Test connection manually:
  ```bash
  mongosh
  # or
  mongo
  ```

#### 2. **Missing Environment Variables**
**Symptoms:** JWT errors or database connection issues

**Solution:**
- Check that `backend/.env` exists and has all required variables:
  ```env
  PORT=5100
  MONGODB_URI=mongodb://localhost:27017/chess-platform
  JWT_SECRET=your-super-secret-jwt-key-change-in-production
  JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
  NODE_ENV=development
  CLIENT_URL=http://localhost:5173
  ```
- Generate secure secrets:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

#### 3. **Backend Server Not Running**
**Symptoms:** Connection refused or network errors

**Solution:**
- Make sure backend is running:
  ```bash
  cd backend
  npm run dev
  ```
- Check if port 5100 is available:
  ```bash
  lsof -i :5100
  ```
- If port is in use, kill the process or change PORT in `.env`

#### 4. **Database Connection Error**
**Symptoms:** Error messages about MongoDB connection

**Solution:**
- Check MongoDB logs:
  ```bash
  # macOS Homebrew
  tail -f /usr/local/var/log/mongodb/mongo.log
  
  # Linux
  tail -f /var/log/mongodb/mongod.log
  ```
- Verify MongoDB is listening on default port:
  ```bash
  lsof -i :27017
  ```
- Try connecting with MongoDB Compass or mongosh

#### 5. **CORS Errors**
**Symptoms:** CORS policy errors in browser console

**Solution:**
- Verify `CLIENT_URL` in `backend/.env` matches frontend URL:
  ```env
  CLIENT_URL=http://localhost:5173
  ```
- Check backend CORS configuration in `backend/src/app.js`

#### 6. **Validation Errors**
**Symptoms:** Specific field validation messages

**Solution:**
- Check error message in browser console or network tab
- Common issues:
  - Password too short (min 6 characters)
  - Invalid email format
  - Username already exists
  - Username too short (min 3 characters)

### Debugging Steps

1. **Check Backend Logs**
   - Look at the terminal where `npm run dev` is running
   - Check for error messages or stack traces

2. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look at Console tab for JavaScript errors
   - Check Network tab for failed requests and response details

3. **Test Backend Directly**
   ```bash
   # Test health endpoint
   curl http://localhost:5100/api/health
   
   # Test registration endpoint
   curl -X POST http://localhost:5100/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"test","email":"test@test.com","password":"test123"}'
   ```

4. **Check Database**
   ```bash
   mongosh
   use chess-platform
   show collections
   db.users.find()
   ```

### Common Error Messages

#### "Cannot find package 'express'"
**Solution:** Run `npm install` in backend directory

#### "MongoNetworkError: connect ECONNREFUSED"
**Solution:** MongoDB is not running or connection string is wrong

#### "JWT_SECRET is not defined"
**Solution:** Add JWT_SECRET to backend/.env file

#### "E11000 duplicate key error"
**Solution:** Username or email already exists - try different values

### Still Having Issues?

1. Check that all dependencies are installed:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check Node.js version (requires v18+):
   ```bash
   node --version
   ```

4. Verify file permissions and paths

5. Check firewall/security software blocking ports

