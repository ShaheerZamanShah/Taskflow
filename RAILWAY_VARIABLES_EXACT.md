# 🔧 Railway Environment Variables - Exact Copy-Paste Guide

## ✅ **Add These 5 Variables Separately in Railway:**

### **How to Add:**
1. Go to **Railway Dashboard** → **Your Service** → **Variables Tab**
2. Click **"New Variable"** (or **"Add Variable"**)
3. **Copy the Name and Value exactly** for each variable below
4. **Add each one separately** (5 total variables)

---

## 📋 **Variable 1:**
**Name:** `NODE_ENV`  
**Value:** `production`

## 📋 **Variable 2:**
**Name:** `PORT`  
**Value:** `5000`

## 📋 **Variable 3:**
**Name:** `MONGODB_URI`  
**Value:** `mongodb+srv://shaheer:todolistpass@todolist.wps9rv8.mongodb.net/taskflow?retryWrites=true&w=majority&appName=ToDoList`

## 📋 **Variable 4:**
**Name:** `JWT_SECRET`  
**Value:** `taskflow_super_secure_jwt_secret_key_for_production_2024_make_it_long_and_complex_enough_for_security`

## 📋 **Variable 5:**
**Name:** `FRONTEND_URL`  
**Value:** `http://localhost:3000`

---

## 🎯 **Step-by-Step Process:**

### **For Each Variable:**
1. **Click "New Variable"** (or "Add Variable")
2. **Name field:** Copy-paste the name (like `NODE_ENV`)
3. **Value field:** Copy-paste the value (like `production`)
4. **Click "Add"** or **"Save"**
5. **Repeat for all 5 variables**

### **Visual Guide:**
```
Railway Variables Page:
┌─────────────────────────────────────┐
│ + Add Variable                      │
├─────────────────────────────────────┤
│ Name:  NODE_ENV                     │
│ Value: production                   │
│ [Add Variable]                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ + Add Variable                      │
├─────────────────────────────────────┤
│ Name:  PORT                         │
│ Value: 5000                         │
│ [Add Variable]                      │  
└─────────────────────────────────────┘

... repeat for all 5 variables
```

---

## ✅ **Final Result - You Should Have 5 Variables:**

| Variable Name | Variable Value |
|---------------|---------------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | `mongodb+srv://shaheer:todolistpass@todolist.wps9rv8.mongodb.net/taskflow?retryWrites=true&w=majority&appName=ToDoList` |
| `JWT_SECRET` | `taskflow_super_secure_jwt_secret_key_for_production_2024_make_it_long_and_complex_enough_for_security` |
| `FRONTEND_URL` | `http://localhost:3000` |

---

## 🚀 **After Adding All 5 Variables:**
1. **Click "Redeploy"** (or "Deploy Latest")
2. **Watch the build logs** 
3. **Should succeed this time!**

## ⚠️ **Important Notes:**
- **Each variable is separate** - don't put them all in one
- **Copy-paste exactly** - no extra spaces or quotes
- **All 5 are required** for the app to work
- **MONGODB_URI is the long one** - make sure you get the full string

**Yes, add all 5 separately! Each one gets its own Name/Value pair.** 🎯
