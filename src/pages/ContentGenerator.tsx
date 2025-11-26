import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Copy, Check, CalendarIcon, Repeat, Lightbulb, TrendingUp, Clock } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ContentOptimizer } from "@/components/ContentOptimizer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { LibrarySuggestions } from "@/components/LibrarySuggestions";

export default function ContentGenerator() {
  const [searchParams] = useSearchParams();
  const [topic, setTopic] = useState(searchParams.get("topic") || "");
  const [platform, setPlatform] = useState<string>(searchParams.get("platform") || "all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date>();
  const { toast } = useToast();

  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{
    topic: string;
    platform: string;
    reason: string;
    optimal_time: string;
    time_reason: string;
  }>>([]);
  
  const [loadingLibrarySuggestions, setLoadingLibrarySuggestions] = useState(false);
  const [librarySuggestions, setLibrarySuggestions] = useState<Array<{
    item_id: string;
    reason: string;
    usage_tip: string;
    item: any;
  }>>([]);

  // Update form when URL params change (from templates)
  useEffect(() => {
    const topicParam = searchParams.get("topic");
    const platformParam = searchParams.get("platform");
    if (topicParam) setTopic(topicParam);
    if (platformParam) setPlatform(platformParam);
  }, [searchParams]);

  // Fetch recent content
  const { data: recentContent, refetch } = useQuery({
    queryKey: ['recent-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async ({ content, status }: { content: string; status: string }) => {
      let scheduledAt = null;
      
      if (status === 'scheduled' && scheduledDate) {
        const [hours, minutes] = scheduledTime.split(':');
        const dateTime = new Date(scheduledDate);
        dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        scheduledAt = dateTime.toISOString();
      }

      const { error } = await supabase
        .from('content')
        .insert([{
          topic: topic.trim(),
          platform,
          content,
          status,
          scheduled_at: scheduledAt,
          is_recurring: isRecurring && status === 'scheduled',
          recurrence_type: isRecurring && status === 'scheduled' ? recurrenceType : null,
          recurrence_interval: isRecurring && status === 'scheduled' ? recurrenceInterval : 1,
          recurrence_end_date: isRecurring && status === 'scheduled' && recurrenceEndDate ? recurrenceEndDate.toISOString() : null,
        }]);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      refetch();
      toast({
        title: status === 'scheduled' ? "Content scheduled!" : "Content saved!",
        description: status === 'scheduled' 
          ? isRecurring
            ? `Recurring content set up successfully`
            : `Content will be published on ${format(scheduledDate!, "PPP 'at' p")}`
          : "Content saved as draft",
      });
      setTopic("");
      setScheduledDate(undefined);
      setIsRecurring(false);
      setRecurrenceEndDate(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save content",
        variant: "destructive"
      });
    }
  });

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic to generate content about.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Fetch library suggestions in parallel
    const fetchLibrarySuggestions = async () => {
      setLoadingLibrarySuggestions(true);
      try {
        const { data, error } = await supabase.functions.invoke('suggest-library-content', {
          body: { topic: topic.trim(), platform }
        });

        if (!error && data?.success) {
          setLibrarySuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('Error fetching library suggestions:', error);
      } finally {
        setLoadingLibrarySuggestions(false);
      }
    };

    fetchLibrarySuggestions();

    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { topic: topic.trim(), platform }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      // Auto-save generated content
      if (data?.content) {
        await saveMutation.mutateAsync({ 
          content: data.content, 
          status: scheduledDate ? 'scheduled' : 'draft' 
        });
      }

    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleGetSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-suggestions', {
        body: { platform }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('Rate limit')) {
          toast({
            title: "Rate limit reached",
            description: "Too many requests. Please wait a moment and try again.",
            variant: "destructive"
          });
        } else if (data.error.includes('Payment required')) {
          toast({
            title: "Credits required",
            description: "Please add credits to your Lovable AI workspace to continue.",
            variant: "destructive"
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setSuggestions(data.suggestions || []);
      toast({
        title: "Suggestions ready!",
        description: "Click any suggestion to auto-fill the generator",
      });
    } catch (error: any) {
      console.error('Error getting suggestions:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get AI suggestions",
        variant: "destructive"
      });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleApplySuggestion = (suggestion: typeof suggestions[0]) => {
    setTopic(suggestion.topic);
    setPlatform(suggestion.platform);
    
    // Set optimal time
    const [hours, minutes] = suggestion.optimal_time.split(':');
    setScheduledTime(`${hours}:${minutes}`);
    
    // Set date to tomorrow at the suggested time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    setScheduledDate(tomorrow);

    toast({
      title: "Suggestion applied!",
      description: "Topic and optimal posting time have been set. Click Generate to create content.",
    });
  };

  const getPlatformEmoji = (platform: string) => {
    const emojis: Record<string, string> = {
      twitter: "🐦",
      linkedin: "💼",
      instagram: "📸",
      all: "🌐"
    };
    return emojis[platform] || "📝";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <ScrollReveal variant="fade-up">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Content Generator
            </h1>
            <p className="text-muted-foreground text-lg">
              AI-powered social media content creation
            </p>
          </div>
        </ScrollReveal>

        {/* AI Suggestions Card */}
        <ScrollReveal variant="fade-up" delay={0.1}>
          <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              AI-Powered Suggestions
            </CardTitle>
            <CardDescription>
              Get trending topic ideas with optimal posting times based on platform best practices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGetSuggestions}
              disabled={loadingSuggestions}
              variant="outline"
              className="w-full"
            >
              {loadingSuggestions ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing trends...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Get AI Suggestions
                </>
              )}
            </Button>

            {suggestions.length > 0 && (
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleApplySuggestion(suggestion)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl mt-1">
                          {suggestion.platform === 'twitter' && '𝕏'}
                          {suggestion.platform === 'linkedin' && '💼'}
                          {suggestion.platform === 'instagram' && '📸'}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm">{suggestion.topic}</h4>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                              <Clock className="h-3 w-3" />
                              <span>{suggestion.optimal_time}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                          <p className="text-xs text-muted-foreground italic">
                            💡 {suggestion.time_reason}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </ScrollReveal>

        {/* Generator Card */}
        <ScrollReveal variant="scale" delay={0.2}>
          <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Generate Content
            </CardTitle>
            <CardDescription>
              Enter a topic and select a platform to generate engaging content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic</label>
              <Textarea
                placeholder="What should we create content about? (e.g., 'AI automation trends in 2025')"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select value={platform} onValueChange={setPlatform} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🌐 All Platforms</SelectItem>
                  <SelectItem value="twitter">🐦 Twitter</SelectItem>
                  <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                  <SelectItem value="instagram">📸 Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Schedule Publication (Optional)</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal flex-1",
                        !scheduledDate && "text-muted-foreground"
                      )}
                      disabled={isGenerating}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                  disabled={isGenerating}
                />
              </div>
            </div>

            {scheduledDate && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Repeat className="h-4 w-4" />
                      Recurring Schedule
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create content at regular intervals
                    </p>
                  </div>
                  <Switch
                    checked={isRecurring}
                    onCheckedChange={setIsRecurring}
                    disabled={isGenerating}
                  />
                </div>

                {isRecurring && (
                  <div className="space-y-4 pl-6 border-l-2 border-muted">
                    <div className="space-y-2">
                      <Label>Repeat Every</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={recurrenceInterval}
                          onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                          className="w-20"
                          disabled={isGenerating}
                        />
                        <Select 
                          value={recurrenceType} 
                          onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setRecurrenceType(value)}
                          disabled={isGenerating}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Day(s)</SelectItem>
                            <SelectItem value="weekly">Week(s)</SelectItem>
                            <SelectItem value="monthly">Month(s)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>End Date (Optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal w-full",
                              !recurrenceEndDate && "text-muted-foreground"
                            )}
                            disabled={isGenerating}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {recurrenceEndDate ? format(recurrenceEndDate, "PPP") : "Never ends"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={recurrenceEndDate}
                            onSelect={setRecurrenceEndDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {recurrenceEndDate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRecurrenceEndDate(undefined)}
                          className="w-full"
                          disabled={isGenerating}
                        >
                          Clear end date
                        </Button>
                      )}
                    </div>

                    <div className="bg-muted/50 p-3 rounded-md text-sm">
                      <p className="font-medium mb-1">Summary:</p>
                      <p className="text-muted-foreground">
                        Content will be created every {recurrenceInterval} {recurrenceType}
                        {recurrenceEndDate ? ` until ${format(recurrenceEndDate, "PPP")}` : ' indefinitely'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handleGenerate} 
              disabled={isGenerating || !topic.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Content Optimizer */}
        {topic && (
          <ContentOptimizer
            content={topic}
            platform={platform}
            onHashtagsSelect={(hashtags) => {
              setTopic(prev => `${prev}\n\n${hashtags.map(h => `#${h}`).join(' ')}`);
            }}
          />
        )}
        </ScrollReveal>

        {/* Library Suggestions */}
        {librarySuggestions.length > 0 && (
          <ScrollReveal variant="fade-up" delay={0.3}>
            <LibrarySuggestions 
              suggestions={librarySuggestions} 
              isLoading={loadingLibrarySuggestions}
            />
          </ScrollReveal>
        )}

        {/* Recent Content */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Recent Generations</h2>
          
          {!recentContent || recentContent.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No content generated yet. Create your first post above!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recentContent.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span>{getPlatformEmoji(item.platform)}</span>
                          <span className="capitalize">{item.platform}</span>
                        </CardTitle>
                        <CardDescription className="line-clamp-1">
                          {item.topic}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(item.content, item.id)}
                        className="shrink-0"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap line-clamp-6">
                      {item.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}