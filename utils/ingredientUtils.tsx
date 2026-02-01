
import React from 'react';
import { Ingredient } from '../types';

import { CarrotIcon } from '../components/icons/CarrotIcon';
import { DrumstickIcon } from '../components/icons/DrumstickIcon';
import { WheatIcon } from '../components/icons/WheatIcon';
import { PackageIcon } from '../components/icons/PackageIcon';
import { CheeseIcon } from '../components/icons/CheeseIcon';
import { ShakerIcon } from '../components/icons/ShakerIcon';
import { BreadIcon } from '../components/icons/BreadIcon';
import { SnowflakeIcon } from '../components/icons/SnowflakeIcon';
import { BottleIcon } from '../components/icons/BottleIcon';


type Category = 'Produce' | 'Protein' | 'Dairy & Alternatives' | 'Pantry Staples' | 'Spices & Seasoning' | 'Bakery & Breads' | 'Frozen Foods' | 'Beverages' | 'Other';

const categoryKeywords: Record<Category, string[]> = {
  'Produce': ['tomato', 'spinach', 'garlic', 'cucumber', 'lemon', 'avocado', 'parsley', 'onion', 'cilantro', 'lime', 'carrots', 'celery', 'basil', 'rosemary', 'thyme', 'lettuce', 'potato', 'pepper', 'banana', 'berry', 'fruit', 'vegetable'],
  'Protein': ['chicken', 'shrimp', 'eggs', 'chickpeas', 'beef', 'steak', 'lentils', 'crab', 'fish', 'salmon', 'pork', 'meat', 'tofu'],
  'Dairy & Alternatives': ['cream', 'parmesan', 'feta', 'butter', 'yogurt', 'milk', 'cheese', 'mozzarella', 'cheddar'],
  'Pantry Staples': ['quinoa', 'pasta', 'linguine', 'oil', 'flour', 'sugar', 'chocolate', 'broth', 'tomatoes', 'sauce', 'rice', 'cereal', 'oats'],
  'Spices & Seasoning': ['flakes', 'salt', 'pepper', 'seasoning', 'cumin', 'paprika', 'cinnamon', 'vanilla', 'spice'],
  'Bakery & Breads': ['bread', 'tortillas', 'dough', 'bagel', 'bun', 'toast'],
  'Frozen Foods': ['ice cream', 'frozen'],
  'Beverages': ['wine', 'juice', 'water', 'soda', 'drink'],
  'Other': [],
};

const getCategory = (ingredientName: string): Category => {
  const name = ingredientName.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => name.includes(keyword))) {
      return category as Category;
    }
  }
  return 'Other';
};

export const categorizeIngredients = (ingredients: Ingredient[]): Record<string, Ingredient[]> => {
  return ingredients.reduce((acc, item) => {
    const category = getCategory(item.name);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, Ingredient[]>);
};

const categoryIcons: Record<Category, React.FC<React.SVGProps<SVGSVGElement>>> = {
  'Produce': CarrotIcon,
  'Protein': DrumstickIcon,
  'Dairy & Alternatives': CheeseIcon,
  'Pantry Staples': WheatIcon,
  'Spices & Seasoning': ShakerIcon,
  'Bakery & Breads': BreadIcon,
  'Frozen Foods': SnowflakeIcon,
  'Beverages': BottleIcon,
  'Other': PackageIcon,
};

export const getCategoryIcon = (category: string): React.FC<React.SVGProps<SVGSVGElement>> => {
    return categoryIcons[category as Category] || PackageIcon;
}

export const getIngredientIcon = (ingredientName: string): React.FC<React.SVGProps<SVGSVGElement>> => {
    const category = getCategory(ingredientName);
    return categoryIcons[category] || PackageIcon;
}
