import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Zap } from "lucide-react";

export const HoverEffectsShowcase = () => {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Enhanced Hover Effects</h2>
        <p className="text-muted-foreground mb-6">
          All interactive elements now feature smooth animations with scale, glow, and shadow effects
        </p>
      </div>

      {/* Button Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Interactive Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Primary Button
          </Button>
          <Button variant="secondary">
            <Heart className="mr-2 h-4 w-4" />
            Secondary Button
          </Button>
          <Button variant="outline">
            <Zap className="mr-2 h-4 w-4" />
            Outline Button
          </Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="destructive">Destructive Button</Button>
        </div>
      </div>

      {/* Card Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Interactive Cards</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="cursor-pointer">
            <CardHeader>
              <CardTitle>Standard Card</CardTitle>
              <CardDescription>Hover to see lift effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cards now lift up on hover with enhanced shadows
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer interactive-card-glow">
            <CardHeader>
              <CardTitle>Glow Card</CardTitle>
              <CardDescription>Enhanced with glow effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card has an extra glow effect on hover
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover-scale-sm">
            <CardHeader>
              <CardTitle>Scale Card</CardTitle>
              <CardDescription>Subtle scale animation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card scales slightly on hover
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Utility Class Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Available Utility Classes</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <code className="text-sm">hover-lift</code>
            <p className="text-xs text-muted-foreground mt-2">Lifts element up on hover</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <code className="text-sm">hover-scale</code>
            <p className="text-xs text-muted-foreground mt-2">Scales to 105% on hover</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <code className="text-sm">hover-scale-sm</code>
            <p className="text-xs text-muted-foreground mt-2">Scales to 102% on hover</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <code className="text-sm">hover-glow-primary</code>
            <p className="text-xs text-muted-foreground mt-2">Adds primary color glow</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <code className="text-sm">interactive-card</code>
            <p className="text-xs text-muted-foreground mt-2">Card lift with shadow</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <code className="text-sm">interactive-card-glow</code>
            <p className="text-xs text-muted-foreground mt-2">Card lift with glow effect</p>
          </div>
        </div>
      </div>
    </div>
  );
};
