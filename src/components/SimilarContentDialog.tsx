import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2, Video, Image as ImageIcon, FileText, Link as LinkIcon, Mic } from "lucide-react";

interface SimilarContentDialogProps {
  itemId: string;
  itemTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type LibraryItemType = 'video' | 'photo' | 'text_idea' | 'link' | 'voice_memo';

interface SimilarItem {
  id: string;
  title: string;
  description: string | null;
  type: LibraryItemType;
  content: string | null;
  storage_path: string | null;
  thumbnail_path: string | null;
  created_at: string;
  similarity: number;
}

export const SimilarContentDialog = ({ itemId, itemTitle, open, onOpenChange }: SimilarContentDialogProps) => {
  const [similarItems, setSimilarItems] = useState<SimilarItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const findSimilar = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('find-similar-content', {
        body: { itemId, limit: 5 }
      });

      if (error) throw error;

      if (data?.similarItems) {
        setSimilarItems(data.similarItems);
        if (data.similarItems.length === 0) {
          toast.info('No similar content found');
        }
      }
    } catch (error) {
      console.error('Error finding similar content:', error);
      toast.error('Failed to find similar content');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: LibraryItemType) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'photo': return <ImageIcon className="h-4 w-4" />;
      case 'text_idea': return <FileText className="h-4 w-4" />;
      case 'link': return <LinkIcon className="h-4 w-4" />;
      case 'voice_memo': return <Mic className="h-4 w-4" />;
    }
  };

  // Auto-fetch when dialog opens
  useEffect(() => {
    if (open && similarItems.length === 0) {
      findSimilar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Similar to "{itemTitle}"
          </DialogTitle>
          <DialogDescription>
            AI-powered similarity search based on content, descriptions, and transcriptions
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : similarItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No similar content found yet
            </p>
            <Button onClick={findSimilar} variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              Search Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {similarItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      {getTypeIcon(item.type)}
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {Math.round(item.similarity * 100)}% match
                    </Badge>
                  </div>
                  {item.description && (
                    <CardDescription className="line-clamp-2">
                      {item.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  {item.thumbnail_path && item.type === 'video' && (
                    <img 
                      src={item.thumbnail_path}
                      alt={item.title}
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  {item.storage_path && item.type === 'photo' && (
                    <img 
                      src={item.storage_path}
                      alt={item.title}
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  {item.content && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.content}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
