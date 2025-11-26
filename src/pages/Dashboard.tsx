import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Sparkles,
  Plus,
  Layout,
  BarChart
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/hooks/use-notifications";

interface ContentStats {
  total: number;
  scheduled: number;
  published: number;
  draft: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<ContentStats>({
    total: 0,
    scheduled: 0,
    published: 0,
    draft: 0,
  });
  const [recentContent, setRecentContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { notifications } = useNotifications();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch content statistics
      const { data: content, error } = await supabase
        .from("content")
        .select("status, created_at, platform, topic, content, scheduled_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Calculate stats
      const total = content?.length || 0;
      const scheduled = content?.filter((c) => c.status === "scheduled").length || 0;
      const published = content?.filter((c) => c.status === "published").length || 0;
      const draft = content?.filter((c) => c.status === "draft").length || 0;

      setStats({ total, scheduled, published, draft });
      setRecentContent(content?.slice(0, 5) || []);
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
      color: "text-blue-500",
    },
    {
      title: "Scheduled",
      value: stats.scheduled,
      icon: Calendar,
      description: "Content ready to publish",
      color: "text-orange-500",
    },
    {
      title: "Published",
      value: stats.published,
      icon: CheckCircle2,
      description: "Successfully published",
      color: "text-green-500",
    },
    {
      title: "Drafts",
      value: stats.draft,
      icon: Clock,
      description: "Work in progress",
      color: "text-gray-500",
    },
  ];

  const quickActions = [
    {
      title: "Generate Content",
      description: "Create new social media content",
      icon: Sparkles,
      link: "/content",
      color: "bg-primary",
    },
    {
      title: "View Templates",
      description: "Browse saved templates",
      icon: Layout,
      link: "/templates",
      color: "bg-secondary",
    },
    {
      title: "Check Analytics",
      description: "View performance metrics",
      icon: BarChart,
      link: "/analytics",
      color: "bg-accent",
    },
    {
      title: "Schedule Content",
      description: "Plan your content calendar",
      icon: Calendar,
      link: "/calendar",
      color: "bg-muted",
    },
  ];

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "twitter":
        return "bg-blue-500";
      case "linkedin":
        return "bg-blue-700";
      case "instagram":
        return "bg-pink-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your content.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? "..." : stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.link}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                      <action.icon className="h-6 w-6 text-background" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Content
              </CardTitle>
              <CardDescription>
                Your latest content creations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {loading ? (
                  <div className="text-center text-muted-foreground py-8">
                    Loading...
                  </div>
                ) : recentContent.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No content yet</p>
                    <Link to="/content">
                      <Button className="mt-4" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Content
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentContent.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge
                            className={`${getPlatformColor(item.platform)} text-white`}
                          >
                            {item.platform}
                          </Badge>
                          <Badge variant="outline">{item.status}</Badge>
                        </div>
                        <h4 className="font-medium mb-1">{item.topic}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
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
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {notifications.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={`border rounded-lg p-4 ${
                          !notification.is_read ? "bg-accent/30" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">
                            {notification.type === "success"
                              ? "✅"
                              : notification.type === "warning"
                              ? "⚠️"
                              : notification.type === "error"
                              ? "❌"
                              : "ℹ️"}
                          </span>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
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
    </div>
  );
}
