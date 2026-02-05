# Firebase Security Guide

## Environment Variables Setup ✅

Your Firebase credentials are now stored in environment variables instead of being hardcoded.

### Files Created:
- `.env` - Your actual credentials (NOT committed to git)
- `.env.example` - Template for other developers
- Updated `.gitignore` - Prevents `.env` from being committed

### How to Configure:

1. Open `.env` file
2. Replace the placeholder values with your actual Firebase credentials from Firebase Console
3. Save the file
4. Restart your dev server (`npm run dev`)

## Important Security Facts

### ⚠️ Firebase API Keys Are Public
Firebase API keys are **designed to be exposed** in client-side code:
- They identify your Firebase project, not authenticate users
- They're visible in your bundled JavaScript
- Google's security model expects this

### 🔒 Real Security Measures

**1. Firebase Security Rules (CRITICAL)**
Your Firestore rules control who can read/write data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Example: Only authenticated users can write
    match /questions/{questionId} {
      allow read: if true;  // Anyone can read
      allow write: if request.auth != null;  // Only authenticated users can write
    }
    
    match /examResults/{resultId} {
      allow read: if request.auth != null;  // Only authenticated users
      allow write: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

**2. Firebase App Check**
Protects your backend from abuse:
- Verifies requests come from your app
- Blocks unauthorized API access
- Prevents bots and scrapers

To enable:
```bash
npm install firebase/app-check
```

**3. Rate Limiting**
- Use Firebase's built-in quotas
- Implement rate limiting in security rules
- Monitor usage in Firebase Console

**4. Authentication**
- Add Firebase Authentication
- Restrict data access to authenticated users
- Use user IDs in security rules

## Current Security Status

✅ Credentials not hardcoded
✅ `.env` file in `.gitignore`
❌ No authentication (anyone can write)
❌ No App Check protection
❌ Security rules in test mode

## Recommended Next Steps

### 1. Update Firestore Security Rules (High Priority)

Go to Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Questions collection
    match /questions/{questionId} {
      allow read: if true;  // Public read
      allow create, update, delete: if false;  // Disable public writes in production
      // Or require auth: allow write: if request.auth != null;
    }
    
    // Exam results collection
    match /examResults/{resultId} {
      allow read: if true;  // Or restrict to authenticated users
      allow create: if true;  // Anyone can submit results
      allow update, delete: if false;  // Prevent modifications
    }
  }
}
```

### 2. Add Firebase Authentication (Recommended)

```bash
npm install firebase/auth
```

Then protect your admin routes and restrict data access.

### 3. Enable App Check (Production)

Prevents API abuse:
```bash
npm install @firebase/app-check
```

### 4. Monitor Usage

- Check Firebase Console > Usage and Billing
- Set up budget alerts
- Monitor for unusual activity

## Environment Variables for Different Stages

### Development (.env)
```
VITE_FIREBASE_API_KEY=dev_key
VITE_FIREBASE_PROJECT_ID=dev_project
```

### Production (.env.production)
```
VITE_FIREBASE_API_KEY=prod_key
VITE_FIREBASE_PROJECT_ID=prod_project
```

## What NOT to Commit

❌ `.env` files with real credentials
❌ Service account keys (JSON files)
❌ Private keys
❌ Database passwords

✅ `.env.example` (template only)
✅ Firebase config code (uses env vars)
✅ Security rules

## Additional Resources

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
