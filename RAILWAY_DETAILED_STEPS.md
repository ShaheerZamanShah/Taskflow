# 🔧 Railway Root Directory Fix - Detailed Steps

## 📋 **Step-by-Step Instructions:**

### **Step 1: Access Your Railway Dashboard**
1. Go to [railway.app](https://railway.app) in your browser
2. Sign in to your Railway account
3. You should see your project dashboard with your deployed service

### **Step 2: Find Your Service**
1. Look for your TaskFlow project (it might be named something like "Taskflow" or "taskflow-mern")
2. You'll see a card/tile representing your service
3. **Click on the service card** to open it

### **Step 3: Navigate to Settings**
1. Once inside your service, look for tabs at the top
2. You'll see tabs like: **Deployments**, **Variables**, **Settings**, **Metrics**, etc.
3. **Click on the "Settings" tab**

### **Step 4: Find Root Directory Setting**
1. In the Settings page, scroll down to find the **"Source"** section
2. Look for a field labeled **"Root Directory"** or **"Source Directory"**
3. This field might be empty or set to `/` (root)

### **Step 5: Set Root Directory**
1. **Click in the Root Directory field**
2. **Type exactly:** `backend` (no quotes, no slashes)
3. **Press Enter** or **Tab** to confirm the change
4. You should see the field now shows: `backend`

### **Step 6: Save and Redeploy**
1. **Click "Save"** or **"Update"** if there's a button
2. Look for a **"Redeploy"** or **"Deploy"** button (usually blue/green)
3. **Click "Redeploy"** 
4. Railway will start a new deployment using only your backend folder

### **Step 7: Monitor the Deployment**
1. Go to the **"Deployments"** tab
2. You should see a new deployment starting
3. Watch the build logs - they should now show:
   - Installing dependencies from your backend folder
   - Starting with `node server.js`
   - No more "No start command found" error

## 🎯 **What This Does:**
- Tells Railway to ignore your frontend folder and root files
- Only deploys the `/backend` folder as if it's the entire app
- Uses your backend's package.json and start scripts

## 📱 **Visual Guide:**

```
Railway Dashboard
├── Your Project Card → Click Here
    ├── Deployments Tab
    ├── Variables Tab  
    ├── Settings Tab ← Click Here
    │   ├── General Settings
    │   ├── Source Section
    │   │   └── Root Directory: [backend] ← Type here
    │   └── Save Button ← Click after typing
    └── Redeploy Button ← Click to restart
```

## ✅ **Expected Result:**
After setting Root Directory to `backend` and redeploying:
- ✅ Build should succeed
- ✅ No "No start command found" error
- ✅ Your backend API should be live
- ✅ You'll get a URL like: `https://your-app-name.railway.app`

## 🚨 **If You Can't Find Root Directory:**
Some Railway interfaces might label it differently:
- Look for **"Source Directory"**
- Look for **"Build Context"** 
- Look for **"Working Directory"**
- Check under **"Build Settings"** or **"Deploy Settings"**

## 🎯 **After Success:**
Once your backend is deployed successfully:
1. Copy your Railway URL (like `https://your-app.railway.app`)
2. We'll use this URL to deploy your frontend to Vercel
3. Your TaskFlow app will be fully live!

**This should fix the deployment issue completely!** 🚀
