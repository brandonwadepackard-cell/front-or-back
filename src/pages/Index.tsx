import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Brain, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto mb-16">
          <div className="flex justify-center">
            <Brain className="w-20 h-20 text-primary animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Brandon Hub
          </h1>
          <p className="text-muted-foreground text-xl">
            Your unified AI system - powered by local intelligence and cloud scalability
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Content Generator
              </CardTitle>
              <CardDescription>
                Create engaging social media content for Twitter, LinkedIn, and Instagram using AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/content">
                <Button className="w-full group">
                  Go to Content Generator
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Council System
              </CardTitle>
              <CardDescription>
                Multi-agent decision making system (Coming Soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
