import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserAllergy {
  id: string;
  user_id: string;
  allergy_id: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string | null;
  allergy: {
    id: string;
    name: string;
    description: string | null;
  };
}

export interface UserDeficiency {
  id: string;
  user_id: string;
  deficiency_id: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string | null;
  deficiency: {
    id: string;
    name: string;
    description: string | null;
    recommended_daily_amount: string | null;
    unit: string | null;
  };
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userAllergies, setUserAllergies] = useState<UserAllergy[]>([]);
  const [userDeficiencies, setUserDeficiencies] = useState<UserDeficiency[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch profile data
  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Fetch user allergies
  const fetchUserAllergies = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_allergies')
        .select(`
          id,
          user_id,
          allergy_id,
          severity,
          notes,
          allergies:allergy_id (
            id,
            name,
            description
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user allergies:', error);
        return;
      }

      const transformedData = data?.map(item => ({
        ...item,
        severity: item.severity as 'mild' | 'moderate' | 'severe',
        allergy: item.allergies
      })) || [];

      setUserAllergies(transformedData);
    } catch (error) {
      console.error('Error fetching user allergies:', error);
    }
  };

  // Fetch user deficiencies
  const fetchUserDeficiencies = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_deficiencies')
        .select(`
          id,
          user_id,
          deficiency_id,
          severity,
          notes,
          deficiencies:deficiency_id (
            id,
            name,
            description,
            recommended_daily_amount,
            unit
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user deficiencies:', error);
        return;
      }

      const transformedData = data?.map(item => ({
        ...item,
        severity: item.severity as 'mild' | 'moderate' | 'severe',
        deficiency: item.deficiencies
      })) || [];

      setUserDeficiencies(transformedData);
    } catch (error) {
      console.error('Error fetching user deficiencies:', error);
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...updates,
        });

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to update profile',
          variant: 'destructive',
        });
        return false;
      }

      await fetchProfile();
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  // Add user allergy
  const addUserAllergy = async (allergyId: string, severity: string, notes?: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_allergies')
        .insert({
          user_id: user.id,
          allergy_id: allergyId,
          severity,
          notes,
        });

      if (error) {
        console.error('Error adding allergy:', error);
        toast({
          title: 'Error',
          description: 'Failed to add allergy',
          variant: 'destructive',
        });
        return false;
      }

      await fetchUserAllergies();
      return true;
    } catch (error) {
      console.error('Error adding allergy:', error);
      return false;
    }
  };

  // Remove user allergy
  const removeUserAllergy = async (userAllergyId: string) => {
    try {
      const { error } = await supabase
        .from('user_allergies')
        .delete()
        .eq('id', userAllergyId);

      if (error) {
        console.error('Error removing allergy:', error);
        return false;
      }

      await fetchUserAllergies();
      return true;
    } catch (error) {
      console.error('Error removing allergy:', error);
      return false;
    }
  };

  // Add user deficiency
  const addUserDeficiency = async (deficiencyId: string, severity: string, notes?: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_deficiencies')
        .insert({
          user_id: user.id,
          deficiency_id: deficiencyId,
          severity,
          notes,
        });

      if (error) {
        console.error('Error adding deficiency:', error);
        toast({
          title: 'Error',
          description: 'Failed to add deficiency',
          variant: 'destructive',
        });
        return false;
      }

      await fetchUserDeficiencies();
      return true;
    } catch (error) {
      console.error('Error adding deficiency:', error);
      return false;
    }
  };

  // Remove user deficiency
  const removeUserDeficiency = async (userDeficiencyId: string) => {
    try {
      const { error } = await supabase
        .from('user_deficiencies')
        .delete()
        .eq('id', userDeficiencyId);

      if (error) {
        console.error('Error removing deficiency:', error);
        return false;
      }

      await fetchUserDeficiencies();
      return true;
    } catch (error) {
      console.error('Error removing deficiency:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        await Promise.all([
          fetchProfile(),
          fetchUserAllergies(),
          fetchUserDeficiencies()
        ]);
        setLoading(false);
      } else {
        setProfile(null);
        setUserAllergies([]);
        setUserDeficiencies([]);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return {
    profile,
    userAllergies,
    userDeficiencies,
    loading,
    updateProfile,
    addUserAllergy,
    removeUserAllergy,
    addUserDeficiency,
    removeUserDeficiency,
    refetch: () => {
      fetchProfile();
      fetchUserAllergies();
      fetchUserDeficiencies();
    },
  };
};