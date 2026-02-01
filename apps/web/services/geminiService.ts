
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { DietaryPreference, Ingredient, MealPlan, Recipe, SmartSuggestion, SuggestedRecipe, Nutrition, HealthierVersion, DayPlan, NutritionGoals, RefinedShoppingListItem, AIShoppingListResult } from "../types";

const getAi = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = (error) => reject(error);
    });
};


export const getChatResponse = async (prompt: string, context: string = ''): Promise<string> => {
  try {
    const ai = getAi();
    const systemInstruction = `You are an expert chef and friendly kitchen assistant. 
    You have access to the user's kitchen data (pantry, nutrition log, saved recipes, etc.) provided in the context below. 
    Use this data to give highly personalized, helpful, and concise answers. 
    If the user asks about their pantry, nutrition, or plans, use the provided context.
    
    USER CONTEXT DATA:
    ${context}
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `User question: "${prompt}"`,
        config: {
            systemInstruction: systemInstruction
        }
    });
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error getting response from Gemini:", error);
    return "I'm sorry, I couldn't process your request.";
  }
};

export const getRecipesFromIngredients = async (ingredients: Ingredient[]): Promise<SuggestedRecipe[]> => {
    const ingredientList = ingredients.map(i => i.name).join(', ');
    const prompt = `I have the following ingredients in my pantry: ${ingredientList}. Please suggest 2-3 creative recipes I can make. For each recipe, provide a title, a short description, a list of main ingredients, and a list of instructions.`;

    try {
        const ai = getAi();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            recipeName: { type: Type.STRING },
                            description: { type: Type.STRING },
                            ingredients: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            instructions: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        });

        const jsonString = response.text || "[]";
        return JSON.parse(jsonString.trim()) as SuggestedRecipe[];

    } catch (error) {
        console.error("Error getting recipe suggestions:", error);
        return [];
    }
}

export const generateSmartShoppingList = async (dietType: string, days: number, notes?: string): Promise<AIShoppingListResult> => {
    const prompt = `
    Act as a professional nutritionist and chef. 
    Create a shopping list and basic meal plan for a user with these preferences:
    - Diet: ${dietType}
    - Duration: ${days} days
    - Notes: ${notes || 'None'}

    Output a structured object containing:
    1. A "mealPlan" array with "day" (string) and "meals" (array of strings).
    2. A "shoppingList" array of objects with "name" (string), "amount" (string), and "category" (string).
    `;

    try {
        const ai = getAi();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        mealPlan: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    day: { type: Type.STRING },
                                    meals: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ["day", "meals"]
                            }
                        },
                        shoppingList: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    amount: { type: Type.STRING },
                                    category: { type: Type.STRING }
                                },
                                required: ["name", "amount", "category"]
                            }
                        }
                    },
                    required: ["mealPlan", "shoppingList"]
                }
            }
        });

        const jsonString = response.text || "{}";
        const result = JSON.parse(jsonString.trim());
        
        return {
            mealPlan: result.mealPlan,
            shoppingList: result.shoppingList.map((item: any) => ({
                ...item,
                isAiGenerated: true
            }))
        };
    } catch (error) {
        console.error("Error generating smart shopping list:", error);
        throw new Error("AI Generation failed.");
    }
}

export const getMealPlan = async (
    days: number, 
    preferences: Set<DietaryPreference>, 
    customPrompt: string, 
    includeRecipes: Recipe[], 
    nutritionGoals: NutritionGoals
): Promise<MealPlan> => {
    const preferencesList = Array.from(preferences).join(', ');
    
    // STRICT System Instruction to enforce structure and math
    const prompt = `
    You are a precision nutrition engine. Create a ${days}-day meal plan.
    
    CRITICAL RULES:
    1. Return a JSON Array of ${days} Daily Objects.
    2. For 'dailyNutrition', you MUST SUM the calories/macros of all meals for that day. Provide NUMBERS only.
    3. For EVERY meal (Breakfast, Lunch, Dinner, Snack), you MUST provide:
       - Specific numeric values for calories, protein, carbs, fat.
       - A list of ingredients required.
       - Brief instructions (1-3 steps).
    4. Adhere to targets: ~${nutritionGoals.calories} kcal, ~${nutritionGoals.protein}g protein.
    ${preferencesList ? `5. Constraints: ${preferencesList}` : ''}
    ${customPrompt ? `6. User Note: "${customPrompt}"` : ''}
    `;
    
    const recipeSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            prepTime: { type: Type.STRING },
            cookTime: { type: Type.STRING },
            servings: { type: Type.NUMBER },
            difficulty: { type: Type.STRING },
            ingredients: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { amount: { type: Type.STRING }, name: { type: Type.STRING } },
                    required: ["amount", "name"]
                }
            },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            nutrition: {
                type: Type.OBJECT,
                properties: {
                    calories: { type: Type.NUMBER }, protein: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER }
                },
                required: ["calories", "protein", "carbs", "fat"]
            }
        },
        required: ["title", "description", "ingredients", "instructions", "nutrition"]
    };

    try {
        const ai = getAi();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Stronger model for math/logic
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            day: { type: Type.STRING },
                            meals: {
                                type: Type.OBJECT,
                                properties: {
                                    breakfast: recipeSchema,
                                    lunch: recipeSchema,
                                    dinner: recipeSchema,
                                    snacks: recipeSchema,
                                },
                                required: ["breakfast", "lunch", "dinner", "snacks"]
                            },
                            dailyNutrition: {
                                type: Type.OBJECT,
                                properties: {
                                    calories: { type: Type.NUMBER }, protein: { type: Type.NUMBER },
                                    carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER }
                                },
                                required: ["calories", "protein", "carbs", "fat"]
                            }
                        },
                        required: ["day", "meals", "dailyNutrition"]
                    }
                }
            }
        });
        const jsonString = response.text || "[]";
        
        let rawPlanArray;
        try {
            rawPlanArray = JSON.parse(jsonString.trim());
        } catch (e) {
            console.error("JSON Parse Error:", e);
            throw new Error("Failed to parse AI response");
        }

        if (!Array.isArray(rawPlanArray)) {
            throw new Error("Invalid format: Expected array");
        }

        // Defensive Mapping with Safe Defaults for Math
        return rawPlanArray.map((dayData: any) => {
            const meals = dayData?.meals || {};
            const nutrition = dayData?.dailyNutrition || {};

            const safeMeal = (mealData: any, defaultTitle: string) => ({
                id: Math.random().toString(),
                creator: { username: 'Chef AI', avatarUrl: '' },
                likes: 0,
                comments: 0,
                shares: 0,
                imageUrl: '',
                title: mealData?.title || defaultTitle,
                description: mealData?.description || 'Delicious meal.',
                prepTime: mealData?.prepTime || '5 min',
                cookTime: mealData?.cookTime || '15 min',
                servings: mealData?.servings || 1,
                difficulty: mealData?.difficulty || 'Easy',
                ingredients: Array.isArray(mealData?.ingredients) ? mealData.ingredients : [],
                instructions: Array.isArray(mealData?.instructions) ? mealData.instructions : [],
                nutrition: {
                    calories: Number(mealData?.nutrition?.calories) || 0,
                    protein: Number(mealData?.nutrition?.protein) || 0,
                    carbs: Number(mealData?.nutrition?.carbs) || 0,
                    fat: Number(mealData?.nutrition?.fat) || 0,
                }
            });

            return {
                day: dayData?.day || 'Day X',
                meals: {
                    breakfast: safeMeal(meals.breakfast, 'Breakfast'),
                    lunch: safeMeal(meals.lunch, 'Lunch'),
                    dinner: safeMeal(meals.dinner, 'Dinner'),
                    snacks: safeMeal(meals.snacks, 'Snack'),
                },
                dailyNutrition: {
                    calories: Number(nutrition.calories) || 0,
                    protein: Number(nutrition.protein) || 0,
                    carbs: Number(nutrition.carbs) || 0,
                    fat: Number(nutrition.fat) || 0
                }
            };
        }) as MealPlan;

    } catch(error) {
        console.error("Error generating meal plan:", error);
        throw new Error("Failed to generate plan.");
    }
};

export const getSmartSuggestions = async (savedRecipes: Recipe[], preferences: Set<DietaryPreference>): Promise<SmartSuggestion[]> => {
    const savedTitles = savedRecipes.map(r => r.title).join(', ');
    const prompt = `Suggest 3 new recipes based on my likes: "${savedTitles}".`;

    try {
        const ai = getAi();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            recipeName: { type: Type.STRING },
                            description: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        const jsonString = response.text || "[]";
        return JSON.parse(jsonString.trim()) as SmartSuggestion[];
    } catch (error) {
        console.error("Error getting smart suggestions:", error);
        return [];
    }
};

export const getSmartSwaps = async (query: string): Promise<string> => {
    const prompt = `As a kitchen expert, provide a helpful and clear answer for: "${query}".`;
    try {
        const ai = getAi();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "I'm sorry, I couldn't find a swap.";
    } catch (error) {
        return "Sorry, I couldn't process your request.";
    }
};

export const getNutritionInfo = async (query: string): Promise<Nutrition & { foodName: string }> => {
    try {
        const ai = getAi();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze: "${query}"`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        foodName: { type: Type.STRING },
                        calories: { type: Type.NUMBER },
                        protein: { type: Type.NUMBER },
                        carbs: { type: Type.NUMBER },
                        fat: { type: Type.NUMBER },
                    }
                }
            }
        });
        const jsonString = response.text || "{}";
        return JSON.parse(jsonString.trim()) as Nutrition & { foodName: string };
    } catch (error) {
        throw new Error("Analysis failed.");
    }
}

export const parseRecipeFromImage = async (base64Image: string): Promise<Partial<Recipe>> => {
    try {
        const ai = getAi();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { text: "Extract recipe data as JSON." },
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
                ]
            }
        });
        const jsonString = response.text || "{}";
        return JSON.parse(jsonString.trim()) as Partial<Recipe>;
    } catch (error) {
        throw new Error("OCR failed.");
    }
};

export const parseItemsFromReceipt = async (base64Image: string): Promise<Ingredient[]> => {
    try {
        const ai = getAi();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { text: "Extract ingredients as JSON array." },
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
                ]
            }
        });
        const jsonString = response.text || "[]";
        return JSON.parse(jsonString.trim()) as Ingredient[];
    } catch (error) {
        throw new Error("Receipt scan failed.");
    }
};

export const parseItemsFromFridge = async (base64Image: string): Promise<Ingredient[]> => {
    try {
        const ai = getAi();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { text: "Identify food items in image as JSON array." },
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
                ]
            }
        });
        const jsonString = response.text || "[]";
        return JSON.parse(jsonString.trim()) as Ingredient[];
    } catch (error) {
        throw new Error("Fridge scan failed.");
    }
};

export const parseRecipeFromVideo = async (videoFile: File): Promise<Partial<Recipe>> => {
    try {
        const ai = getAi();
        const videoBase64 = await fileToBase64(videoFile);
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { text: "Analyze video for recipe data." },
                    { inlineData: { mimeType: videoFile.type, data: videoBase64 } }
                ]
            }
        });
        const jsonString = response.text || "{}";
        return JSON.parse(jsonString.trim()) as Partial<Recipe>;
    } catch (error) {
        throw new Error("Video analysis failed.");
    }
};

export const scaleRecipeIngredients = async (ingredients: Ingredient[], originalServings: number, newServings: number): Promise<Ingredient[]> => {
    try {
        const ai = getAi();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Scale recipe from ${originalServings} to ${newServings} servings.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { name: { type: Type.STRING }, amount: { type: Type.STRING } }
                    }
                }
            }
        });
        const jsonString = response.text || "[]";
        return JSON.parse(jsonString.trim()) as Ingredient[];
    } catch (error) {
        return ingredients;
    }
};

export const getIngredientSubstitutes = async (ingredientName: string, recipeContext: string): Promise<string[]> => {
    try {
        const ai = getAi();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Substitutes for ${ingredientName} in ${recipeContext} as JSON string array.`,
        });
        const jsonString = response.text || "[]";
        return JSON.parse(jsonString.trim()) as string[];
    } catch (error) {
        return [];
    }
};

export const makeRecipeHealthier = async (recipe: Recipe): Promise<HealthierVersion> => {
    try {
        const ai = getAi();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Make this recipe healthier: "${recipe.title}". Return JSON.`,
        });
        const jsonString = response.text || "{}";
        return JSON.parse(jsonString.trim()) as HealthierVersion;
    } catch (error) {
        throw new Error("Healthier version generation failed.");
    }
};

export const refineShoppingList = async (ingredients: Ingredient[]): Promise<RefinedShoppingListItem[]> => {
    try {
        const ai = getAi();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Consolidate this list: ${JSON.stringify(ingredients)}. Return JSON array.`,
        });
        const jsonString = response.text || "[]";
        return JSON.parse(jsonString.trim()) as RefinedShoppingListItem[];
    } catch (error) {
        throw new Error("Refinement failed.");
    }
};
