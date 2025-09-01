import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useProfile } from '@/hooks/useProfile';
import { useReferenceData } from '@/hooks/useReferenceData';
import { Plus, X, User, AlertTriangle, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileSetupProps {
  onComplete: () => void;
}

const ProfileSetup = ({ onComplete }: ProfileSetupProps) => {
  const { profile, userAllergies, userDeficiencies, updateProfile, addUserAllergy, removeUserAllergy, addUserDeficiency, removeUserDeficiency } = useProfile();
  const { allergies, deficiencies, loading: refLoading } = useReferenceData();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [loading, setLoading] = useState(false);
  const [selectedAllergy, setSelectedAllergy] = useState('');
  const [allergySeverity, setAllergySeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [selectedDeficiency, setSelectedDeficiency] = useState('');
  const [deficiencySeverity, setDeficiencySeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');

  const handleSaveProfile = async () => {
    setLoading(true);
    const success = await updateProfile({
      full_name: fullName,
      username: username,
      bio: bio,
    });

    if (success) {
      onComplete();
    }
    setLoading(false);
  };

  const handleAddAllergy = async () => {
    if (!selectedAllergy) return;
    
    const success = await addUserAllergy(selectedAllergy, allergySeverity);
    if (success) {
      setSelectedAllergy('');
      setAllergySeverity('mild');
      toast({
        title: 'Success',
        description: 'Allergy added to your profile',
      });
    }
  };

  const handleAddDeficiency = async () => {
    if (!selectedDeficiency) return;
    
    const success = await addUserDeficiency(selectedDeficiency, deficiencySeverity);
    if (success) {
      setSelectedDeficiency('');
      setDeficiencySeverity('mild');
      toast({
        title: 'Success',
        description: 'Deficiency added to your profile',
      });
    }
  };

  const availableAllergies = allergies.filter(
    allergy => !userAllergies.find(ua => ua.allergy_id === allergy.id)
  );

  const availableDeficiencies = deficiencies.filter(
    deficiency => !userDeficiencies.find(ud => ud.deficiency_id === deficiency.id)
  );

  if (refLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Help us personalize your recipe recommendations by setting up your profile
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {/* Basic Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Tell us a bit about yourself
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your cooking interests..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Allergies
              </CardTitle>
              <CardDescription>
                Let us know about any food allergies you have
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new allergy */}
              <div className="space-y-2">
                <Label>Add Allergy</Label>
                <div className="flex gap-2">
                  <Select value={selectedAllergy} onValueChange={setSelectedAllergy}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select allergy" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAllergies.map((allergy) => (
                        <SelectItem key={allergy.id} value={allergy.id}>
                          {allergy.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={allergySeverity} onValueChange={(value: 'mild' | 'moderate' | 'severe') => setAllergySeverity(value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handleAddAllergy}
                    disabled={!selectedAllergy}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Current allergies */}
              <div className="space-y-2">
                <Label>Your Allergies</Label>
                <div className="flex flex-wrap gap-2">
                  {userAllergies.map((userAllergy) => (
                    <Badge
                      key={userAllergy.id}
                      variant={userAllergy.severity === 'severe' ? 'destructive' : 'secondary'}
                      className="flex items-center gap-1"
                    >
                      {userAllergy.allergy.name}
                      <button
                        onClick={() => removeUserAllergy(userAllergy.id)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {userAllergies.length === 0 && (
                    <p className="text-sm text-muted-foreground">No allergies added</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nutritional Deficiencies */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Nutritional Needs
              </CardTitle>
              <CardDescription>
                Track any nutritional deficiencies or special needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new deficiency */}
              <div className="space-y-2">
                <Label>Add Deficiency</Label>
                <div className="flex gap-2">
                  <Select value={selectedDeficiency} onValueChange={setSelectedDeficiency}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select deficiency" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDeficiencies.map((deficiency) => (
                        <SelectItem key={deficiency.id} value={deficiency.id}>
                          {deficiency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={deficiencySeverity} onValueChange={(value: 'mild' | 'moderate' | 'severe') => setDeficiencySeverity(value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handleAddDeficiency}
                    disabled={!selectedDeficiency}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Current deficiencies */}
              <div className="space-y-2">
                <Label>Your Nutritional Needs</Label>
                <div className="flex flex-wrap gap-2">
                  {userDeficiencies.map((userDeficiency) => (
                    <Badge
                      key={userDeficiency.id}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {userDeficiency.deficiency.name}
                      <button
                        onClick={() => removeUserDeficiency(userDeficiency.id)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {userDeficiencies.length === 0 && (
                    <p className="text-sm text-muted-foreground">No deficiencies added</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            onClick={handleSaveProfile}
            disabled={loading}
            size="lg"
            className="px-8"
          >
            {loading ? 'Saving...' : 'Complete Setup'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;