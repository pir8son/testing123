
import React from 'react';
import { PizzaIcon } from '../components/icons/PizzaIcon';
import { SoupIcon } from '../components/icons/SoupIcon';
import { SaladIcon } from '../components/icons/SaladIcon';
import { PastaIcon } from '../components/icons/PastaIcon';
import { DessertIcon } from '../components/icons/DessertIcon';
import { SushiIcon } from '../components/icons/SushiIcon';
import { BreakfastIcon } from '../components/icons/BreakfastIcon';
import { RoastIcon } from '../components/icons/RoastIcon';
import { CakeSliceIcon } from '../components/icons/CakeSliceIcon';
import { GlassWaterIcon } from '../components/icons/GlassWaterIcon';
import { PackageIcon } from '../components/icons/PackageIcon';
import { CarrotIcon } from '../components/icons/CarrotIcon';
import { DrumstickIcon } from '../components/icons/DrumstickIcon';
import { WheatIcon } from '../components/icons/WheatIcon';
import { CheeseIcon } from '../components/icons/CheeseIcon';
import { BreadIcon } from '../components/icons/BreadIcon';
import { SnowflakeIcon } from '../components/icons/SnowflakeIcon';
import { BottleIcon } from '../components/icons/BottleIcon';

export interface CategoryItem {
  id: string;
  name: string;
  icon: string; // Material Community Icon name mapping
}

export const RECIPE_CATEGORIES: CategoryItem[] = [
  // Meals
  { id: 'breakfast', name: 'Breakfast', icon: 'egg-fried' },
  { id: 'lunch', name: 'Lunch', icon: 'food-takeout-box' },
  { id: 'dinner', name: 'Dinner', icon: 'food-drumstick' },
  { id: 'snacks', name: 'Snacks', icon: 'cookie' },
  { id: 'appetizers', name: 'Appetizers', icon: 'cheese' },
  
  // Dietary
  { id: 'healthy', name: 'Healthy', icon: 'leaf' },
  { id: 'vegan', name: 'Vegan', icon: 'sprout' },
  { id: 'vegetarian', name: 'Vegetarian', icon: 'carrot' },
  { id: 'gluten-free', name: 'Gluten-Free', icon: 'barley-off' },
  { id: 'keto', name: 'Keto', icon: 'food-steak' },

  // Cuisine/Type
  { id: 'pasta', name: 'Pasta', icon: 'pasta' },
  { id: 'pizza', name: 'Pizza', icon: 'pizza' },
  { id: 'seafood', name: 'Seafood', icon: 'fish' },
  { id: 'chicken', name: 'Chicken', icon: 'food-drumstick' },
  { id: 'salads', name: 'Salads', icon: 'leaf-maple' },
  { id: 'soups', name: 'Soups', icon: 'pot-steam' },
  { id: 'sandwiches', name: 'Sandwiches', icon: 'bread-slice' },
  { id: 'bowls', name: 'Bowls', icon: 'bowl' },

  // Baking/Sweet
  { id: 'desserts', name: 'Desserts', icon: 'ice-cream' },
  { id: 'baking', name: 'Baking', icon: 'muffin' },
  { id: 'breads', name: 'Breads', icon: 'bread-slice' },
  { id: 'cakes', name: 'Cakes', icon: 'cake-variant' },

  // Drinks
  { id: 'smoothies', name: 'Smoothies', icon: 'blender' },
  { id: 'cocktails', name: 'Cocktails', icon: 'glass-cocktail' },
  { id: 'coffee', name: 'Coffee', icon: 'coffee' }
];

export const getCategoryIconComponent = (iconName: string): React.ReactNode => {
  const props = { className: "w-8 h-8" };
  
  // Map requested Icon Names to our Local SVG Components
  switch (iconName) {
    // Meals
    case 'egg-fried': return React.createElement(BreakfastIcon, props);
    case 'food-takeout-box': return React.createElement(PackageIcon, props);
    case 'food-drumstick': return React.createElement(DrumstickIcon, props);
    case 'cookie': return React.createElement(DessertIcon, props); // Fallback
    case 'cheese': return React.createElement(CheeseIcon, props);

    // Dietary
    case 'leaf': return React.createElement(SaladIcon, props);
    case 'sprout': return React.createElement(CarrotIcon, props);
    case 'carrot': return React.createElement(CarrotIcon, props);
    case 'barley-off': return React.createElement(WheatIcon, props);
    case 'food-steak': return React.createElement(RoastIcon, props);

    // Cuisine
    case 'pasta': return React.createElement(PastaIcon, props);
    case 'pizza': return React.createElement(PizzaIcon, props);
    case 'fish': return React.createElement(SushiIcon, props);
    case 'leaf-maple': return React.createElement(SaladIcon, props);
    case 'pot-steam': return React.createElement(SoupIcon, props);
    case 'bread-slice': return React.createElement(BreadIcon, props);
    case 'bowl': return React.createElement(SaladIcon, props);

    // Baking
    case 'ice-cream': return React.createElement(DessertIcon, props);
    case 'muffin': return React.createElement(CakeSliceIcon, props);
    case 'cake-variant': return React.createElement(CakeSliceIcon, props);

    // Drinks
    case 'blender': return React.createElement(BottleIcon, props);
    case 'glass-cocktail': return React.createElement(GlassWaterIcon, props);
    case 'coffee': return React.createElement(GlassWaterIcon, props);

    // Fallback
    default: return React.createElement(PackageIcon, props);
  }
};
