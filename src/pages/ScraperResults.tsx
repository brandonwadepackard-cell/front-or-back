import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, ExternalLink, DollarSign, Mail, Phone, Linkedin, Twitter, TrendingUp, LineChart } from "lucide-react";
import { toast } from "sonner";

interface ScrapeResult {
  id: string;
  job_id: string;
  url: string;
  title: string | null;
  text_content: string | null;
  screenshot_path: string | null;
  prices: any[];
  contacts: any[];
  ai_summary: string | null;
  ai_sentiment: string | null;
  scraped_at: string;
}

interface ScrapeJob {
  id: string;
  name: string | null;
  query: string;
  status: string;
  sources: string[];
  extract_prices: boolean;
  extract_contacts: boolean;
  created_at: string;
}

interface PriceHistory {
  id: string;
  url: string;
  product_name: string | null;
  price: number;
  currency: string;
  recorded_at: string;
}

const ScraperResults = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch job details
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['scrape-job', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scrape_jobs')
        .select('*')
        .eq('id', jobId!)
        .single();

      if (error) throw error;
      return data as ScrapeJob;
    },
    enabled: !!jobId
  });

  // Fetch results
  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ['scrape-results', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scrape_results')
        .select('*')
        .eq('job_id', jobId!)
        .order('scraped_at', { ascending: false });

      if (error) throw error;
      return data as ScrapeResult[];
    },
    enabled: !!jobId
  });

  // Fetch price history
  const { data: priceHistory = [] } = useQuery({
    queryKey: ['price-history', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_history')
        .select('*')
        .eq('job_id', jobId!)
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      return data as PriceHistory[];
    },
    enabled: !!jobId && job?.extract_prices
  });

  // Real-time subscription for updates
  useEffect(() => {
    if (!jobId) return;

    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scrape_results',
          filter: `job_id=eq.${jobId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['scrape-results', jobId] });
          queryClient.invalidateQueries({ queryKey: ['price-history', jobId] });
          toast.success('New results available!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, queryClient]);

  if (jobLoading || !job) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const totalPrices = results.reduce((sum, r) => sum + (r.prices?.length || 0), 0);
  const totalContacts = results.reduce((sum, r) => sum + (r.contacts?.length || 0), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/scraper')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Button>

      {/* Job Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{job.name || job.query}</CardTitle>
              <CardDescription className="mt-2">{job.query}</CardDescription>
            </div>
            <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
              {job.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Results</p>
              <p className="text-2xl font-bold">{results.length}</p>
            </div>
            {job.extract_prices && (
              <div>
                <p className="text-sm text-muted-foreground">Prices Found</p>
                <p className="text-2xl font-bold text-green-500">{totalPrices}</p>
              </div>
            )}
            {job.extract_contacts && (
              <div>
                <p className="text-sm text-muted-foreground">Contacts Found</p>
                <p className="text-2xl font-bold text-blue-500">{totalContacts}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Sources</p>
              <p className="text-2xl font-bold">{job.sources.length || 'Direct'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price History Chart */}
      {job.extract_prices && priceHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Price History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {priceHistory.map((ph) => (
                <div key={ph.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div>
                    <p className="font-medium">{ph.product_name || 'Product'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(ph.recorded_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-500">
                      {ph.currency} {ph.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Scraped Results</h2>
        {resultsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {job.status === 'pending' ? 'Waiting for scraper to start...' :
                 job.status === 'running' ? 'Scraper is working on it...' :
                 'No results yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          results.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{result.title || 'Untitled'}</CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-2">
                      <ExternalLink className="h-3 w-3" />
                      <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {result.url}
                      </a>
                    </CardDescription>
                  </div>
                  {result.screenshot_path && (
                    <img 
                      src={result.screenshot_path} 
                      alt="Screenshot"
                      className="w-32 h-20 object-cover rounded border"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.ai_summary && (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm font-medium mb-2">AI Summary</p>
                    <p className="text-sm">{result.ai_summary}</p>
                    {result.ai_sentiment && (
                      <Badge variant="outline" className="mt-2">
                        Sentiment: {result.ai_sentiment}
                      </Badge>
                    )}
                  </div>
                )}

                {result.prices && result.prices.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Prices Found ({result.prices.length})
                    </p>
                    <div className="space-y-2">
                      {result.prices.map((price: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                          <div>
                            <p className="font-medium">{price.label || 'Product'}</p>
                            {price.context && (
                              <p className="text-xs text-muted-foreground">{price.context}</p>
                            )}
                          </div>
                          <p className="text-lg font-bold text-green-500">
                            {price.currency} {price.amount}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.contacts && result.contacts.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Contacts Found ({result.contacts.length})</p>
                    <div className="space-y-3">
                      {result.contacts.map((contact: any, idx: number) => (
                        <div key={idx} className="p-3 bg-muted/50 rounded space-y-1">
                          {contact.name && <p className="font-medium">{contact.name}</p>}
                          {contact.email && (
                            <p className="text-sm flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <a href={`mailto:${contact.email}`} className="hover:underline">
                                {contact.email}
                              </a>
                            </p>
                          )}
                          {contact.phone && (
                            <p className="text-sm flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </p>
                          )}
                          {contact.linkedin && (
                            <p className="text-sm flex items-center gap-2">
                              <Linkedin className="h-3 w-3" />
                              <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                LinkedIn
                              </a>
                            </p>
                          )}
                          {contact.twitter && (
                            <p className="text-sm flex items-center gap-2">
                              <Twitter className="h-3 w-3" />
                              <a href={contact.twitter} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                Twitter
                              </a>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.text_content && (
                  <details className="cursor-pointer">
                    <summary className="text-sm font-medium">Full Content</summary>
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                      {result.text_content.slice(0, 1000)}
                      {result.text_content.length > 1000 && '...'}
                    </p>
                  </details>
                )}

                <p className="text-xs text-muted-foreground">
                  Scraped at {new Date(result.scraped_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ScraperResults;
