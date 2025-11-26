import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Image as ImageIcon, FileText, Link as LinkIcon, Mic, ExternalLink } from "lucide-react";

interface LibraryItem {
  id: string;
  type: string;
  title: string;
  description: string;
  content?: string;
  storage_path?: string;
  tags: string[];
  categories: string[];
}

interface Suggestion {
  item_id: string;
  reason: string;
  usage_tip: string;
  item: LibraryItem;
}

interface LibrarySuggestionsProps {
  suggestions: Suggestion[];
  isLoading: boolean;
}

export const LibrarySuggestions = ({ suggestions, isLoading }: LibrarySuggestionsProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'photo': return <ImageIcon className="h-4 w-4" />;
      case 'text_idea': return <FileText className="h-4 w-4" />;
      case 'link': return <LinkIcon className="h-4 w-4" />;
      case 'voice_memo': return <Mic className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Library Suggestions</CardTitle>
          <CardDescription>Finding relevant content from your library...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended from Your Library</CardTitle>
        <CardDescription>AI-suggested content that matches your topic</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.item_id} className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-primary/10 text-primary">
                  {getTypeIcon(suggestion.item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1">{suggestion.item.title}</h4>
                  {suggestion.item.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {suggestion.item.description}
                    </p>
                  )}
                  
                  {suggestion.item.storage_path && suggestion.item.type === 'photo' && (
                    <img 
                      src={suggestion.item.storage_path} 
                      alt={suggestion.item.title}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  
                  {suggestion.item.content && suggestion.item.type === 'text_idea' && (
                    <p className="text-xs bg-muted p-2 rounded mb-2 line-clamp-2">
                      {suggestion.item.content}
                    </p>
                  )}
                  
                  {suggestion.item.content && suggestion.item.type === 'link' && (
                    <a 
                      href={suggestion.item.content} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mb-2"
                    >
                      {suggestion.item.content}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {suggestion.item.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 pt-2 border-t">
                <div className="text-xs">
                  <span className="font-semibold text-primary">Why:</span>
                  <p className="text-muted-foreground mt-1">{suggestion.reason}</p>
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-primary">Tip:</span>
                  <p className="text-muted-foreground mt-1">{suggestion.usage_tip}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => window.location.href = '/library'}
        >
          View Full Library
        </Button>
      </CardContent>
    </Card>
  );
};