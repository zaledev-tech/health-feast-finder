import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecipeRequest {
  foodPreference: string;
  allergies: string[];
  deficiencies: string[];
  age: string;
  gender: string;
  activityLevel: string;
  cuisine: string;
  dietaryRestrictions: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get the current user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const requestData: RecipeRequest = await req.json();
    console.log('Recipe generation request:', requestData);

    // Create the AI prompt based on user preferences
    const systemPrompt = `You are a professional nutritionist and chef. Generate a healthy recipe based on the user's preferences and requirements. You must return a valid JSON response with the exact structure specified.

    User Requirements:
    - Food Preference: ${requestData.foodPreference}
    - Allergies to avoid: ${requestData.allergies.join(', ') || 'None'}
    - Nutritional deficiencies to address: ${requestData.deficiencies.join(', ') || 'None'}
    - Age: ${requestData.age}
    - Gender: ${requestData.gender}
    - Activity Level: ${requestData.activityLevel}
    - Preferred Cuisine: ${requestData.cuisine}
    - Dietary Restrictions: ${requestData.dietaryRestrictions || 'None'}

    CRITICAL: Ensure the recipe:
    1. NEVER includes any ingredients the user is allergic to
    2. Focuses on nutrients that help with their deficiencies
    3. Matches their dietary preferences and restrictions
    4. Is appropriate for their age, gender, and activity level
    5. Follows the specified cuisine style

    Return ONLY a valid JSON object with this exact structure:`;

    const userPrompt = `Generate a healthy recipe that addresses my nutritional needs. Make sure to:
    - Avoid all my allergens completely
    - Include ingredients rich in nutrients I'm deficient in
    - Match my dietary preferences
    - Be suitable for my activity level and demographics

    Return the response as a valid JSON object with this structure:
    {
      "title": "Recipe Name",
      "description": "Brief description",
      "cookTime": "X minutes",
      "servings": 2,
      "difficulty": "Easy|Medium|Hard",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": ["step 1", "step 2"],
      "nutritionInfo": {
        "calories": 400,
        "protein": "25g",
        "carbs": "45g",
        "fat": "12g",
        "fiber": "8g"
      },
      "shoppingList": ["item 1", "item 2"],
      "allergenWarnings": ["warning if any"],
      "nutritionalBenefits": ["benefit 1", "benefit 2"]
    }`;

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('OpenAI response:', aiResponse);

    const aiContent = aiResponse.choices[0].message.content;
    
    // Parse the JSON response from AI
    let recipe;
    try {
      recipe = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Invalid JSON response from AI');
    }

    // Save the recipe to the database
    const { data: savedRecipe, error: saveError } = await supabaseClient
      .from('recipes')
      .insert({
        user_id: user.id,
        title: recipe.title,
        description: recipe.description,
        cook_time: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        nutrition_info: recipe.nutritionInfo,
        shopping_list: recipe.shoppingList,
        allergen_warnings: recipe.allergenWarnings || [],
        cuisine_type: requestData.cuisine,
        dietary_preferences: {
          foodPreference: requestData.foodPreference,
          allergies: requestData.allergies,
          deficiencies: requestData.deficiencies,
          dietaryRestrictions: requestData.dietaryRestrictions
        }
      })
      .select()
      .single();

    if (saveError) {
      console.error('Database save error:', saveError);
      throw new Error(`Failed to save recipe: ${saveError.message}`);
    }

    console.log('Recipe saved successfully:', savedRecipe.id);

    // Return the generated recipe with database ID
    return new Response(JSON.stringify({
      ...recipe,
      id: savedRecipe.id,
      nutritionalBenefits: recipe.nutritionalBenefits || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-recipe function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate recipe', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});