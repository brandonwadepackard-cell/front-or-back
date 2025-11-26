import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { StatCardSkeleton, ChartSkeleton, ContentListSkeleton, QuickActionSkeleton } from "@/components/skeletons/CardSkeleton";
import { PullToRefresh } from "@/components/PullToRefresh";
import { LongPressContextMenu } from "@/components/LongPressContextMenu";
import { DoubleTapAction } from "@/components/DoubleTapAction";
import { 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Sparkles,
  Plus,
  Layout,
  BarChart,
  Download,
  FileDown,
  ArrowUpRight,
  Edit,
  Trash2,
  Copy,
  Eye,
  Heart,
  Archive
} from "lucide-react";
import { formatDistanceToNow, format, subDays, startOfDay, endOfDay } from "date-fns";
import { useNotifications } from "@/hooks/use-notifications";
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCSV, exportContentToPDF } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";

interface ContentStats {
  total: number;
  scheduled: number;
  published: number;
  draft: number;
}

interface ChartData {
  date: string;
  content: number;
}

interface PlatformData {
  name: string;
  value: number;
}

const COLORS = {
  Twitter: "#1DA1F2",
  LinkedIn: "#0A66C2",
  Instagram: "#E4405F",
  default: "hsl(var(--primary))",
};

export default function Dashboard() {
  const [stats, setStats] = useState<ContentStats>({
    total: 0,
    scheduled: 0,
    published: 0,
    draft: 0,
  });
  const [recentContent, setRecentContent] = useState<any[]>([]);
  const [allContent, setAllContent] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [platformData, setPlatformData] = useState<PlatformData[]>([]);
  const [loading, setLoading] = useState(true);
  const { notifications } = useNotifications();
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: content, error } = await supabase
        .from("content")
        .select("status, created_at, platform, topic, content, scheduled_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const total = content?.length || 0;
      const scheduled = content?.filter((c) => c.status === "scheduled").length || 0;
      const published = content?.filter((c) => c.status === "published").length || 0;
      const draft = content?.filter((c) => c.status === "draft").length || 0;

      setStats({ total, scheduled, published, draft });
      setRecentContent(content?.slice(0, 5) || []);
      setAllContent(content || []);

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return {
          date: format(date, "MMM dd"),
          content: 0,
        };
      });

      content?.forEach((item) => {
        const itemDate = new Date(item.created_at);
        const dayIndex = last7Days.findIndex((day) => {
          const checkDate = subDays(new Date(), 6 - last7Days.indexOf(day));
          return (
            startOfDay(itemDate).getTime() >= startOfDay(checkDate).getTime() &&
            endOfDay(itemDate).getTime() <= endOfDay(checkDate).getTime()
          );
        });
        if (dayIndex !== -1) {
          last7Days[dayIndex].content += 1;
        }
      });

      setChartData(last7Days);

      const platformCounts: Record<string, number> = {};
      content?.forEach((item) => {
        platformCounts[item.platform] = (platformCounts[item.platform] || 0) + 1;
      });

      const platformArray = Object.entries(platformCounts).map(([name, value]) => ({
        name,
        value,
      }));

      setPlatformData(platformArray);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Content",
      value: stats.total,
      icon: FileText,
      description: "All time content created",
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Scheduled",
      value: stats.scheduled,
      icon: Calendar,
      description: "Content ready to publish",
      gradient: "from-orange-500 to-amber-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Published",
      value: stats.published,
      icon: CheckCircle2,
      description: "Successfully published",
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Drafts",
      value: stats.draft,
      icon: Clock,
      description: "Work in progress",
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  const quickActions = [
    {
      title: "Generate Content",
      description: "Create new social media content",
      icon: Sparkles,
      link: "/content",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "View Templates",
      description: "Browse saved templates",
      icon: Layout,
      link: "/templates",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Check Analytics",
      description: "View performance metrics",
      icon: BarChart,
      link: "/analytics",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Schedule Content",
      description: "Plan your content calendar",
      icon: Calendar,
      link: "/calendar",
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  const getPlatformBadge = (platform: string) => {
    const styles: Record<string, string> = {
      twitter: "bg-blue-500 text-white border-0",
      linkedin: "bg-blue-700 text-white border-0",
      instagram: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0",
    };
    return styles[platform.toLowerCase()] || "bg-muted";
  };

  const handleExport = (format: "csv" | "pdf") => {
    if (format === "csv") {
      exportToCSV(allContent);
      toast({
        title: "Export Successful",
        description: "Content data exported to CSV",
      });
    } else {
      exportContentToPDF(allContent);
      toast({
        title: "Export Successful",
        description: "Content data exported to PDF",
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground variant="mesh" />
      <PullToRefresh onRefresh={fetchDashboardData}>
        <div className="container mx-auto px-6 py-12 space-y-8 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Welcome back! Here's what's happening with your content.
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          ) : (
            statCards.map((stat, index) => (
            <LongPressContextMenu
              key={stat.title}
              menuItems={[
                {
                  icon: <Eye />,
                  label: 'View Details',
                  action: () => {
                    toast({
                      title: stat.title,
                      description: `${stat.value} ${stat.description.toLowerCase()}`,
                    });
                  },
                },
                {
                  icon: <FileDown />,
                  label: 'Export Data',
                  action: () => {
                    const filteredContent = allContent.filter(c => {
                      if (stat.title === 'Total Content') return true;
                      return c.status === stat.title.toLowerCase().replace('s', '');
                    });
                    exportToCSV(filteredContent);
                    toast({
                      title: "Export Successful",
                      description: `${stat.title} data exported`,
                    });
                  },
                },
                {
                  icon: <BarChart />,
                  label: 'View Analytics',
                  action: () => {
                    toast({
                      title: "Analytics",
                      description: "Detailed analytics coming soon",
                    });
                  },
                },
              ]}
            >
              <Card 
                className="overflow-hidden hover:-translate-y-1 transition-all duration-300 bg-card/80 backdrop-blur-sm border-0"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className={`text-4xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                    {loading ? "..." : stat.value}
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {stat.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </LongPressContextMenu>
          ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <QuickActionSkeleton key={i} />
              ))
            ) : (
              quickActions.map((action, index) => (
              <Link key={action.title} to={action.link}>
                <Card className="group hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full border-0 bg-card/80 backdrop-blur-sm overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`h-1 bg-gradient-to-r ${action.gradient}`} />
                  <CardHeader className="pb-3">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                      <action.icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {action.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {action.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              {/* Content Creation Over Time */}
              <Card className="border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Content Creation Trend</CardTitle>
              <CardDescription>Last 7 days activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="content"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    name="Content Created"
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Platform Distribution */}
          <Card className="border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Platform Distribution</CardTitle>
              <CardDescription>Content by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.default}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
            </>
          )}
        </div>

        {/* Recent Activity & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Content */}
          <Card className="border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TrendingUp className="h-6 w-6" />
                Recent Content
              </CardTitle>
              <CardDescription>
                Your latest content creations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {loading ? (
                  <ContentListSkeleton />
                ) : recentContent.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No content yet</p>
                    <p className="text-sm mb-4">Start creating your first piece of content</p>
                    <Link to="/content">
                      <Button className="shadow-lg">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Content
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentContent.map((item) => (
                      <LongPressContextMenu
                        key={item.id}
                        menuItems={[
                          {
                            icon: <Heart />,
                            label: favorites.has(item.id) ? 'Unfavorite' : 'Favorite',
                            action: () => {
                              setFavorites(prev => {
                                const newFavorites = new Set(prev);
                                if (newFavorites.has(item.id)) {
                                  newFavorites.delete(item.id);
                                  toast({
                                    title: "Removed from Favorites",
                                  });
                                } else {
                                  newFavorites.add(item.id);
                                  toast({
                                    title: "Added to Favorites",
                                  });
                                }
                                return newFavorites;
                              });
                            },
                          },
                          {
                            icon: <Eye />,
                            label: 'View Details',
                            action: () => {
                              toast({
                                title: "Content Details",
                                description: item.content,
                              });
                            },
                          },
                          {
                            icon: <Edit />,
                            label: 'Edit',
                            action: () => {
                              toast({
                                title: "Edit Mode",
                                description: "Edit functionality coming soon",
                              });
                            },
                          },
                          {
                            icon: <Copy />,
                            label: 'Duplicate',
                            action: () => {
                              toast({
                                title: "Content Duplicated",
                                description: "Created a copy of this content",
                              });
                            },
                          },
                          {
                            icon: <Archive />,
                            label: 'Archive',
                            action: async () => {
                              const { error } = await supabase
                                .from('content')
                                .update({ status: 'archived' })
                                .eq('id', item.id);
                              
                              if (!error) {
                                toast({
                                  title: "Content Archived",
                                  description: "Content moved to archive",
                                });
                                fetchDashboardData();
                              }
                            },
                          },
                          {
                            icon: <Trash2 />,
                            label: 'Delete',
                            action: async () => {
                              const { error } = await supabase
                                .from('content')
                                .delete()
                                .eq('id', item.id);
                              
                              if (!error) {
                                toast({
                                  title: "Content Deleted",
                                  description: "Content removed successfully",
                                });
                                fetchDashboardData();
                              }
                            },
                            variant: 'destructive' as const,
                          },
                        ]}
                      >
                        <DoubleTapAction
                          onDoubleTap={() => {
                            setFavorites(prev => {
                              const newFavorites = new Set(prev);
                              if (newFavorites.has(item.id)) {
                                newFavorites.delete(item.id);
                                toast({
                                  title: "Removed from Favorites",
                                  description: "Double-tap again to favorite",
                                });
                              } else {
                                newFavorites.add(item.id);
                                toast({
                                  title: "Added to Favorites",
                                  description: "Double-tap again to remove",
                                });
                              }
                              return newFavorites;
                            });
                          }}
                          icon={<Heart className="fill-current" />}
                          feedbackText={favorites.has(item.id) ? "Unfavorited!" : "Favorited!"}
                        >
                          <div className="border border-border/50 rounded-xl p-4 hover:bg-accent/50 hover:border-primary/50 transition-all duration-200 relative">
                            {favorites.has(item.id) && (
                              <Heart className="absolute top-2 right-2 h-4 w-4 fill-red-500 text-red-500" />
                            )}
                            <div className="flex items-start justify-between mb-3">
                              <Badge className={getPlatformBadge(item.platform)}>
                                {item.platform}
                              </Badge>
                              <Badge variant="outline" className="capitalize">{item.status}</Badge>
                            </div>
                            <h4 className="font-semibold mb-2 text-base">{item.topic}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {item.content}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(item.created_at), {
                                addSuffix: true,
                              })}
                              {item.scheduled_at && (
                                <>
                                  <span>•</span>
                                  <Calendar className="h-3 w-3" />
                                  Scheduled for{" "}
                                  {formatDistanceToNow(new Date(item.scheduled_at), {
                                    addSuffix: true,
                                  })}
                                </>
                              )}
                            </div>
                          </div>
                        </DoubleTapAction>
                      </LongPressContextMenu>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Clock className="h-6 w-6" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {notifications.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={`border border-border/50 rounded-xl p-4 transition-all duration-200 ${
                          !notification.is_read ? "bg-accent/30 border-primary/30" : "hover:bg-accent/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl flex-shrink-0">
                            {notification.type === "success"
                              ? "✅"
                              : notification.type === "warning"
                              ? "⚠️"
                              : notification.type === "error"
                              ? "❌"
                              : "ℹ️"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold mb-1 text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(notification.created_at),
                                { addSuffix: true }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
      </PullToRefresh>
    </div>
  );
}
