# Firebase Setup Instructions

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Enter a project name (e.g., "practice-react-exam")
4. Disable Google Analytics (optional for this app)
5. Click **"Create project"**

## Step 2: Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Register your app with a nickname (e.g., "Practice Exam App")
3. **Don't** enable Firebase Hosting (unless you want to)
4. Click **"Register app"**

## Step 3: Get Your Firebase Configuration

After registering, you'll see your Firebase configuration. It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

**Copy these values** - you'll need them in the next step.

## Step 4: Update Your Firebase Config File

1. Open `src/firebase/config.ts` in your project
2. Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

## Step 5: Enable Cloud Firestore

1. In Firebase Console, go to **"Build"** > **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
   - Test mode allows read/write access for 30 days
   - You can configure security rules later
4. Select a Firestore location (choose closest to your users)
5. Click **"Enable"**

## Step 6: Configure Security Rules (Optional but Recommended)

For production, update your Firestore rules:

1. Go to **Firestore Database** > **Rules** tab
2. Replace with these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to questions for everyone
    match /questions/{questionId} {
      allow read: if true;
      allow write: if true; // Change to 'if request.auth != null;' if you add auth
    }
  }
}
```

3. Click **"Publish"**

## Step 7: Test Your App

1. Start your development server: `npm run dev`
2. Go to the Admin page and try adding a question
3. The question should appear in Firebase Console under Firestore Database
4. Navigate to the Exam page - you should see your custom questions

## What's Changed

✅ **Questions are now stored in Firebase Firestore** (cloud database)
✅ **Real-time sync** - Changes appear instantly across all devices
✅ **Persistent** - Data survives browser clearing, device switching
✅ **Admin page** - Uses Firestore for CRUD operations
✅ **Exam page** - Loads both sample questions + Firestore questions

## Troubleshooting

### "Error: Firebase config not found"
- Make sure you've replaced ALL placeholder values in `config.ts`
- Check that your Firebase project is created and app is registered

### "Permission denied" errors
- Go to Firestore rules and set to test mode
- Or add authentication and update rules accordingly

### Questions not showing up
- Check Firebase Console > Firestore Database to see if data is being saved
- Check browser console for error messages
- Ensure Firestore is enabled in your Firebase project

## Next Steps (Optional)

- **Add Authentication**: Use Firebase Auth to secure your questions
- **Deploy**: Use Firebase Hosting to deploy your app
- **Security Rules**: Tighten security rules for production
- **Backup**: Set up automated Firestore backups

## Notes

- The free tier includes 50,000 reads/day and 20,000 writes/day (plenty for this app)
- Your API key is safe to expose in client code (it's designed for that)
- For production, implement proper security rules
