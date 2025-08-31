import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, ChefHat, ShoppingCart, Youtube, Utensils, AlertTriangle } from "lucide-react";

interface Recipe {
  title: string;
  description: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  nutritionInfo: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
  };
  shoppingList: string[];
  youtubeLinks: string[];
  allergenWarnings: string[];
}

interface RecipeDisplayProps {
  recipe: Recipe;
  onNewRecipe: () => void;
}

export default function RecipeDisplay({ recipe, onNewRecipe }: RecipeDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Recipe Header */}
      <Card className="shadow-soft bg-gradient-hero text-primary-foreground">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold mb-2">{recipe.title}</CardTitle>
              <p className="text-primary-foreground/90 text-lg">{recipe.description}</p>
            </div>
            <Button variant="outline" onClick={onNewRecipe} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              New Recipe
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{recipe.cookTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{recipe.servings} servings</span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              <span>{recipe.difficulty}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Allergen Warnings */}
      {recipe.allergenWarnings.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Allergen Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recipe.allergenWarnings.map((allergen, index) => (
                <Badge key={index} variant="outline" className="border-warning text-warning">
                  {allergen}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Recipe Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ingredients */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                Ingredients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-secondary" />
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <p className="pt-1">{instruction}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* YouTube Videos */}
          {recipe.youtubeLinks.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Youtube className="h-5 w-5 text-red-500" />
                  Video Tutorials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recipe.youtubeLinks.map((link, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => window.open(link, '_blank')}
                    >
                      <Youtube className="h-4 w-4 text-red-500" />
                      Tutorial {index + 1}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Nutrition Info */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-center">Nutrition Facts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{recipe.nutritionInfo.calories}</div>
                <div className="text-sm text-muted-foreground">calories per serving</div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Protein</span>
                  <span className="font-semibold">{recipe.nutritionInfo.protein}</span>
                </div>
                <div className="flex justify-between">
                  <span>Carbs</span>
                  <span className="font-semibold">{recipe.nutritionInfo.carbs}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fat</span>
                  <span className="font-semibold">{recipe.nutritionInfo.fat}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fiber</span>
                  <span className="font-semibold">{recipe.nutritionInfo.fiber}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shopping List */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-secondary" />
                Shopping List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recipe.shoppingList.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="rounded border-border"
                      id={`shopping-${index}`}
                    />
                    <label htmlFor={`shopping-${index}`} className="text-sm cursor-pointer">
                      {item}
                    </label>
                  </li>
                ))}
              </ul>
              <Button variant="warm" size="sm" className="w-full mt-4">
                Export Shopping List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}