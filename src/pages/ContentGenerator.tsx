import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Copy, Check, CalendarIcon } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ContentGenerator() {
  const [searchParams] = useSearchParams();
  const [topic, setTopic] = useState(searchParams.get("topic") || "");
  const [platform, setPlatform] = useState<string>(searchParams.get("platform") || "all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const { toast } = useToast();

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
          scheduled_at: scheduledAt
        }]);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      refetch();
      toast({
        title: status === 'scheduled' ? "Content scheduled!" : "Content saved!",
        description: status === 'scheduled' 
          ? `Content will be published on ${format(scheduledDate!, "PPP 'at' p")}`
          : "Content saved as draft",
      });
      setTopic("");
      setScheduledDate(undefined);
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
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Content Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-powered social media content creation
          </p>
        </div>

        {/* Generator Card */}
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