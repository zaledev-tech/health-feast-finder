import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ChefHat, User, AlertTriangle, Utensils, Globe } from "lucide-react";

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

const commonAllergies = [
  "Nuts", "Dairy", "Gluten", "Eggs", "Shellfish", "Soy", "Fish"
];

const nutritionalDeficiencies = [
  "Iron", "Vitamin D", "Vitamin B12", "Calcium", "Magnesium", "Zinc", "Vitamin C"
];

const cuisineTypes = [
  "Italian", "Indian", "Chinese", "Mexican", "Mediterranean", "Japanese", "Thai", "American", "French", "Greek"
];

interface RecipeFormProps {
  onSubmit: (data: FormData) => void;
}

export default function RecipeForm({ onSubmit }: RecipeFormProps) {
  const [formData, setFormData] = useState<FormData>({
    foodPreference: "",
    allergies: [],
    age: "",
    gender: "",
    activityLevel: "",
    deficiencies: [],
    cuisine: "",
    dietaryRestrictions: ""
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.foodPreference.trim()) {
      newErrors.foodPreference = "Food preference is required";
    }
    if (!formData.age.trim()) {
      newErrors.age = "Age is required";
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }
    if (!formData.activityLevel) {
      newErrors.activityLevel = "Activity level is required";
    }
    if (!formData.cuisine) {
      newErrors.cuisine = "Cuisine preference is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleAllergyChange = (allergy: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      allergies: checked 
        ? [...prev.allergies, allergy]
        : prev.allergies.filter(a => a !== allergy)
    }));
  };

  const handleDeficiencyChange = (deficiency: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      deficiencies: checked 
        ? [...prev.deficiencies, deficiency]
        : prev.deficiencies.filter(d => d !== deficiency)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Food Preferences */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" />
            Food Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="foodPreference">What type of food are you craving?</Label>
            <Input
              id="foodPreference"
              placeholder="e.g., pasta, salad, soup, chicken..."
              value={formData.foodPreference}
              onChange={(e) => setFormData(prev => ({ ...prev, foodPreference: e.target.value }))}
              className={errors.foodPreference ? "border-destructive" : ""}
            />
            {errors.foodPreference && (
              <p className="text-sm text-destructive mt-1">{errors.foodPreference}</p>
            )}
          </div>

          <div>
            <Label htmlFor="cuisine">Cuisine Preference</Label>
            <Select 
              value={formData.cuisine} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, cuisine: value }))}
            >
              <SelectTrigger className={errors.cuisine ? "border-destructive" : ""}>
                <SelectValue placeholder="Select your preferred cuisine" />
              </SelectTrigger>
              <SelectContent>
                {cuisineTypes.map(cuisine => (
                  <SelectItem key={cuisine} value={cuisine.toLowerCase()}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cuisine && (
              <p className="text-sm text-destructive mt-1">{errors.cuisine}</p>
            )}
          </div>

          <div>
            <Label>Dietary Restrictions (Optional)</Label>
            <Textarea
              placeholder="e.g., vegetarian, vegan, keto, low-carb..."
              value={formData.dietaryRestrictions}
              onChange={(e) => setFormData(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Allergies & Restrictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {commonAllergies.map(allergy => (
              <div key={allergy} className="flex items-center space-x-2">
                <Checkbox
                  id={allergy}
                  checked={formData.allergies.includes(allergy)}
                  onCheckedChange={(checked) => handleAllergyChange(allergy, !!checked)}
                />
                <Label htmlFor={allergy} className="text-sm">{allergy}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-secondary" />
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className={errors.age ? "border-destructive" : ""}
              />
              {errors.age && (
                <p className="text-sm text-destructive mt-1">{errors.age}</p>
              )}
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger className={errors.gender ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-destructive mt-1">{errors.gender}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="activityLevel">Activity Level</Label>
            <Select 
              value={formData.activityLevel} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, activityLevel: value }))}
            >
              <SelectTrigger className={errors.activityLevel ? "border-destructive" : ""}>
                <SelectValue placeholder="Select your activity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                <SelectItem value="active">Active (heavy exercise 6-7 days/week)</SelectItem>
                <SelectItem value="very-active">Very Active (very heavy exercise, physical job)</SelectItem>
              </SelectContent>
            </Select>
            {errors.activityLevel && (
              <p className="text-sm text-destructive mt-1">{errors.activityLevel}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Nutritional Deficiencies */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-success" />
            Nutritional Focus (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {nutritionalDeficiencies.map(deficiency => (
              <div key={deficiency} className="flex items-center space-x-2">
                <Checkbox
                  id={deficiency}
                  checked={formData.deficiencies.includes(deficiency)}
                  onCheckedChange={(checked) => handleDeficiencyChange(deficiency, !!checked)}
                />
                <Label htmlFor={deficiency} className="text-sm">{deficiency}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" variant="hero" size="lg" className="w-full">
        Generate My Healthy Recipe
      </Button>
    </form>
  );
}