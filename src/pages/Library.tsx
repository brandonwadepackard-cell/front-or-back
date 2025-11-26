import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Upload, FileText, Link as LinkIcon, Video, Image as ImageIcon, Mic, X, Tag, FolderTree } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LibraryItemType = 'video' | 'photo' | 'text_idea' | 'link' | 'voice_memo';

const Library = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<{
    type: LibraryItemType;
    title: string;
    description: string;
    content: string;
    tags: string[];
    categories: string[];
    file?: File;
  }>({
    type: 'text_idea',
    title: '',
    description: '',
    content: '',
    tags: [],
    categories: []
  });
  const [newTag, setNewTag] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [filterType, setFilterType] = useState<LibraryItemType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const queryClient = useQueryClient();

  // Fetch library items
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['library-items', filterType, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('library_items')
        .select(`
          *,
          library_item_tags(tags(id, name)),
          library_item_categories(categories(id, name))
        `)
        .order('created_at', { ascending: false });

      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Client-side filtering for search including transcriptions
      if (searchQuery && data) {
        const lowerQuery = searchQuery.toLowerCase();
        return data.filter(item => 
          item.title.toLowerCase().includes(lowerQuery) ||
          item.description?.toLowerCase().includes(lowerQuery) ||
          item.content?.toLowerCase().includes(lowerQuery)
        );
      }
      
      return data || [];
    }
  });

  // Fetch all tags
  const { data: allTags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tags').select('*').order('name');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch all categories
  const { data: allCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return data || [];
    }
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (item: typeof newItem) => {
      let storagePath = null;
      let thumbnailPath = null;
      let fileName = null;
      let bucket = null;

      // Upload file if present
      if (item.file) {
        bucket = item.type === 'video' ? 'library-videos' 
          : item.type === 'photo' ? 'library-photos'
          : 'library-voice-memos';
        
        const fileExt = item.file.name.split('.').pop();
        fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, item.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        storagePath = publicUrl;
      }

      // Create library item
      const { data: libraryItem, error: itemError } = await supabase
        .from('library_items')
        .insert({
          type: item.type,
          title: item.title,
          description: item.description,
          content: item.content,
          storage_path: storagePath,
          thumbnail_path: thumbnailPath
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // Trigger transcription for voice memos and videos
      if ((item.type === 'voice_memo' || item.type === 'video') && fileName && bucket) {
        // Fire and forget - transcription happens in background
        supabase.functions.invoke('transcribe-media', {
          body: {
            itemId: libraryItem.id,
            storagePath: fileName,
            bucketName: bucket
          }
        }).then(({ data, error }) => {
          if (error) {
            console.error('Transcription error:', error);
            toast.error('Transcription failed, but item was saved');
          } else {
            toast.success('Transcription completed!');
            queryClient.invalidateQueries({ queryKey: ['library-items'] });
          }
        });
      }

      // Add tags
      if (item.tags.length > 0) {
        const tagInserts = item.tags.map(tagId => ({
          library_item_id: libraryItem.id,
          tag_id: tagId
        }));
        
        const { error: tagError } = await supabase
          .from('library_item_tags')
          .insert(tagInserts);
        
        if (tagError) throw tagError;
      }

      // Add categories
      if (item.categories.length > 0) {
        const categoryInserts = item.categories.map(categoryId => ({
          library_item_id: libraryItem.id,
          category_id: categoryId
        }));
        
        const { error: categoryError } = await supabase
          .from('library_item_categories')
          .insert(categoryInserts);
        
        if (categoryError) throw categoryError;
      }

      return libraryItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
      toast.success('Item added to library!');
      setIsAddDialogOpen(false);
      setNewItem({
        type: 'text_idea',
        title: '',
        description: '',
        content: '',
        tags: [],
        categories: []
      });
    },
    onError: (error) => {
      console.error('Error adding item:', error);
      toast.error('Failed to add item to library');
    }
  });

  // Add tag mutation
  const addTagMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('tags')
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setNewItem(prev => ({ ...prev, tags: [...prev.tags, data.id] }));
      setNewTag('');
      toast.success('Tag created!');
    }
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewItem(prev => ({ ...prev, categories: [...prev.categories, data.id] }));
      setNewCategory('');
      toast.success('Category created!');
    }
  });

  const getTypeIcon = (type: LibraryItemType) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'photo': return <ImageIcon className="h-4 w-4" />;
      case 'text_idea': return <FileText className="h-4 w-4" />;
      case 'link': return <LinkIcon className="h-4 w-4" />;
      case 'voice_memo': return <Mic className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Library</h1>
          <p className="text-muted-foreground">Store and organize your media, ideas, and inspiration</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add to Library</DialogTitle>
              <DialogDescription>
                Upload files or save ideas to your content library
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Content Type</Label>
                <Select 
                  value={newItem.type} 
                  onValueChange={(value: LibraryItemType) => setNewItem(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="photo">Photo/Image</SelectItem>
                    <SelectItem value="text_idea">Text Idea</SelectItem>
                    <SelectItem value="link">Link/URL</SelectItem>
                    <SelectItem value="voice_memo">Voice Memo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(newItem.type === 'video' || newItem.type === 'photo' || newItem.type === 'voice_memo') && (
                <div>
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept={
                      newItem.type === 'video' ? 'video/*' 
                      : newItem.type === 'photo' ? 'image/*'
                      : 'audio/*'
                    }
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setNewItem(prev => ({ ...prev, file }));
                    }}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newItem.title}
                  onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Give this content a title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add a description..."
                  rows={3}
                />
              </div>

              {(newItem.type === 'text_idea' || newItem.type === 'link') && (
                <div>
                  <Label htmlFor="content">{newItem.type === 'link' ? 'URL' : 'Content'}</Label>
                  <Textarea
                    id="content"
                    value={newItem.content}
                    onChange={(e) => setNewItem(prev => ({ ...prev, content: e.target.value }))}
                    placeholder={newItem.type === 'link' ? 'https://...' : 'Write your idea...'}
                    rows={4}
                  />
                </div>
              )}

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newItem.tags.map(tagId => {
                    const tag = allTags.find(t => t.id === tagId);
                    return tag ? (
                      <Badge key={tagId} variant="secondary">
                        {tag.name}
                        <X 
                          className="h-3 w-3 ml-1 cursor-pointer" 
                          onClick={() => setNewItem(prev => ({ 
                            ...prev, 
                            tags: prev.tags.filter(t => t !== tagId) 
                          }))}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
                <div className="flex gap-2">
                  <Select 
                    value="" 
                    onValueChange={(value) => {
                      if (!newItem.tags.includes(value)) {
                        setNewItem(prev => ({ ...prev, tags: [...prev.tags, value] }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tags..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allTags.filter(t => !newItem.tags.includes(t.id)).map(tag => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 flex-1">
                    <Input
                      placeholder="New tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTag.trim()) {
                          e.preventDefault();
                          addTagMutation.mutate(newTag.trim());
                        }
                      }}
                    />
                    <Button 
                      type="button"
                      size="sm"
                      onClick={() => newTag.trim() && addTagMutation.mutate(newTag.trim())}
                      disabled={!newTag.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newItem.categories.map(categoryId => {
                    const category = allCategories.find(c => c.id === categoryId);
                    return category ? (
                      <Badge key={categoryId} variant="outline">
                        {category.name}
                        <X 
                          className="h-3 w-3 ml-1 cursor-pointer" 
                          onClick={() => setNewItem(prev => ({ 
                            ...prev, 
                            categories: prev.categories.filter(c => c !== categoryId) 
                          }))}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
                <div className="flex gap-2">
                  <Select 
                    value="" 
                    onValueChange={(value) => {
                      if (!newItem.categories.includes(value)) {
                        setNewItem(prev => ({ ...prev, categories: [...prev.categories, value] }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select categories..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.filter(c => !newItem.categories.includes(c.id)).map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 flex-1">
                    <Input
                      placeholder="New category..."
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newCategory.trim()) {
                          e.preventDefault();
                          addCategoryMutation.mutate(newCategory.trim());
                        }
                      }}
                    />
                    <Button 
                      type="button"
                      size="sm"
                      onClick={() => newCategory.trim() && addCategoryMutation.mutate(newCategory.trim())}
                      disabled={!newCategory.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => addItemMutation.mutate(newItem)}
                disabled={!newItem.title || addItemMutation.isPending}
                className="w-full"
              >
                {addItemMutation.isPending ? 'Adding...' : 'Add to Library'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={filterType} onValueChange={(value) => setFilterType(value as typeof filterType)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
          <TabsTrigger value="photo">Photos</TabsTrigger>
          <TabsTrigger value="text_idea">Ideas</TabsTrigger>
          <TabsTrigger value="link">Links</TabsTrigger>
          <TabsTrigger value="voice_memo">Voice Memos</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-4">
        <Input
          placeholder="Search library (includes transcriptions)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No content yet. Start building your library!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item: any) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(item.type)}
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                </div>
                {item.description && (
                  <CardDescription>{item.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {item.storage_path && (item.type === 'photo') && (
                  <img 
                    src={item.storage_path} 
                    alt={item.title}
                    className="w-full h-40 object-cover rounded"
                  />
                )}
                {item.storage_path && item.type === 'video' && (
                  <video 
                    src={item.storage_path}
                    controls
                    className="w-full h-40 rounded"
                  />
                )}
                {item.storage_path && item.type === 'voice_memo' && (
                  <div className="space-y-2">
                    <audio src={item.storage_path} controls className="w-full" />
                    {item.content && (
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        <strong>Transcription:</strong> {item.content}
                      </div>
                    )}
                  </div>
                )}
                {item.type === 'video' && item.content && (
                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    <strong>Transcription:</strong> {item.content}
                  </div>
                )}
                {item.type === 'text_idea' && item.content && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.content}
                  </p>
                )}
                {item.type === 'link' && item.content && (
                  <a 
                    href={item.content} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline line-clamp-2"
                  >
                    {item.content}
                  </a>
                )}
                <div className="flex flex-wrap gap-1">
                  {item.library_item_tags?.map((t: any) => t.tags && (
                    <Badge key={t.tags.id} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {t.tags.name}
                    </Badge>
                  ))}
                  {item.library_item_categories?.map((c: any) => c.categories && (
                    <Badge key={c.categories.id} variant="outline" className="text-xs">
                      <FolderTree className="h-3 w-3 mr-1" />
                      {c.categories.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;