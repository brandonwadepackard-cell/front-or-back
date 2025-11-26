import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Calendar, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollReveal } from "@/components/ScrollReveal";

interface ParsedContent {
  topic: string;
  platform: string;
  content: string;
  scheduled_at: string;
  status?: string;
  is_recurring?: boolean;
  recurrence_type?: 'daily' | 'weekly' | 'monthly' | null;
  recurrence_interval?: number;
  recurrence_end_date?: string | null;
  error?: string;
}

const BulkSchedule = () => {
  const [parsedData, setParsedData] = useState<ParsedContent[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const bulkInsertMutation = useMutation({
    mutationFn: async (data: ParsedContent[]) => {
      const validData = data.filter(item => !item.error);
      
      const { error } = await supabase
        .from('content')
        .insert(validData.map(item => ({
          topic: item.topic,
          platform: item.platform,
          content: item.content,
          scheduled_at: item.scheduled_at,
          status: item.status || 'scheduled',
          is_recurring: item.is_recurring || false,
          recurrence_type: item.recurrence_type || null,
          recurrence_interval: item.recurrence_interval || 1,
          recurrence_end_date: item.recurrence_end_date || null,
        })));

      if (error) throw error;
      return validData.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-content'] });
      toast({
        title: "Posts scheduled!",
        description: `Successfully scheduled ${count} post${count > 1 ? 's' : ''}`,
      });
      setParsedData([]);
      setPasteText("");
      navigate('/calendar');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule posts",
        variant: "destructive"
      });
    }
  });

  const parseCSV = (csvText: string): ParsedContent[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const results: ParsedContent[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV parser (handles quoted fields)
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Validate required fields
      const item: ParsedContent = {
        topic: row.topic || '',
        platform: row.platform?.toLowerCase() || '',
        content: row.content || '',
        scheduled_at: row.scheduled_at || row.scheduled_date || '',
        status: row.status || 'scheduled',
      };

      // Validate
      if (!item.topic || !item.platform || !item.content) {
        item.error = 'Missing required fields (topic, platform, content)';
      } else if (!['twitter', 'linkedin', 'instagram', 'all'].includes(item.platform)) {
        item.error = 'Invalid platform (must be: twitter, linkedin, instagram, or all)';
      } else if (item.scheduled_at && !isValidDate(item.scheduled_at)) {
        item.error = 'Invalid date format (use: YYYY-MM-DD HH:MM or YYYY-MM-DD)';
      }

      results.push(item);
    }

    return results;
  };

  const parsePastedText = (text: string): ParsedContent[] => {
    const lines = text.trim().split('\n');
    const results: ParsedContent[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Try to parse as tab-separated or comma-separated
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      
      if (parts.length >= 3) {
        const item: ParsedContent = {
          topic: parts[0].trim().replace(/^["']|["']$/g, ''),
          platform: parts[1].trim().toLowerCase().replace(/^["']|["']$/g, ''),
          content: parts[2].trim().replace(/^["']|["']$/g, ''),
          scheduled_at: parts[3]?.trim().replace(/^["']|["']$/g, '') || '',
          status: 'scheduled',
        };

        if (!['twitter', 'linkedin', 'instagram', 'all'].includes(item.platform)) {
          item.error = 'Invalid platform';
        } else if (item.scheduled_at && !isValidDate(item.scheduled_at)) {
          item.error = 'Invalid date format';
        }

        results.push(item);
      }
    }

    return results;
  };

  const isValidDate = (dateStr: string): boolean => {
    // Support formats: YYYY-MM-DD HH:MM, YYYY-MM-DD, MM/DD/YYYY HH:MM, etc.
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setParsedData(parsed);
      
      const validCount = parsed.filter(p => !p.error).length;
      const errorCount = parsed.filter(p => p.error).length;
      
      toast({
        title: "CSV parsed",
        description: `Found ${validCount} valid post${validCount > 1 ? 's' : ''}${errorCount > 0 ? ` and ${errorCount} error${errorCount > 1 ? 's' : ''}` : ''}`,
      });
    } catch (error) {
      toast({
        title: "Parse error",
        description: "Failed to parse CSV file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleParsePaste = () => {
    if (!pasteText.trim()) {
      toast({
        title: "No content",
        description: "Please paste content to parse",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Try CSV format first, then fallback to simple parsing
      const parsed = pasteText.includes(',') || pasteText.includes('\t')
        ? (pasteText.includes('topic') ? parseCSV(pasteText) : parsePastedText(pasteText))
        : parsePastedText(pasteText);
      
      setParsedData(parsed);
      
      const validCount = parsed.filter(p => !p.error).length;
      const errorCount = parsed.filter(p => p.error).length;
      
      toast({
        title: "Content parsed",
        description: `Found ${validCount} valid post${validCount > 1 ? 's' : ''}${errorCount > 0 ? ` and ${errorCount} error${errorCount > 1 ? 's' : ''}` : ''}`,
      });
    } catch (error) {
      toast({
        title: "Parse error",
        description: "Failed to parse content",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScheduleAll = () => {
    const validPosts = parsedData.filter(p => !p.error);
    if (validPosts.length === 0) {
      toast({
        title: "No valid posts",
        description: "Please fix errors before scheduling",
        variant: "destructive"
      });
      return;
    }

    bulkInsertMutation.mutate(parsedData);
  };

  const downloadTemplate = () => {
    const template = `topic,platform,content,scheduled_at
"AI trends in 2025","twitter","Exploring the latest AI trends that will shape 2025. #AI #Tech","2025-01-15 10:00"
"Marketing automation tips","linkedin","5 ways to automate your marketing workflow and save time.","2025-01-16 14:30"
"Behind the scenes","instagram","A sneak peek at our creative process 📸","2025-01-17 09:00"`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-schedule-template.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Template downloaded",
      description: "Use this template to format your bulk posts",
    });
  };

  const getPlatformEmoji = (platform: string) => {
    const emojis: Record<string, string> = {
      twitter: "𝕏",
      linkedin: "💼",
      instagram: "📸",
      all: "🌐",
    };
    return emojis[platform] || "📱";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <ScrollReveal variant="fade-up">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold">Bulk Schedule</h1>
              <p className="text-muted-foreground">
                Upload a CSV file or paste content to schedule multiple posts at once
              </p>
            </div>
          </ScrollReveal>

          {/* Instructions */}
          <ScrollReveal variant="fade-up" delay={0.1}>
            <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong>Format:</strong> topic, platform (twitter/linkedin/instagram), content, scheduled_at (YYYY-MM-DD HH:MM)
              <Button variant="link" className="ml-2 p-0 h-auto" onClick={downloadTemplate}>
                Download CSV template
              </Button>
            </AlertDescription>
          </Alert>
          </ScrollReveal>

          {/* Import Tabs */}
          <ScrollReveal variant="scale" delay={0.2}>
            <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </TabsTrigger>
              <TabsTrigger value="paste">
                <FileText className="h-4 w-4 mr-2" />
                Paste Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upload CSV File</CardTitle>
                  <CardDescription>
                    Upload a CSV file with your posts. Each row should contain: topic, platform, content, scheduled_at
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="csv-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">Click to upload CSV file</p>
                      <p className="text-sm text-muted-foreground">or drag and drop</p>
                    </div>
                    <Input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </Label>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="paste" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Paste Content</CardTitle>
                  <CardDescription>
                    Paste tab-separated or comma-separated values. One post per line.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Paste your content here. Example:
AI trends in 2025, twitter, Exploring the latest AI trends, 2025-01-15 10:00
Marketing tips, linkedin, 5 ways to automate your marketing, 2025-01-16 14:30"
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <Button onClick={handleParsePaste} disabled={isProcessing || !pasteText.trim()}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Parsing...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Parse Content
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          </ScrollReveal>

          {/* Preview Table */}
          {parsedData.length > 0 && (
            <ScrollReveal variant="fade-up" delay={0.3}>
              <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Preview & Schedule</CardTitle>
                    <CardDescription>
                      Review the parsed posts below. Fix any errors before scheduling.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleScheduleAll}
                    disabled={bulkInsertMutation.isPending || parsedData.every(p => p.error)}
                  >
                    {bulkInsertMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule {parsedData.filter(p => !p.error).length} Post{parsedData.filter(p => !p.error).length !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Status</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Content Preview</TableHead>
                        <TableHead>Scheduled</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.map((item, index) => (
                        <TableRow key={index} className={item.error ? 'bg-destructive/10' : ''}>
                          <TableCell>
                            {item.error ? (
                              <XCircle className="h-4 w-4 text-destructive" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{getPlatformEmoji(item.platform)}</span>
                              <span className="capitalize text-sm">{item.platform}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{item.topic}</TableCell>
                          <TableCell>
                            <div className="max-w-md">
                              {item.error ? (
                                <Badge variant="destructive">{item.error}</Badge>
                              ) : (
                                <p className="text-sm text-muted-foreground truncate">
                                  {item.content}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.scheduled_at || 'Not set'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            </ScrollReveal>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkSchedule;
