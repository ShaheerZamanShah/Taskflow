# 🚨 Frontend Connection Issue - QUICK FIX

## ❌ **Problem Identified:**
Your frontend is connecting to `localhost:5000` instead of your Railway backend!

**Error**: `localhost:5000/api/tasks:1 Failed to load resource: net::ERR_CONNECTION_REFUSED`

## 🎯 **Root Cause:**
The `REACT_APP_API_URL` environment variable wasn't properly set in Vercel.

---

## 🔧 **IMMEDIATE FIX - Update Vercel Environment Variable:**

### **Step 1: Go to Vercel Dashboard**
1. **Visit**: [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Find your project**: `taskflow-three-omega`
3. **Click on your project**

### **Step 2: Add/Update Environment Variable**
1. **Go to "Settings" tab**
2. **Click "Environment Variables"**
3. **Look for existing `REACT_APP_API_URL`** (if it exists, edit it)
4. **If it doesn't exist, click "Add New"**

### **Step 3: Set the Correct Value**
- **Name**: `REACT_APP_API_URL`
- **Value**: `https://taskflow-production-21f6.up.railway.app/api`
- **Environment**: Select "Production" (and "Preview" if available)

### **Step 4: Redeploy**
1. **Go to "Deployments" tab**
2. **Click the "..." menu** on your latest deployment
3. **Click "Redeploy"**
4. **Wait 2-3 minutes** for redeployment

---

## 🧪 **Alternative: Check Your Current Frontend Code**

Let me check if your frontend code has the right API configuration:

### **Check These Files:**
1. **Frontend environment variables**
2. **API configuration in your React code**

---

## ✅ **After the Fix:**

### **Expected Behavior:**
- ✅ Frontend connects to: `https://taskflow-production-21f6.up.railway.app/api`
- ✅ Tasks load properly
- ✅ Dashboard shows data
- ✅ Creating tasks works

### **Test URLs:**
- **Frontend**: https://taskflow-three-omega.vercel.app/
- **Backend Health**: https://taskflow-production-21f6.up.railway.app/api/health

---

## 🚨 **If Environment Variable Was Missing:**

This means during initial Vercel deployment, the environment variable wasn't added. This is common!

**The fix above will resolve it completely.**

---

## 🎯 **Verification Steps:**

### **After Redeploy:**
1. **Visit**: https://taskflow-three-omega.vercel.app/
2. **Open Browser Developer Tools** (F12)
3. **Go to Network tab**
4. **Try creating a task**
5. **You should see requests to**: `taskflow-production-21f6.up.railway.app` (NOT localhost)

**Let me know once you've updated the environment variable in Vercel, and I'll help you verify the fix!**
