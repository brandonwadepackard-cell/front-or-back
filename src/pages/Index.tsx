import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, ArrowRight, Zap, Target, TrendingUp } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";

const Index = () => {
  return (
    <div className="min-h-screen overflow-hidden relative">
      <AnimatedBackground variant="mesh" />

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-24 relative">
        <div className="text-center space-y-8 max-w-4xl mx-auto mb-20 animate-fade-in">
          <Badge className="mx-auto px-4 py-1.5 bg-primary/10 text-primary border-0 hover:bg-primary/20 transition-colors">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered by AI
          </Badge>
          
          <div className="space-y-6">
            <h1 className="text-7xl font-bold tracking-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Brandon Hub
              </span>
            </h1>
            <p className="text-muted-foreground text-2xl max-w-2xl mx-auto leading-relaxed">
              Your unified AI system for content creation, scheduling, and analytics
            </p>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <Link to="/content">
              <Button size="lg" className="text-base group shadow-2xl">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="text-base">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="group hover:-translate-y-2 transition-all duration-300 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border border-border/50 animate-slide-up">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-2xl">AI Content Generator</CardTitle>
              <CardDescription className="text-base">
                Create engaging social media content for Twitter, LinkedIn, and Instagram in seconds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">Twitter</Badge>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">LinkedIn</Badge>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">Instagram</Badge>
              </div>
              <Link to="/content">
                <Button className="w-full group/btn">
                  Start Creating
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:-translate-y-2 transition-all duration-300 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border border-border/50 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-2xl">Council System</CardTitle>
              <CardDescription className="text-base">
                Multi-agent decision making system with AI collaboration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="bg-muted">Coming Soon</Badge>
              </div>
              <Button className="w-full" disabled variant="secondary">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features List */}
        <div className="mt-24 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to succeed
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary mx-auto flex items-center justify-center shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Generate content in seconds with our AI-powered engine
              </p>
            </div>
            
            <div className="text-center space-y-3 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="w-12 h-12 rounded-xl bg-gradient-primary mx-auto flex items-center justify-center shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Platform Optimized</h3>
              <p className="text-muted-foreground">
                Content tailored for each social media platform
              </p>
            </div>
            
            <div className="text-center space-y-3 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="w-12 h-12 rounded-xl bg-gradient-primary mx-auto flex items-center justify-center shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Track performance and optimize your content strategy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
