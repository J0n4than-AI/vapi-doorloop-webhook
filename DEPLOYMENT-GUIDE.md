# Webhook Server Deployment Guide

## Overview

This webhook server sits between VAPI and DoorLoop, translating function calls from your voice assistant into DoorLoop API requests.

---

## 📦 What You Have

- `webhook-server.js` - Main server code
- `package.json` - Dependencies
- `doorloop-tools-config.json` - Tool configurations
- Your DoorLoop API token (already configured in code)

---

## 🚀 Deployment Options

### Option 1: Deploy to Render.com (Recommended - Free Tier Available)

**Step 1: Push to GitHub**
1. Create a new repository on GitHub
2. Upload these files:
   - `webhook-server.js`
   - `package.json`
   - `.gitignore` (create with content: `node_modules/`)

**Step 2: Deploy to Render**
1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `vapi-doorloop-webhook`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Add environment variable:
   - Key: `DOORLOOP_API_TOKEN`
   - Value: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoiQVBJIiwiaWQiOiI2OGVlNmZiYjIxYjI0MjkxYjdmZTM4ODgiLCJleHAiOjIwNzU4MTY2MzV9.6D_BgXStGG-yVE5dogTmp_KQ7So0GRhtOBXbMUyLS1I`
6. Click "Create Web Service"

**Step 3: Get Your Webhook URL**
- Render will give you a URL like: `https://vapi-doorloop-webhook.onrender.com`
- Your webhook endpoint: `https://vapi-doorloop-webhook.onrender.com/vapi/webhook`

---

### Option 2: Deploy to Railway.app (Easy Alternative)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variable: `DOORLOOP_API_TOKEN`
6. Deploy automatically starts
7. Get your URL from the dashboard

---

### Option 3: Deploy to Your Own Server

**Requirements:**
- Node.js 14+ installed
- Server with public IP or domain
- Port 3000 open (or configure different port)

**Steps:**

1. **Upload files to server:**
   ```bash
   scp webhook-server.js package.json user@your-server:/var/www/vapi-webhook/
   ```

2. **SSH into server:**
   ```bash
   ssh user@your-server
   cd /var/www/vapi-webhook
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set environment variable:**
   ```bash
   export DOORLOOP_API_TOKEN="your-token-here"
   ```

5. **Start server:**
   ```bash
   # For testing:
   npm start

   # For production (with PM2):
   npm install -g pm2
   pm2 start webhook-server.js --name vapi-webhook
   pm2 save
   pm2 startup
   ```

6. **Set up reverse proxy (Nginx):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location /vapi/webhook {
           proxy_pass http://localhost:3000/vapi/webhook;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

### Option 4: Deploy to Heroku

1. Install Heroku CLI: `npm install -g heroku`
2. Login: `heroku login`
3. Create app: `heroku create vapi-doorloop-webhook`
4. Set environment variable:
   ```bash
   heroku config:set DOORLOOP_API_TOKEN="your-token-here"
   ```
5. Deploy:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a vapi-doorloop-webhook
   git push heroku master
   ```

---

## 🔧 Local Testing

Before deploying, test locally:

1. **Install dependencies:**
   ```bash
   cd "MAINTENANCE AGENT"
   npm install
   ```

2. **Start server:**
   ```bash
   npm start
   ```

3. **Test with curl:**
   ```bash
   curl -X POST http://localhost:3000/vapi/webhook \
     -H "Content-Type: application/json" \
     -d '{
       "message": {
         "type": "function-call",
         "functionCall": {
           "name": "createWorkOrder",
           "parameters": {
             "unitNumber": "204",
             "tenantName": "Test Tenant",
             "tenantPhone": "555-1234",
             "issueDescription": "Test leak",
             "urgency": "urgent",
             "category": "plumbing"
           }
         }
       }
     }'
   ```

4. **Check DoorLoop:**
   - Log into DoorLoop
   - Check Tasks
   - Should see new task created

---

## 🔗 Connect to VAPI

Once deployed:

1. **Get your webhook URL** (from Render, Railway, etc.)
   Example: `https://vapi-doorloop-webhook.onrender.com`

2. **Update VAPI Assistant:**
   - Go to [vapi.ai](https://vapi.ai)
   - Edit "MaintenanceBot - Unified Assistant"
   - Set **Server URL**: `https://your-webhook-url.com/vapi/webhook`
   - Add **7 function tools** (just the function definitions, no server config)

3. **Add Functions to VAPI:**

For each function, add only this part:

```json
{
  "type": "function",
  "function": {
    "name": "createWorkOrder",
    "description": "Creates a new maintenance work order",
    "parameters": {
      "type": "object",
      "properties": {
        "unitNumber": {"type": "string"},
        "tenantName": {"type": "string"},
        "tenantPhone": {"type": "string"},
        "issueDescription": {"type": "string"},
        "urgency": {"type": "string", "enum": ["urgent", "standard", "low"]},
        "category": {"type": "string", "enum": ["plumbing", "electrical", "hvac", "appliance", "security", "general"]}
      },
      "required": ["unitNumber", "tenantName", "tenantPhone", "issueDescription", "urgency", "category"]
    }
  }
}
```

Repeat for all 7 functions:
- createWorkOrder
- escalateToEmergency
- dispatchEmergencyVendor
- provideStatus
- confirmCompletion
- reopenWorkOrder
- scheduleInspection

---

## ✅ Testing Checklist

After deployment:

- [ ] Webhook server is running
- [ ] Health check responds: `GET https://your-url.com/health`
- [ ] VAPI assistant has serverUrl set
- [ ] All 7 functions added to VAPI
- [ ] Test intake call: "My sink is leaking"
- [ ] Check DoorLoop: Task created
- [ ] Test emergency: "No heat, it's freezing"
- [ ] Check DoorLoop: High priority task created
- [ ] Test followup: "Calling about completed repair"
- [ ] Check DoorLoop: Task marked completed

---

## 🐛 Troubleshooting

### Server won't start
- Check Node.js version: `node --version` (need 14+)
- Check dependencies: `npm install`
- Check logs: `npm start` (look for errors)

### VAPI can't reach webhook
- Check firewall/security groups
- Verify URL is public and accessible
- Test with curl from external machine
- Check HTTPS (some platforms require it)

### DoorLoop API errors
- Verify API token is correct
- Check token hasn't expired
- Verify account has API access
- Check DoorLoop API status

### Tasks not appearing in DoorLoop
- Check webhook server logs
- Verify DoorLoop token in environment variable
- Test API token with curl:
  ```bash
  curl -X GET https://app.doorloop.com/api/tasks \
    -H "Authorization: Bearer your-token" \
    -H "Accept: application/json"
  ```

---

## 📊 Monitoring

### View Logs

**Render:**
- Dashboard → Your Service → Logs

**Railway:**
- Project → Deployments → View Logs

**Heroku:**
```bash
heroku logs --tail -a vapi-doorloop-webhook
```

**PM2 (own server):**
```bash
pm2 logs vapi-webhook
```

### Health Check

Monitor: `GET https://your-url.com/health`

Should return:
```json
{
  "status": "healthy",
  "service": "VAPI to DoorLoop Webhook",
  "timestamp": "2025-10-30T14:30:00.000Z"
}
```

---

## 🔒 Security Best Practices

1. **Never commit API tokens to GitHub**
   - Use environment variables
   - Add `.env` to `.gitignore`

2. **Use HTTPS**
   - Render/Railway provide this automatically
   - For own server, use Let's Encrypt

3. **Add authentication** (optional but recommended)
   - Add API key check in webhook endpoint
   - Verify requests come from VAPI

4. **Rate limiting**
   - Add express-rate-limit middleware
   - Prevent abuse

---

## 💡 Next Steps

After deployment:

1. **Test thoroughly** with all scenarios
2. **Monitor first 24 hours** closely
3. **Train staff** on how system works
4. **Set up alerts** for errors
5. **Document custom workflows**

---

## 📞 Need Help?

If you run into issues:

1. Check webhook server logs
2. Check VAPI call logs
3. Check DoorLoop tasks
4. Test each component individually

**Common Issues:**
- Wrong webhook URL in VAPI
- API token not set correctly
- Function names don't match
- Missing required parameters

---

**Your webhook server is ready to deploy!**

Choose your deployment method above and follow the steps.
