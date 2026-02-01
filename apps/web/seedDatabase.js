
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

// 1. Credentials for the seeding script (shared with Vite env vars)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.VITE_FIREBASE_APP_ID ?? ""
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error(
    `Missing Firebase config values: ${missingKeys.join(", ")}. ` +
      "Set the VITE_FIREBASE_* environment variables before running the seed script."
  );
  process.exit(1);
}

// 2. Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3. Hardcoded Sample Data (Subset of mockFeed to avoid TS import issues)
const recipesToSeed = [
  {
    id: '6',
    title: 'Street-Style Beef Tacos',
    imageUrl: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://cdn.pixabay.com/video/2024/02/21/201308-915330364_large.mp4', 
    creator: {
      username: 'taco_tuesday',
      avatarUrl: 'https://i.pravatar.cc/150?u=taco_tuesday',
    },
    likes: 4600,
    comments: 189,
    shares: 156,
    prepTime: '20 min',
    cookTime: '15 min',
    servings: 4,
    difficulty: 'Easy',
    category: 'Mexican',
    collections: ['Quick'],
    description: 'Authentic and flavorful street-style beef tacos with fresh cilantro, onions, and a squeeze of lime.',
    ingredients: [
      { name: 'Flank steak', amount: '1 lb' },
      { name: 'Corn tortillas', amount: '8' },
      { name: 'White onion', amount: '1/2, finely chopped' },
      { name: 'Cilantro', amount: '1/2 cup, chopped' },
      { name: 'Lime', amount: '1, cut into wedges' },
      { name: 'Cotija cheese', amount: '1/4 cup, crumbled' },
      { name: 'Olive oil', amount: '1 tbsp' }
    ],
    instructions: [
        'Season steak with salt and pepper. Heat olive oil in a skillet over high heat.',
        'Sear steak for 3-4 minutes per side for medium-rare. Let it rest for 10 minutes, then chop into small pieces.',
        'Warm tortillas in the skillet or over an open flame.',
        'Assemble tacos by filling each tortilla with chopped steak, a sprinkle of onion, cilantro, and cotija cheese.',
        'Serve immediately with lime wedges on the side.'
    ],
    nutrition: { calories: 480, protein: 35, carbs: 30, fat: 25 }
  },
  {
    id: '1',
    title: 'Creamy Tuscan Chicken',
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://cdn.pixabay.com/video/2023/10/15/185094-874635925_large.mp4',
    creator: {
      username: 'chef_mario',
      avatarUrl: 'https://i.pravatar.cc/150?u=chef_mario',
    },
    likes: 2800,
    comments: 156,
    shares: 89,
    prepTime: '10 min',
    cookTime: '30 min',
    servings: 4,
    description: 'A decadent and flavorful one-pan chicken dish with a creamy sun-dried tomato and spinach sauce.',
    difficulty: 'Easy',
    category: 'Pasta',
    collections: ['Quick'],
    ingredients: [
      { name: 'Chicken breast', amount: '2 lbs' },
      { name: 'Heavy cream', amount: '1 cup' },
      { name: 'Sun-dried tomatoes', amount: '½ cup' },
      { name: 'Spinach', amount: '2 cups' },
      { name: 'Garlic', amount: '4 cloves' },
      { name: 'Parmesan', amount: '½ cup' },
    ],
    instructions: [
      'Season chicken with salt and pepper, then sear in a hot skillet until golden brown.',
      'Remove chicken. Sauté garlic, then add sun-dried tomatoes and spinach.',
      'Stir in heavy cream and parmesan. Simmer until sauce thickens.',
      'Return chicken to the pan and cook until heated through. Serve immediately.',
    ],
    nutrition: { calories: 650, protein: 50, carbs: 10, fat: 45 }
  },
  {
    id: '2',
    title: 'Quinoa Power Bowl',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://cdn.pixabay.com/video/2022/05/19/117651-711977700_large.mp4',
    creator: {
      username: 'healthy_hannah',
      avatarUrl: 'https://i.pravatar.cc/150?u=healthy_hannah',
    },
    likes: 5200,
    comments: 321,
    shares: 240,
    prepTime: '10 min',
    cookTime: '20 min',
    servings: 2,
    description: 'A vibrant and nutrient-packed bowl perfect for a healthy lunch or light dinner.',
    difficulty: 'Easy',
    category: 'Salads',
    collections: ['Quick', 'Healthy'],
    ingredients: [
      { name: 'Quinoa', amount: '1 cup' },
      { name: 'Chickpeas', amount: '1 can' },
      { name: 'Cucumber', amount: '1' },
      { name: 'Cherry tomatoes', amount: '1 cup' },
      { name: 'Feta cheese', amount: '½ cup' },
      { name: 'Lemon', amount: '1' },
      { name: 'Olive oil', amount: '2 tbsp' },
    ],
    instructions: [
      'Cook quinoa according to package directions.',
      'Chop all vegetables and combine in a large bowl.',
      'Add cooked quinoa and chickpeas to the vegetables.',
      'Whisk together lemon juice and olive oil for the dressing. Pour over the bowl.',
      'Top with feta cheese and serve.',
    ],
    nutrition: { calories: 450, protein: 20, carbs: 60, fat: 18 }
  }
];

// 4. Execution Function
async function seedDatabase() {
  console.log("🚀 Starting database seed...");
  
  try {
    for (const recipe of recipesToSeed) {
      const docRef = doc(db, "recipes", recipe.id);
      await setDoc(docRef, recipe);
      console.log(`✅ Uploaded: ${recipe.title}`);
    }
    console.log("\n🎉 Success! Database seeded.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
