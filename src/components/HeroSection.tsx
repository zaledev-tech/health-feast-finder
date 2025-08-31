import { Button } from "@/components/ui/button";
import { ChefHat, Heart, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-healthy-ingredients.jpg";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
            <ChefHat className="h-12 w-12" />
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Healthy Recipe Generator
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
          Get personalized healthy recipes tailored to your preferences, allergies, and nutritional needs. 
          Complete with shopping lists and video tutorials!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <div className="flex items-center gap-2 text-white/90">
            <Heart className="h-5 w-5 text-red-400" />
            <span>Allergy-safe recipes</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            <span>Personalized nutrition</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <ChefHat className="h-5 w-5 text-green-400" />
            <span>Step-by-step guides</span>
          </div>
        </div>

        <Button 
          onClick={onGetStarted}
          variant="hero" 
          size="xl" 
          className="text-lg font-semibold shadow-2xl hover:shadow-3xl"
        >
          Get My Recipe Now
        </Button>

        <p className="text-sm text-white/70 mt-4">
          Free to use • No signup required • Instant results
        </p>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-bounce delay-1000">
        <div className="bg-white/10 backdrop-blur-sm rounded-full p-3">
          <Heart className="h-6 w-6 text-red-400" />
        </div>
      </div>
      <div className="absolute bottom-20 right-10 animate-bounce delay-2000">
        <div className="bg-white/10 backdrop-blur-sm rounded-full p-3">
          <Sparkles className="h-6 w-6 text-yellow-400" />
        </div>
      </div>
    </section>
  );
}