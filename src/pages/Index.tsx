import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Zap, Target, TrendingUp, Search, FolderOpen, Twitter, Linkedin, Github, Mail, Book, HelpCircle } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ParallaxHero } from "@/components/ParallaxHero";
import { NewsletterSignup } from "@/components/NewsletterSignup";

const Index = () => {
  return (
    <div className="min-h-screen overflow-hidden relative">
      <AnimatedBackground variant="mesh" />

      {/* Hero Section with Parallax */}
      <ParallaxHero>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
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

            <Card className="group hover:-translate-y-2 transition-all duration-300 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border border-border/50 animate-slide-up" style={{ animationDelay: "150ms" }}>
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Search className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Web Scraper</CardTitle>
                <CardDescription className="text-base">
                  Automated data collection with recurring jobs, price tracking, and email notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-0">Recurring Jobs</Badge>
                  <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-600 border-0">Price Tracking</Badge>
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-0">Email Alerts</Badge>
                </div>
                <Link to="/scraper">
                  <Button className="w-full group/btn">
                    Start Scraping
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:-translate-y-2 transition-all duration-300 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border border-border/50 animate-slide-up" style={{ animationDelay: "300ms" }}>
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <FolderOpen className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Media Library</CardTitle>
                <CardDescription className="text-base">
                  Organize and manage your content with smart categorization, tagging, and AI-powered search
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-0">Categories</Badge>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-0">Tags</Badge>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-0">AI Search</Badge>
                </div>
                <Link to="/library">
                  <Button className="w-full group/btn">
                    Browse Library
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </ParallaxHero>

      {/* Features List */}
      <div className="container mx-auto px-6 pb-24">
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

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Brand Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Brandon Hub
              </h3>
              <p className="text-muted-foreground text-sm">
                Your unified AI system for content creation, scheduling, and analytics.
              </p>
              <div className="pt-2">
                <NewsletterSignup />
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/content" className="hover:text-primary transition-colors">
                    Content Generator
                  </Link>
                </li>
                <li>
                  <Link to="/scraper" className="hover:text-primary transition-colors">
                    Web Scraper
                  </Link>
                </li>
                <li>
                  <Link to="/library" className="hover:text-primary transition-colors">
                    Media Library
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-primary transition-colors">
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://docs.lovable.dev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Book className="h-4 w-4" />
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="mailto:support@example.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <HelpCircle className="h-4 w-4" />
                    Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Social & Contact */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Connect</h4>
              <div className="flex gap-3">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                  <Github className="h-5 w-5" />
                </a>
                <a href="mailto:contact@example.com" className="w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Brandon Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
