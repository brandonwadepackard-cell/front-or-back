import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, TrendingUp, Layout, Download, FileDown } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportAnalyticsToCSV, exportAnalyticsToPDF } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";
import { ScrollReveal } from "@/components/ScrollReveal";

const Analytics = () => {
  const { toast } = useToast();
  
  const { data: content } = useQuery({
    queryKey: ["analytics-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Calculate metrics
  const totalContent = content?.length || 0;
  const draftContent = content?.filter(c => c.status === "draft").length || 0;
  const publishedContent = content?.filter(c => c.status === "published").length || 0;
  const scheduledContent = content?.filter(c => c.status === "scheduled").length || 0;

  // Status breakdown data
  const statusData = [
    { name: "Draft", value: draftContent, color: "hsl(var(--muted))" },
    { name: "Scheduled", value: scheduledContent, color: "hsl(var(--accent))" },
    { name: "Published", value: publishedContent, color: "hsl(var(--primary))" },
  ].filter(item => item.value > 0);

  // Platform distribution
  const platformCounts = content?.reduce((acc, item) => {
    acc[item.platform] = (acc[item.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const platformData = Object.entries(platformCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--muted))",
  ];

  // Trend data - last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 6 - i));
    const dateStr = format(date, "yyyy-MM-dd");
    const count = content?.filter(c => 
      format(new Date(c.created_at), "yyyy-MM-dd") === dateStr
    ).length || 0;
    
    return {
      date: format(date, "MMM dd"),
      count,
    };
  });

  const chartConfig = {
    count: {
      label: "Content Generated",
      color: "hsl(var(--primary))",
    },
  };

  const handleExport = (format: "csv" | "pdf") => {
    const analyticsData = {
      totalContent,
      scheduled: scheduledContent,
      published: publishedContent,
      draft: draftContent,
      platformData,
      trendData: last7Days.map(d => ({ date: d.date, content: d.count })),
    };

    if (format === "csv") {
      exportAnalyticsToCSV(analyticsData);
      toast({
        title: "Export Successful",
        description: "Analytics data exported to CSV",
      });
    } else {
      exportAnalyticsToPDF(analyticsData);
      toast({
        title: "Export Successful",
        description: "Analytics data exported to PDF",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <ScrollReveal variant="fade-up">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Track your content performance and generation trends
              </p>
            </div>
          
          {/* Export Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")} className="gap-2">
                <FileDown className="h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2">
                <FileDown className="h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </ScrollReveal>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <ScrollReveal variant="fade-up" delay={0.1}>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Content</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalContent}</div>
              <p className="text-xs text-muted-foreground">
                All generated content
              </p>
            </CardContent>
          </Card>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.2}>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{scheduledContent}</div>
              <p className="text-xs text-muted-foreground">
                Ready to publish
              </p>
            </CardContent>
          </Card>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.3}>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{publishedContent}</div>
              <p className="text-xs text-muted-foreground">
                Live content
              </p>
            </CardContent>
          </Card>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.4}>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Layout className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{draftContent}</div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>
          </ScrollReveal>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <ScrollReveal variant="fade-right">
            <Card>
            <CardHeader>
              <CardTitle>Generation Trend</CardTitle>
              <CardDescription>Content generated over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <AreaChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.2)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
          </ScrollReveal>

          <ScrollReveal variant="fade-left">
            <Card>
            <CardHeader>
              <CardTitle>Platform Distribution</CardTitle>
              <CardDescription>Content generated by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          </ScrollReveal>
        </div>

        {/* Status Breakdown */}
        <ScrollReveal variant="scale">
          <Card>
          <CardHeader>
            <CardTitle>Content Status Breakdown</CardTitle>
            <CardDescription>Distribution of content by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    name="Count"
                    radius={[8, 8, 0, 0]}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        </ScrollReveal>

        {/* Recent Activity */}
        <ScrollReveal variant="fade-up">
          <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest content generated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {content?.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{item.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.platform} • {format(new Date(item.created_at), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === "published" 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
              {!content || content.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No content generated yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Analytics;