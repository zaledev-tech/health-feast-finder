-- Create allergies reference table
CREATE TABLE public.allergies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  severity_level TEXT CHECK (severity_level IN ('mild', 'moderate', 'severe')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deficiencies reference table  
CREATE TABLE public.deficiencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  recommended_daily_amount TEXT,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ingredients table
CREATE TABLE public.ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  nutrition_per_100g JSONB, -- stores nutrition facts
  common_allergens TEXT[], -- array of common allergens
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_allergies junction table
CREATE TABLE public.user_allergies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  allergy_id UUID NOT NULL REFERENCES public.allergies(id) ON DELETE CASCADE,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, allergy_id)
);

-- Create user_deficiencies junction table
CREATE TABLE public.user_deficiencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deficiency_id UUID NOT NULL REFERENCES public.deficiencies(id) ON DELETE CASCADE,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  diagnosed_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, deficiency_id)
);

-- Create recipe_ingredients junction table
CREATE TABLE public.recipe_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2),
  unit TEXT,
  preparation_notes TEXT,
  is_optional BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(recipe_id, ingredient_id)
);

-- Create shopping_lists table
CREATE TABLE public.shopping_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shopping_list_items table
CREATE TABLE public.shopping_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE CASCADE,
  custom_item_name TEXT, -- for items not in ingredients table
  quantity DECIMAL(10,2),
  unit TEXT,
  is_purchased BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_item_name CHECK (
    (ingredient_id IS NOT NULL AND custom_item_name IS NULL) OR 
    (ingredient_id IS NULL AND custom_item_name IS NOT NULL)
  )
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deficiencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_deficiencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for allergies (public read, admin write)
CREATE POLICY "Anyone can view allergies" ON public.allergies FOR SELECT USING (true);

-- RLS Policies for deficiencies (public read, admin write)  
CREATE POLICY "Anyone can view deficiencies" ON public.deficiencies FOR SELECT USING (true);

-- RLS Policies for ingredients (public read, admin write)
CREATE POLICY "Anyone can view ingredients" ON public.ingredients FOR SELECT USING (true);

-- RLS Policies for user_allergies (users can manage their own)
CREATE POLICY "Users can view their own allergies" ON public.user_allergies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own allergies" ON public.user_allergies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own allergies" ON public.user_allergies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own allergies" ON public.user_allergies FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_deficiencies (users can manage their own)
CREATE POLICY "Users can view their own deficiencies" ON public.user_deficiencies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own deficiencies" ON public.user_deficiencies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own deficiencies" ON public.user_deficiencies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own deficiencies" ON public.user_deficiencies FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for recipe_ingredients (view all, insert for recipe owners)
CREATE POLICY "Anyone can view recipe ingredients" ON public.recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Recipe owners can manage ingredients" ON public.recipe_ingredients FOR ALL USING (
  EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid())
);

-- RLS Policies for shopping_lists (users can manage their own)
CREATE POLICY "Users can view their own shopping lists" ON public.shopping_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own shopping lists" ON public.shopping_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shopping lists" ON public.shopping_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shopping lists" ON public.shopping_lists FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for shopping_list_items (users can manage items in their lists)
CREATE POLICY "Users can view their own shopping list items" ON public.shopping_list_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.shopping_lists WHERE id = shopping_list_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage their own shopping list items" ON public.shopping_list_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.shopping_lists WHERE id = shopping_list_id AND user_id = auth.uid())
);

-- RLS Policies for favorites (users can manage their own)
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own favorites" ON public.favorites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some common allergies
INSERT INTO public.allergies (name, description, severity_level) VALUES
('Peanuts', 'Tree nuts and peanut allergy', 'severe'),
('Tree Nuts', 'Almonds, walnuts, cashews, etc.', 'severe'),
('Shellfish', 'Shrimp, crab, lobster, etc.', 'severe'),
('Fish', 'All types of fish', 'moderate'),
('Eggs', 'Chicken eggs and egg products', 'moderate'),
('Dairy', 'Milk and dairy products', 'moderate'),
('Soy', 'Soybeans and soy products', 'mild'),
('Wheat', 'Wheat and gluten-containing grains', 'moderate'),
('Sesame', 'Sesame seeds and tahini', 'moderate');

-- Insert some common deficiencies
INSERT INTO public.deficiencies (name, description, recommended_daily_amount, unit) VALUES
('Iron', 'Essential for oxygen transport', '18', 'mg'),
('Vitamin D', 'Important for bone health', '600', 'IU'),
('Vitamin B12', 'Essential for nerve function', '2.4', 'mcg'),
('Calcium', 'Important for bones and teeth', '1000', 'mg'),
('Magnesium', 'Important for muscle function', '400', 'mg'),
('Zinc', 'Essential for immune function', '11', 'mg'),
('Folate', 'Important for cell division', '400', 'mcg'),
('Omega-3', 'Essential fatty acids', '1.6', 'g');

-- Insert some common ingredients
INSERT INTO public.ingredients (name, category, common_allergens) VALUES
('Chicken Breast', 'Protein', '{}'),
('Salmon', 'Protein', '{"fish"}'),
('Eggs', 'Protein', '{"eggs"}'),
('Almonds', 'Nuts', '{"tree nuts"}'),
('Spinach', 'Vegetables', '{}'),
('Broccoli', 'Vegetables', '{}'),
('Quinoa', 'Grains', '{}'),
('Brown Rice', 'Grains', '{}'),
('Greek Yogurt', 'Dairy', '{"dairy"}'),
('Olive Oil', 'Fats', '{}');