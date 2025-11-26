import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Globe, Plus, Loader2, CheckCircle, XCircle, Clock, Play, TrendingUp, Repeat } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

interface ScrapeJob {
  id: string;
  user_id: string;
  name: string | null;
  query: string;
  sources: string[];
  extract_prices: boolean;
  extract_contacts: boolean;
  status: JobStatus;
  recurrence_enabled?: boolean;
  recurrence_interval?: string;
  recurrence_time?: string;
  next_run_at?: string;
  created_at: string;
  updated_at: string;
}

const SEARCH_SOURCES = [
  { id: 'google', label: 'Google' },
  { id: 'amazon', label: 'Amazon' },
  { id: 'ebay', label: 'eBay' },
  { id: 'walmart', label: 'Walmart' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'reddit', label: 'Reddit' },
];

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'bg-yellow-500', label: 'Pending', textColor: 'text-yellow-500' },
  running: { icon: Play, color: 'bg-blue-500', label: 'Running', textColor: 'text-blue-500' },
  completed: { icon: CheckCircle, color: 'bg-green-500', label: 'Completed', textColor: 'text-green-500' },
  failed: { icon: XCircle, color: 'bg-red-500', label: 'Failed', textColor: 'text-red-500' },
  cancelled: { icon: XCircle, color: 'bg-gray-500', label: 'Cancelled', textColor: 'text-gray-500' },
};

const Scraper = () => {
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    name: '',
    query: '',
    sources: [] as string[],
    extractPrices: true,
    extractContacts: false,
    recurrenceEnabled: false,
    recurrenceInterval: 'daily' as 'daily' | 'weekly' | 'monthly',
    recurrenceTime: '09:00',
  });
  const [filterStatus, setFilterStatus] = useState<JobStatus | 'all'>('all');

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch jobs
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['scrape-jobs', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('scrape_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ScrapeJob[];
    }
  });

  // Real-time subscription for job updates
  useEffect(() => {
    const channel = supabase
      .channel('scrape-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scrape_jobs'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['scrape-jobs'] });
          queryClient.invalidateQueries({ queryKey: ['scraper-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (job: typeof newJob) => {
      // Calculate next run time if recurrence is enabled
      let nextRunAt = null;
      if (job.recurrenceEnabled && job.recurrenceTime) {
        const [hours, minutes] = job.recurrenceTime.split(':').map(Number);
        const nextRun = new Date();
        nextRun.setHours(hours, minutes, 0, 0);
        
        // If time has passed today, set for tomorrow
        if (nextRun <= new Date()) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        nextRunAt = nextRun.toISOString();
      }

      const { data, error } = await supabase
        .from('scrape_jobs')
        .insert({
          name: job.name || null,
          query: job.query,
          sources: job.sources,
          extract_prices: job.extractPrices,
          extract_contacts: job.extractContacts,
          recurrence_enabled: job.recurrenceEnabled,
          recurrence_interval: job.recurrenceEnabled ? job.recurrenceInterval : null,
          recurrence_time: job.recurrenceEnabled ? job.recurrenceTime : null,
          next_run_at: nextRunAt,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrape-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['scraper-stats'] });
      toast.success('Scrape job created! The scraper will pick it up soon.');
      setIsNewJobOpen(false);
      setNewJob({
        name: '',
        query: '',
        sources: [],
        extractPrices: true,
        extractContacts: false,
        recurrenceEnabled: false,
        recurrenceInterval: 'daily',
        recurrenceTime: '09:00',
      });
    },
    onError: (error) => {
      console.error('Error creating job:', error);
      toast.error('Failed to create scrape job');
    }
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['scraper-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scrape_jobs')
        .select('status');

      if (error) throw error;

      const total = data.length;
      const pending = data.filter(j => j.status === 'pending').length;
      const running = data.filter(j => j.status === 'running').length;
      const completed = data.filter(j => j.status === 'completed').length;

      return { total, pending, running, completed };
    }
  });

  const StatusIcon = ({ status }: { status: JobStatus }) => {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;
    return <Icon className={`h-4 w-4 ${config.textColor}`} />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Globe className="h-10 w-10" />
            Web Scraper
          </h1>
          <p className="text-muted-foreground mt-2">
            Scrape websites, extract data, and track prices automatically
          </p>
        </div>
        <Dialog open={isNewJobOpen} onOpenChange={setIsNewJobOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              New Scrape
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Scrape Job</DialogTitle>
              <DialogDescription>
                Enter a URL or search term to scrape. The scraper will process it automatically.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Job Name (Optional)</Label>
                <Input
                  id="name"
                  value={newJob.name}
                  onChange={(e) => setNewJob(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Competitor pricing check"
                />
              </div>

              <div>
                <Label htmlFor="query">URL or Search Term *</Label>
                <Input
                  id="query"
                  value={newJob.query}
                  onChange={(e) => setNewJob(prev => ({ ...prev, query: e.target.value }))}
                  placeholder="https://example.com or 'iPhone 15 Pro'"
                  required
                />
              </div>

              <div>
                <Label className="mb-3 block">Search Sources</Label>
                <div className="grid grid-cols-2 gap-3">
                  {SEARCH_SOURCES.map(source => (
                    <div key={source.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={source.id}
                        checked={newJob.sources.includes(source.id)}
                        onCheckedChange={(checked) => {
                          setNewJob(prev => ({
                            ...prev,
                            sources: checked
                              ? [...prev.sources, source.id]
                              : prev.sources.filter(s => s !== source.id)
                          }));
                        }}
                      />
                      <Label htmlFor={source.id} className="cursor-pointer">
                        {source.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="extract-prices"
                    checked={newJob.extractPrices}
                    onCheckedChange={(checked) => 
                      setNewJob(prev => ({ ...prev, extractPrices: checked as boolean }))
                    }
                  />
                  <Label htmlFor="extract-prices" className="cursor-pointer">
                    Extract Prices
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="extract-contacts"
                    checked={newJob.extractContacts}
                    onCheckedChange={(checked) => 
                      setNewJob(prev => ({ ...prev, extractContacts: checked as boolean }))
                    }
                  />
                  <Label htmlFor="extract-contacts" className="cursor-pointer">
                    Extract Contact Information
                  </Label>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recurrence-enabled"
                    checked={newJob.recurrenceEnabled}
                    onCheckedChange={(checked) => 
                      setNewJob(prev => ({ ...prev, recurrenceEnabled: checked as boolean }))
                    }
                  />
                  <Label htmlFor="recurrence-enabled" className="cursor-pointer font-medium">
                    Schedule Recurring Scrapes
                  </Label>
                </div>

                {newJob.recurrenceEnabled && (
                  <div className="ml-6 space-y-3 border-l-2 border-primary/20 pl-4">
                    <div>
                      <Label htmlFor="recurrence-interval">Frequency</Label>
                      <select
                        id="recurrence-interval"
                        value={newJob.recurrenceInterval}
                        onChange={(e) => setNewJob(prev => ({ 
                          ...prev, 
                          recurrenceInterval: e.target.value as 'daily' | 'weekly' | 'monthly' 
                        }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="recurrence-time">Time of Day (24-hour format)</Label>
                      <Input
                        id="recurrence-time"
                        type="time"
                        value={newJob.recurrenceTime}
                        onChange={(e) => setNewJob(prev => ({ ...prev, recurrenceTime: e.target.value }))}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Next run: {(() => {
                          const [hours, minutes] = newJob.recurrenceTime.split(':').map(Number);
                          const nextRun = new Date();
                          nextRun.setHours(hours, minutes, 0, 0);
                          if (nextRun <= new Date()) {
                            nextRun.setDate(nextRun.getDate() + 1);
                          }
                          return nextRun.toLocaleString();
                        })()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={() => createJobMutation.mutate(newJob)}
                disabled={!newJob.query || createJobMutation.isPending}
                className="w-full"
                size="lg"
              >
                {createJobMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Scrape
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{stats?.pending || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Running
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats?.running || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats?.completed || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Scrape Jobs</CardTitle>
            <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="running">Running</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="failed">Failed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No scrape jobs yet. Create your first one!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => {
                const config = STATUS_CONFIG[job.status];
                return (
                  <Card
                    key={job.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/scraper/${job.id}`)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <StatusIcon status={job.status} />
                            <h3 className="font-semibold text-lg">
                              {job.name || job.query}
                            </h3>
                            <Badge variant="outline" className={config.color}>
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {job.query}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {job.sources.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {job.sources.length} source{job.sources.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                            {job.extract_prices && (
                              <Badge variant="secondary" className="text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Price Tracking
                              </Badge>
                            )}
                            {job.recurrence_enabled && (
                              <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/20">
                                <Repeat className="h-3 w-3 mr-1" />
                                {job.recurrence_interval}
                                {job.next_run_at && (
                                  <span className="ml-1">
                                    (Next: {new Date(job.next_run_at).toLocaleString()})
                                  </span>
                                )}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Created {new Date(job.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Scraper;
