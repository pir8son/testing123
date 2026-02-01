
import { Recipe } from '../types';

// Real MP4 URLs from Pixabay/Pexels for the feed
export const mockFeed: Recipe[] = [
  {
    id: '6',
    title: 'Street-Style Beef Tacos',
    imageUrl: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://cdn.pixabay.com/video/2024/02/21/201308-915330364_large.mp4', 
    creatorId: 'mock_taco_user', // Added for navigation
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
    nutrition: {
        calories: 480,
        protein: 35,
        carbs: 30,
        fat: 25
    }
  },
  {
    id: '1',
    title: 'Creamy Tuscan Chicken',
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://cdn.pixabay.com/video/2023/10/15/185094-874635925_large.mp4',
    creatorId: 'mock_mario_user', // Added for navigation
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
      { name: 'Parmesan', amount: '½ cup', inPantry: true },
    ],
    instructions: [
      'Season chicken with salt and pepper, then sear in a hot skillet until golden brown.',
      'Remove chicken. Sauté garlic, then add sun-dried tomatoes and spinach.',
      'Stir in heavy cream and parmesan. Simmer until sauce thickens.',
      'Return chicken to the pan and cook until heated through. Serve immediately.',
    ],
    nutrition: {
        calories: 650,
        protein: 50,
        carbs: 10,
        fat: 45,
    }
  },
  {
    id: '2',
    title: 'Quinoa Power Bowl',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://cdn.pixabay.com/video/2022/05/19/117651-711977700_large.mp4',
    creatorId: 'mock_hannah_user', // Added for navigation
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
      { name: 'Cucumber', amount: '1', inPantry: true },
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
    nutrition: {
        calories: 450,
        protein: 20,
        carbs: 60,
        fat: 18,
    }
  },
  {
    id: '3',
    title: 'Spicy Shrimp Pasta',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://cdn.pixabay.com/video/2021/04/14/71092-536965681_large.mp4',
    creatorId: 'mock_prince_user', // Added for navigation
    creator: {
      username: 'pasta_prince',
      avatarUrl: 'https://i.pravatar.cc/150?u=pasta_prince',
    },
    likes: 8900,
    comments: 743,
    shares: 512,
    prepTime: '10 min',
    cookTime: '25 min',
    servings: 4,
    description: 'A fiery and garlicky pasta dish that comes together in under 30 minutes. Perfect for a weeknight.',
    difficulty: 'Medium',
    category: 'Pasta',
    collections: ['Quick'],
    ingredients: [
      { name: 'Linguine', amount: '1 lb' },
      { name: 'Shrimp', amount: '1 lb, peeled and deveined' },
      { name: 'Garlic', amount: '6 cloves, minced' },
      { name: 'Red pepper flakes', amount: '1 tsp' },
      { name: 'White wine', amount: '1/2 cup' },
      { name: 'Parsley', amount: '1/4 cup, chopped' },
      { name: 'Butter', amount: '4 tbsp' },
    ],
    instructions: [
      'Cook linguine according to package directions. Reserve 1 cup of pasta water.',
      'In a large skillet, melt butter over medium heat. Add garlic and red pepper flakes and cook until fragrant.',
      'Add shrimp and cook until pink. Remove shrimp from skillet.',
      'Deglaze the pan with white wine. Add reserved pasta water and bring to a simmer.',
      'Return pasta and shrimp to the skillet, tossing to combine. Garnish with parsley before serving.',
    ],
     nutrition: {
        calories: 580,
        protein: 30,
        carbs: 70,
        fat: 20,
    }
  },
  {
    id: '4',
    title: 'Classic Avocado Toast',
    imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://cdn.pixabay.com/video/2022/02/16/107876-678457224_large.mp4',
    creatorId: 'mock_brunch_user', // Added for navigation
    creator: {
      username: 'brunch_queen',
      avatarUrl: 'https://i.pravatar.cc/150?u=brunch_queen',
    },
    likes: 12400,
    comments: 980,
    shares: 850,
    prepTime: '5 min',
    cookTime: '5 min',
    servings: 1,
    description: 'The quintessential brunch classic. Perfectly ripe avocado on toasted sourdough, customized your way.',
    difficulty: 'Easy',
    category: 'Breakfast',
    collections: ['Quick', 'Vegetarian'],
    ingredients: [
      { name: 'Sourdough bread', amount: '1 thick slice' },
      { name: 'Avocado', amount: '1/2 ripe' },
      { name: 'Lemon juice', amount: '1 tsp' },
      { name: 'Red pepper flakes', amount: 'a pinch' },
      { name: 'Salt & Pepper', amount: 'to taste' },
      { name: 'Everything bagel seasoning', amount: 'optional' },
    ],
    instructions: [
      'Toast sourdough slice to your desired crispness.',
      'In a small bowl, mash the avocado with lemon juice, salt, and pepper.',
      'Spread the mashed avocado evenly over the toasted bread.',
      'Sprinkle with red pepper flakes and everything bagel seasoning (if using).',
    ],
     nutrition: {
        calories: 320,
        protein: 9,
        carbs: 35,
        fat: 18,
    }
  },
];
