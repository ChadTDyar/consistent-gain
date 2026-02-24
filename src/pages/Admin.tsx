import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ShieldCheck, BarChart3, Users, Star, FileText } from "lucide-react";
import { SEO } from "@/components/SEO";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminTestimonials } from "@/components/admin/AdminTestimonials";
import { AdminBlog } from "@/components/admin/AdminBlog";

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    setIsAdmin(roles?.some((r: any) => r.role === "admin") ?? false);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center space-y-4">
            <ShieldCheck className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-display font-bold">Access Denied</h2>
            <p className="text-muted-foreground">You don't have admin privileges.</p>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO title="Admin Dashboard - Momentum" description="Site administration and management" />
      <div className="min-h-screen bg-background py-8 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Site overview and management</p>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Users
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="flex items-center gap-2">
                <Star className="h-4 w-4" /> Testimonials
              </TabsTrigger>
              <TabsTrigger value="blog" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Blog
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <AdminStats />
            </TabsContent>

            <TabsContent value="users">
              <AdminUsers />
            </TabsContent>

            <TabsContent value="testimonials">
              <AdminTestimonials />
            </TabsContent>

            <TabsContent value="blog">
              <AdminBlog />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
