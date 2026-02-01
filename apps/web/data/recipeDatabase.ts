
import { Recipe } from '../types';
import { mockFeed } from './mockFeed';

export const recipeDatabase: Recipe[] = [
  // Start with all recipes from the feed to ensure consistency
  ...mockFeed,
  // Add other recipes not in the feed
  {
    id: '7',
    title: 'Classic Margherita Pizza',
    imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'placeholder.mp4',
    creator: { username: 'pizza_pete', avatarUrl: 'https://i.pravatar.cc/150?u=pizza_pete' },
    likes: 9500, comments: 630, shares: 450, prepTime: '20 min', cookTime: '15 min', servings: 2,
    difficulty: 'Medium', category: 'Pizza', collections: ['Vegetarian'], tags: ['Vegetarian', 'Quick'],
    description: 'A timeless classic with fresh basil, mozzarella, and a rich tomato sauce.',
    ingredients: [{ name: 'Pizza dough', amount: '1 ball' }, { name: 'San Marzano tomatoes', amount: '1 can' }, { name: 'Fresh mozzarella', amount: '8 oz' }, { name: 'Fresh basil', amount: '1 bunch' }],
    instructions: ['Stretch dough.', 'Top with sauce and cheese.', 'Bake until golden.', 'Garnish with basil.'],
    nutrition: { calories: 750, protein: 30, carbs: 90, fat: 30 }
  },
  {
    id: '8',
    title: 'Hearty Lentil Soup',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23acbe3a624b?auto=format&fit=crop&w=800&q=80',
    creator: { username: 'souper_sally', avatarUrl: 'https://i.pravatar.cc/150?u=souper_sally' },
    likes: 6100, comments: 410, shares: 200, prepTime: '15 min', cookTime: '45 min', servings: 6,
    difficulty: 'Easy', category: 'Soups', collections: ['Healthy', 'Vegetarian'], tags: ['Vegan', 'Vegetarian', 'Gluten-Free', 'Healthy'],
    description: 'A warm and comforting soup packed with vegetables and protein.',
    ingredients: [{ name: 'Brown lentils', amount: '1 cup' }, { name: 'Carrots', amount: '2' }, { name: 'Celery', amount: '2 stalks' }, { name: 'Vegetable broth', amount: '6 cups' }],
    instructions: ['Sauté vegetables.', 'Add lentils and broth.', 'Simmer until tender.', 'Season and serve.'],
    nutrition: { calories: 250, protein: 15, carbs: 45, fat: 2 }
  },
  {
    id: '9',
    title: 'California Roll Sushi',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    creator: { username: 'sushi_sensei', avatarUrl: 'https://i.pravatar.cc/150?u=sushi_sensei' },
    likes: 15000, comments: 1100, shares: 900, prepTime: '30 min', cookTime: '20 min', servings: 3,
    difficulty: 'Hard', category: 'Sushi', collections: [], tags: [],
    description: 'A classic sushi roll with crab, avocado, and cucumber.',
    ingredients: [{ name: 'Sushi rice', amount: '2 cups' }, { name: 'Nori sheets', amount: '4' }, { name: 'Imitation crab', amount: '8 oz' }, { name: 'Avocado', amount: '1' }],
    instructions: ['Cook sushi rice.', 'Prepare fillings.', 'Assemble and roll sushi.', 'Slice and serve.'],
    nutrition: { calories: 400, protein: 15, carbs: 60, fat: 10 }
  },
  {
    id: '10',
    title: 'Lemon Herb Roasted Chicken',
    imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'placeholder.mp4',
    creator: { username: 'chef_mario', avatarUrl: 'https://i.pravatar.cc/150?u=chef_mario' },
    likes: 11000, comments: 800, shares: 650, prepTime: '15 min', cookTime: '1 hr 15 min', servings: 4,
    difficulty: 'Medium', category: 'Roasts', collections: ['Healthy'], tags: ['High Protein', 'Gluten-Free'],
    description: 'A juicy and flavorful whole roasted chicken with lemon and herbs.',
    ingredients: [{ name: 'Whole chicken', amount: '4 lbs' }, { name: 'Lemon', amount: '2' }, { name: 'Rosemary', amount: '4 sprigs' }, { name: 'Thyme', amount: '4 sprigs' }],
    instructions: ['Prepare chicken.', 'Stuff with aromatics.', 'Roast until cooked through.', 'Rest and serve.'],
    nutrition: { calories: 800, protein: 70, carbs: 5, fat: 55 }
  }
];
