import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Hash, Sparkles, Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentOptimizerProps {
  content: string;
  platform: string;
  onHashtagsSelect?: (hashtags: string[]) => void;
}

interface PlatformLimits {
  maxChars: number;
  recommendedChars?: number;
  minHashtags: number;
  maxHashtags: number;
  optimalHashtags: string;
}

const PLATFORM_LIMITS: Record<string, PlatformLimits> = {
  twitter: {
    maxChars: 280,
    minHashtags: 1,
    maxHashtags: 2,
    optimalHashtags: "1-2 hashtags",
  },
  linkedin: {
    maxChars: 3000,
    recommendedChars: 250,
    minHashtags: 3,
    maxHashtags: 5,
    optimalHashtags: "3-5 hashtags",
  },
  instagram: {
    maxChars: 2200,
    recommendedChars: 125,
    minHashtags: 5,
    maxHashtags: 10,
    optimalHashtags: "5-10 hashtags (up to 30)",
  },
  all: {
    maxChars: 280, // Use Twitter's limit as the most restrictive
    minHashtags: 1,
    maxHashtags: 3,
    optimalHashtags: "1-3 versatile hashtags",
  },
};

export const ContentOptimizer = ({ content, platform, onHashtagsSelect }: ContentOptimizerProps) => {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [reasoning, setReasoning] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const platformKey = platform.toLowerCase() as keyof typeof PLATFORM_LIMITS;
  const limits = PLATFORM_LIMITS[platformKey] || PLATFORM_LIMITS.all;

  const charCount = content.length;
  const isOverLimit = charCount > limits.maxChars;
  const isNearLimit = charCount > limits.maxChars * 0.9;
  const isOptimal = limits.recommendedChars 
    ? charCount <= limits.recommendedChars 
    : charCount <= limits.maxChars * 0.7;

  const getCharCountColor = () => {
    if (isOverLimit) return "text-destructive";
    if (isNearLimit) return "text-yellow-600";
    if (isOptimal) return "text-green-600";
    return "text-muted-foreground";
  };

  const getCharCountIcon = () => {
    if (isOverLimit) return <AlertCircle className="h-4 w-4" />;
    if (isOptimal) return <CheckCircle2 className="h-4 w-4" />;
    return <Info className="h-4 w-4" />;
  };

  const handleGetHashtags = async () => {
    if (!content.trim()) {
      toast({
        title: "No content",
        description: "Please add content before generating hashtags",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-hashtags', {
        body: { content, platform }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('Rate limit')) {
          toast({
            title: "Rate limit reached",
            description: "Too many requests. Please try again later.",
            variant: "destructive"
          });
        } else if (data.error.includes('Payment required')) {
          toast({
            title: "Credits required",
            description: "Please add credits to your Lovable AI workspace.",
            variant: "destructive"
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setHashtags(data.hashtags || []);
      setReasoning(data.reasoning || "");
      
      toast({
        title: "Hashtags generated!",
        description: "Click any hashtag to copy it to clipboard",
      });
    } catch (error: any) {
      console.error('Error getting hashtags:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate hashtags",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHashtagClick = async (hashtag: string) => {
    try {
      await navigator.clipboard.writeText(`#${hashtag}`);
      toast({
        title: "Copied!",
        description: `#${hashtag} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleApplyAll = () => {
    if (onHashtagsSelect) {
      onHashtagsSelect(hashtags);
      toast({
        title: "Hashtags added!",
        description: "Hashtags have been added to your content",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Content Optimizer
          </span>
          <div className={cn("flex items-center gap-2 text-sm font-medium", getCharCountColor())}>
            {getCharCountIcon()}
            <span>
              {charCount} / {limits.maxChars}
            </span>
          </div>
        </CardTitle>
        <CardDescription>
          {limits.recommendedChars && (
            <span className="block">
              Recommended: {limits.recommendedChars} chars for best engagement
            </span>
          )}
          <span className="block">
            Optimal hashtags: {limits.optimalHashtags}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Character Count Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={isOverLimit ? "destructive" : isOptimal ? "default" : "secondary"}>
              {isOverLimit ? "Over limit" : isOptimal ? "Optimal" : "Good"}
            </Badge>
          </div>
          {limits.recommendedChars && charCount > limits.recommendedChars && !isOverLimit && (
            <p className="text-xs text-muted-foreground">
              💡 Consider shortening to {limits.recommendedChars} characters for better engagement
            </p>
          )}
        </div>

        {/* Hashtag Suggestions */}
        <div className="space-y-3">
          <Button
            onClick={handleGetHashtags}
            disabled={isLoading || !content.trim()}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating hashtags...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Get AI Hashtag Suggestions
              </>
            )}
          </Button>

          {hashtags.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => handleHashtagClick(tag)}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
              
              {reasoning && (
                <p className="text-xs text-muted-foreground italic">
                  💡 {reasoning}
                </p>
              )}

              {onHashtagsSelect && (
                <Button
                  onClick={handleApplyAll}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Add All Hashtags to Content
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Platform Tips */}
        <div className="pt-3 border-t space-y-2">
          <h4 className="text-sm font-medium">Platform Tips:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            {platform === 'twitter' && (
              <>
                <li>• Keep tweets under 280 characters</li>
                <li>• Use 1-2 relevant hashtags max</li>
                <li>• Questions and CTA posts perform well</li>
              </>
            )}
            {platform === 'linkedin' && (
              <>
                <li>• First 150-250 chars are most visible</li>
                <li>• Use 3-5 professional hashtags</li>
                <li>• Ask questions to drive comments</li>
              </>
            )}
            {platform === 'instagram' && (
              <>
                <li>• First 125 chars appear before "more"</li>
                <li>• Use 5-10 strategic hashtags</li>
                <li>• End with a call-to-action</li>
              </>
            )}
            {platform === 'all' && (
              <>
                <li>• Keep it concise (under 280 chars)</li>
                <li>• Use 1-3 versatile hashtags</li>
                <li>• Make every word count</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
