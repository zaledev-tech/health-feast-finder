import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import RecipeForm from "@/components/RecipeForm";
import RecipeDisplay from "@/components/RecipeDisplay";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  foodPreference: string;
  allergies: string[];
  age: string;
  gender: string;
  activityLevel: string;
  deficiencies: string[];
  cuisine: string;
  dietaryRestrictions: string;
}

// Mock recipe data for demo - replace with API integration
const mockRecipe = {
  title: "Mediterranean Quinoa Bowl",
  description: "A nutritious and colorful bowl packed with protein, healthy fats, and fresh vegetables",
  cookTime: "25 minutes",
  servings: 2,
  difficulty: "Easy",
  ingredients: [
    "1 cup quinoa",
    "2 cups vegetable broth",
    "1 cucumber, diced",
    "2 medium tomatoes, chopped",
    "1/2 red onion, thinly sliced",
    "1/4 cup kalamata olives",
    "1/4 cup feta cheese (optional)",
    "2 tbsp olive oil",
    "1 lemon, juiced",
    "2 tbsp fresh parsley, chopped",
    "1 tsp dried oregano",
    "Salt and pepper to taste"
  ],
  instructions: [
    "Rinse quinoa under cold water until water runs clear. In a medium saucepan, bring vegetable broth to a boil.",
    "Add quinoa, reduce heat to low, cover and simmer for 15 minutes until liquid is absorbed.",
    "Remove from heat and let stand 5 minutes. Fluff with a fork and let cool slightly.",
    "In a large bowl, combine cucumber, tomatoes, red onion, and olives.",
    "In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper.",
    "Add cooled quinoa to vegetables and toss with dressing.",
    "Garnish with feta cheese and fresh parsley. Serve immediately or chill for later."
  ],
  nutritionInfo: {
    calories: 385,
    protein: "12g",
    carbs: "58g",
    fat: "14g",
    fiber: "8g"
  },
  shoppingList: [
    "Quinoa (1 cup)",
    "Vegetable broth (2 cups)",
    "Cucumber (1 large)",
    "Tomatoes (2 medium)",
    "Red onion (1 small)",
    "Kalamata olives",
    "Feta cheese (optional)",
    "Extra virgin olive oil",
    "Fresh lemon",
    "Fresh parsley",
    "Dried oregano"
  ],
  youtubeLinks: [
    "https://youtube.com/watch?v=example1",
    "https://youtube.com/watch?v=example2"
  ],
  allergenWarnings: ["Contains dairy (feta cheese - optional)"]
};

type ViewState = 'hero' | 'form' | 'recipe';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewState>('hero');
  const [recipe, setRecipe] = useState(mockRecipe);
  const { toast } = useToast();

  const handleGetStarted = () => {
    setCurrentView('form');
  };

  const handleFormSubmit = (formData: FormData) => {
    // Here you would integrate with Spoonacular API and YouTube API
    toast({
      title: "Recipe Generated!",
      description: "Your personalized healthy recipe is ready.",
    });
    
    // For now, we'll use mock data
    // TODO: Replace with actual API integration
    setRecipe(mockRecipe);
    setCurrentView('recipe');
  };

  const handleNewRecipe = () => {
    setCurrentView('hero');
  };

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'hero' && (
        <HeroSection onGetStarted={handleGetStarted} />
      )}
      
      {currentView === 'form' && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Tell us about your preferences
              </h1>
              <p className="text-lg text-muted-foreground">
                We'll create a personalized healthy recipe just for you
              </p>
            </div>
            <RecipeForm onSubmit={handleFormSubmit} />
          </div>
        </div>
      )}
      
      {currentView === 'recipe' && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <RecipeDisplay recipe={recipe} onNewRecipe={handleNewRecipe} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
