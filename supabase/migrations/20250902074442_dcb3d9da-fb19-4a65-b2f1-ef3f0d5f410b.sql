-- Add missing columns to recipes table to support AI-generated recipe data
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS nutrition_info JSONB,
ADD COLUMN IF NOT EXISTS shopping_list TEXT[],
ADD COLUMN IF NOT EXISTS allergen_warnings TEXT[],
ADD COLUMN IF NOT EXISTS cuisine_type TEXT,
ADD COLUMN IF NOT EXISTS dietary_preferences JSONB;

-- Update the cook_time field in the edge function, but the column is already integer
-- No changes needed for existing cook_time column