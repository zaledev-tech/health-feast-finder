import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Allergy {
  id: string;
  name: string;
  description: string | null;
  severity_level: 'mild' | 'moderate' | 'severe' | null;
}

export interface Deficiency {
  id: string;
  name: string;
  description: string | null;
  recommended_daily_amount: string | null;
  unit: string | null;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string | null;
  nutrition_per_100g: any;
  common_allergens: string[];
}

export const useReferenceData = () => {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [deficiencies, setDeficiencies] = useState<Deficiency[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllergies = async () => {
    try {
      const { data, error } = await supabase
        .from('allergies')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching allergies:', error);
        setError('Failed to load allergies');
        return;
      }

      const transformedData = data?.map(item => ({
        ...item,
        severity_level: item.severity_level as 'mild' | 'moderate' | 'severe' | null
      })) || [];
      
      setAllergies(transformedData);
    } catch (err) {
      console.error('Error fetching allergies:', err);
      setError('Failed to load allergies');
    }
  };

  const fetchDeficiencies = async () => {
    try {
      const { data, error } = await supabase
        .from('deficiencies')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching deficiencies:', error);
        setError('Failed to load deficiencies');
        return;
      }

      setDeficiencies(data || []);
    } catch (err) {
      console.error('Error fetching deficiencies:', err);
      setError('Failed to load deficiencies');
    }
  };

  const fetchIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching ingredients:', error);
        setError('Failed to load ingredients');
        return;
      }

      setIngredients(data || []);
    } catch (err) {
      console.error('Error fetching ingredients:', err);
      setError('Failed to load ingredients');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchAllergies(),
        fetchDeficiencies(),
        fetchIngredients()
      ]);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  return {
    allergies,
    deficiencies,
    ingredients,
    loading,
    error,
    refetch: () => {
      fetchAllergies();
      fetchDeficiencies();
      fetchIngredients();
    },
  };
};