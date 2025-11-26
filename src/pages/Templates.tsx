import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Sparkles, Library, User, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { starterTemplates, categories } from "@/lib/starter-templates";

const Templates = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    topic: "",
    platform: "twitter",
    description: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (template: typeof formData) => {
      const { error } = await supabase.from("templates").insert([template]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({
        title: "Template created!",
        description: "Your template has been saved",
      });
      setShowCreate(false);
      setFormData({ name: "", topic: "", platform: "twitter", description: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({
        title: "Deleted!",
        description: "Template removed",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    if (!formData.name || !formData.topic) {
      toast({
        title: "Missing fields",
        description: "Name and topic are required",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUse = (template: any) => {
    navigate(`/content?topic=${encodeURIComponent(template.topic)}&platform=${template.platform}`);
  };

  const getPlatformEmoji = (platform: string) => {
    const emojis: { [key: string]: string } = {
      twitter: "𝕏",
      linkedin: "💼",
      instagram: "📸",
    };
    return emojis[platform.toLowerCase()] || "📱";
  };

  const categoryColors: Record<string, { badge: string; bg: string }> = {
    Marketing: { badge: "bg-template-marketing text-white", bg: "bg-template-marketing-bg" },
    Educational: { badge: "bg-template-educational text-white", bg: "bg-template-educational-bg" },
    Engagement: { badge: "bg-template-engagement text-white", bg: "bg-template-engagement-bg" },
    Inspirational: { badge: "bg-template-inspirational text-white", bg: "bg-template-inspirational-bg" },
    Updates: { badge: "bg-template-updates text-white", bg: "bg-template-updates-bg" },
    Seasonal: { badge: "bg-template-seasonal text-white", bg: "bg-template-seasonal-bg" },
  };

  const filteredStarterTemplates = starterTemplates.filter((template) => {
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    const matchesPlatform = platformFilter === "all" || template.platform === platformFilter;
    const matchesSearch = 
      searchTerm === "" ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesPlatform && matchesSearch;
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground variant="mesh" />
      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-primary rounded-2xl shadow-lg">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Content Templates
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Jumpstart your content creation with pre-made templates
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="starter" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12 bg-muted/50 p-1">
              <TabsTrigger 
                value="starter" 
                className="gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Library className="h-4 w-4" />
                Starter Templates
              </TabsTrigger>
              <TabsTrigger 
                value="my-templates" 
                className="gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <User className="h-4 w-4" />
                My Templates
              </TabsTrigger>
            </TabsList>

            {/* Starter Templates Tab */}
            <TabsContent value="starter" className="space-y-6">
              {/* Filters */}
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm animate-slide-up">
                <CardHeader>
                  <CardTitle className="text-2xl">Find Your Perfect Template</CardTitle>
                  <CardDescription>Filter by category, platform, or search keywords</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-0 bg-muted/50 focus-visible:ring-primary h-11"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="border-0 bg-muted/50 h-11">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={platformFilter} onValueChange={setPlatformFilter}>
                      <SelectTrigger className="border-0 bg-muted/50 h-11">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              {filteredStarterTemplates.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStarterTemplates.map((template, index) => {
                    const colors = categoryColors[template.category] || categoryColors.Marketing;
                    return (
                      <Card 
                        key={template.id} 
                        className="group hover:shadow-2xl transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm hover:-translate-y-1 animate-fade-in overflow-hidden"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className={`h-2 ${colors.bg}`} />
                        <CardHeader className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-2 flex-1">
                              <CardTitle className="text-xl group-hover:text-primary transition-colors leading-tight">
                                {template.name}
                              </CardTitle>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={`text-xs ${colors.badge} border-0 shadow-sm`}>
                                  {template.category}
                                </Badge>
                                <span className="text-2xl">{getPlatformEmoji(template.platform)}</span>
                              </div>
                            </div>
                          </div>
                          <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className={`${colors.bg} p-4 rounded-xl border border-border/30`}>
                            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                              Example
                            </p>
                            <p className="text-sm text-foreground/90 line-clamp-3 italic leading-relaxed">
                              "{template.example}"
                            </p>
                          </div>
                          <Button
                            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-md h-11"
                            onClick={() => handleUse(template)}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Use Template
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                  <CardContent className="py-16 text-center">
                    <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg mb-2">No templates match your filters</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm("");
                        setCategoryFilter("all");
                        setPlatformFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* My Templates Tab */}
            <TabsContent value="my-templates" className="space-y-6">
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowCreate(true)}
                  className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-md h-11"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </div>

          {isLoading ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-16 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
                <p className="text-muted-foreground">Loading templates...</p>
              </CardContent>
            </Card>
          ) : templates && templates.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template, index) => (
                <Card 
                  key={template.id} 
                  className="group hover:shadow-2xl transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <CardTitle className="flex items-center gap-2 text-xl group-hover:text-primary transition-colors">
                          <span className="text-2xl">{getPlatformEmoji(template.platform)}</span>
                          <span>{template.name}</span>
                        </CardTitle>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-xs">
                          {template.platform}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(template.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted/50 p-4 rounded-xl">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                          Topic
                        </p>
                        <p className="text-sm text-foreground/90 leading-relaxed">{template.topic}</p>
                      </div>
                      {template.description && (
                        <div className="bg-muted/50 p-4 rounded-xl">
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                            Description
                          </p>
                          <p className="text-sm text-foreground/90 leading-relaxed">{template.description}</p>
                        </div>
                      )}
                      <Button
                        className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-md h-11"
                        onClick={() => handleUse(template)}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/50">
              <CardContent className="py-16 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No custom templates yet</p>
                <p className="text-sm text-muted-foreground/75 mb-6">
                  Create your first template to get started!
                </p>
                <Button 
                  onClick={() => setShowCreate(true)}
                  className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Template
                </Button>
              </CardContent>
            </Card>
          )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Create Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Create Template</DialogTitle>
              <DialogDescription>
                Save a template for quick content generation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Tech Product Launch"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Textarea
                  id="topic"
                  placeholder="What should the content be about?"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add notes about this template"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={createMutation.isPending}
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {createMutation.isPending ? "Creating..." : "Create Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Template?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this template.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Templates;
