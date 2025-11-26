import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Repeat2, Share, Send, Bookmark, MoreHorizontal, ThumbsUp, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface PlatformPreviewProps {
  platform: string;
  content: string;
  scheduledAt?: string | null;
}

const TwitterPreview = ({ content, scheduledAt }: { content: string; scheduledAt?: string | null }) => {
  return (
    <Card className="max-w-xl mx-auto bg-background border">
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-platform-twitter text-platform-twitter-foreground">
              You
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm">Your Name</span>
              <span className="text-muted-foreground text-sm">@yourhandle</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">
                {scheduledAt ? format(new Date(scheduledAt), "MMM d") : "Now"}
              </span>
            </div>
            <div className="text-sm mt-2 whitespace-pre-wrap break-words">
              {content}
            </div>
          </div>
          <MoreHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
        
        {/* Actions */}
        <div className="flex justify-between pt-2 max-w-md">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-platform-twitter transition-colors group">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">0</span>
          </button>
          <button className="flex items-center gap-2 text-muted-foreground hover:text-green-500 transition-colors group">
            <Repeat2 className="h-4 w-4" />
            <span className="text-xs">0</span>
          </button>
          <button className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors group">
            <Heart className="h-4 w-4" />
            <span className="text-xs">0</span>
          </button>
          <button className="flex items-center gap-2 text-muted-foreground hover:text-platform-twitter transition-colors">
            <Share className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};

const LinkedInPreview = ({ content, scheduledAt }: { content: string; scheduledAt?: string | null }) => {
  return (
    <Card className="max-w-xl mx-auto bg-background border">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-platform-linkedin text-platform-linkedin-foreground">
              You
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold text-sm">Your Name</div>
            <div className="text-xs text-muted-foreground">Your Professional Title</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span>{scheduledAt ? format(new Date(scheduledAt), "MMM d, yyyy") : "Just now"}</span>
              <span>·</span>
              <span>🌐</span>
            </div>
          </div>
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </div>
        
        {/* Content */}
        <div className="text-sm whitespace-pre-wrap break-words">
          {content}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 pt-2 border-t">
          <button className="flex-1 flex items-center justify-center gap-2 py-2 text-muted-foreground hover:bg-accent rounded transition-colors">
            <ThumbsUp className="h-4 w-4" />
            <span className="text-xs font-medium">Like</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 text-muted-foreground hover:bg-accent rounded transition-colors">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs font-medium">Comment</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 text-muted-foreground hover:bg-accent rounded transition-colors">
            <Repeat2 className="h-4 w-4" />
            <span className="text-xs font-medium">Repost</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 text-muted-foreground hover:bg-accent rounded transition-colors">
            <Send className="h-4 w-4" />
            <span className="text-xs font-medium">Send</span>
          </button>
        </div>
      </div>
    </Card>
  );
};

const InstagramPreview = ({ content, scheduledAt }: { content: string; scheduledAt?: string | null }) => {
  return (
    <Card className="max-w-md mx-auto bg-background border">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between p-3 pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 ring-2 ring-platform-instagram">
              <AvatarFallback className="bg-platform-instagram text-platform-instagram-foreground text-xs">
                You
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">yourhandle</span>
              <span className="text-xs text-muted-foreground">
                {scheduledAt ? format(new Date(scheduledAt), "MMMM d") : "Just now"}
              </span>
            </div>
          </div>
          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
        </div>
        
        {/* Image placeholder */}
        <div className="aspect-square bg-gradient-to-br from-platform-instagram/20 to-purple-500/20 flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Image Preview</span>
        </div>
        
        {/* Actions */}
        <div className="px-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Heart className="h-6 w-6" />
              <MessageCircle className="h-6 w-6" />
              <Send className="h-6 w-6" />
            </div>
            <Bookmark className="h-6 w-6" />
          </div>
          
          {/* Likes */}
          <div className="font-semibold text-sm">0 likes</div>
          
          {/* Caption */}
          <div className="text-sm">
            <span className="font-semibold mr-2">yourhandle</span>
            <span className="whitespace-pre-wrap break-words">{content}</span>
          </div>
        </div>
        
        <div className="pb-3" />
      </div>
    </Card>
  );
};

export const PlatformPreview = ({ platform, content, scheduledAt }: PlatformPreviewProps) => {
  const normalizedPlatform = platform.toLowerCase();
  
  if (normalizedPlatform === 'twitter') {
    return <TwitterPreview content={content} scheduledAt={scheduledAt} />;
  }
  
  if (normalizedPlatform === 'linkedin') {
    return <LinkedInPreview content={content} scheduledAt={scheduledAt} />;
  }
  
  if (normalizedPlatform === 'instagram') {
    return <InstagramPreview content={content} scheduledAt={scheduledAt} />;
  }
  
  // Fallback for "all" or unknown platforms
  return (
    <div className="space-y-4">
      <TwitterPreview content={content} scheduledAt={scheduledAt} />
      <LinkedInPreview content={content} scheduledAt={scheduledAt} />
      <InstagramPreview content={content} scheduledAt={scheduledAt} />
    </div>
  );
};
