// ============================================================
// AUREVA HABITAT — Firebase Configuration
// ============================================================
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project: "aureva-habitat"
// 3. Enable: Authentication (Email/Password), Firestore, Storage
// 4. Go to Project Settings > Your Apps > Add Web App
// 5. Copy your config values below and replace the placeholders
// 6. In Firebase Console > Authentication > Sign-in method > Enable Email/Password
// 7. In Firestore > Rules, set:
//    rules_version = '2';
//    service cloud.firestore.database {
//      match /databases/{database}/documents {
//        match /leads/{doc} { allow create: if true; allow read, write: if request.auth != null; }
//        match /queries/{doc} { allow create: if true; allow read, write: if request.auth != null; }
//        match /portfolio/{doc} { allow read: if true; allow write: if request.auth != null; }
//        match /settings/{doc} { allow read: if true; allow write: if request.auth != null; }
//        match /services/{doc} { allow read: if true; allow write: if request.auth != null; }
//      }
//    }
// 8. In Storage > Rules, set:
//    rules_version = '2';
//    service firebase.storage {
//      match /b/{bucket}/o {
//        match /portfolio/{allPaths=**} { allow read: if true; allow write: if request.auth != null; }
//      }
//    }
// ============================================================
// DEPLOYMENT:
// 1. npm install -g firebase-tools
// 2. firebase login
// 3. firebase init (select Hosting, use "." as public dir, SPA: yes)
// 4. firebase deploy
// 5. Add custom domain in Firebase Hosting > Add custom domain > aurevahabitat.com
// ============================================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Seed default settings if they don't exist
async function seedDefaultSettings() {
  try {
    const settingsDoc = await db.collection('settings').doc('site').get();
    if (!settingsDoc.exists) {
      await db.collection('settings').doc('site').set({
        tagline: "Interiors That Define Luxury",
        heroSubtitle: "We craft bespoke living spaces where artistry meets architecture. Every room tells a story of refined elegance.",
        aboutTitle: "Crafting Luxury, One Space at a Time",
        aboutDescription: "Aureva Habitat is a premier interior design studio founded on the belief that exceptional spaces transform lives. With an eye for detail and a passion for perfection, we deliver interiors that are uniquely yours.",
        founderName: "Mohit Sharma",
        founderTitle: "Founder & CEO",
        founderBio: "With over a decade of experience in luxury interior design, Mohit Sharma founded Aureva Habitat with a vision to redefine living spaces across India. His philosophy combines timeless elegance with functional innovation.",
        phone: "8595489361",
        email: "aurevahabitat@gmail.com",
        whatsapp: "918595489361"
      });
    }

    const servicesSnap = await db.collection('services').get();
    if (servicesSnap.empty) {
      const defaultServices = [
        { title: "Interior Design", description: "Bespoke interiors crafted for your unique lifestyle and aesthetic vision.", icon: "✦", order: 1 },
        { title: "Architecture Planning", description: "Comprehensive architectural solutions from concept to completion.", icon: "◈", order: 2 },
        { title: "3D Visualization", description: "Photorealistic renders that bring your dream space to life before construction.", icon: "◉", order: 3 },
        { title: "Commercial Projects", description: "Premium commercial spaces that elevate your brand identity.", icon: "▣", order: 4 },
        { title: "Luxury Homes", description: "Signature residences that define a new standard of luxurious living.", icon: "⬡", order: 5 },
        { title: "Space Consultation", description: "Expert guidance on optimizing your space for beauty and functionality.", icon: "◎", order: 6 }
      ];
      for (const svc of defaultServices) {
        await db.collection('services').add(svc);
      }
    }
  } catch (e) {
    console.log('Seed skipped:', e.message);
  }
}

seedDefaultSettings();
