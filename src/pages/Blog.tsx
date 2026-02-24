import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import momentumLogo from "@/assets/momentum-logo.png";
import { format } from "date-fns";

export default function Blog() {
  const navigate = useNavigate();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, cover_image_url, author, published_at, meta_keywords")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <SEO
        title="Momentum Blog - Fitness Tips for Adults 40+ | Build Lasting Habits"
        description="Expert fitness advice for adults over 40. Learn how to build sustainable habits, stay consistent, and maintain your health as you age. No gimmicks, just real talk."
        keywords="fitness blog over 40, exercise tips adults 50+, fitness habits, workout consistency, health after 40"
      />
      <div className="min-h-screen bg-background-cream">
        {/* Header */}
        <nav className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
          <div className="container mx-auto px-6 md:px-8 max-w-7xl flex items-center justify-between py-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <img src={momentumLogo} alt="Momentum" className="h-8 w-auto" />
              <span className="font-display font-bold text-lg text-gradient">Momentum</span>
            </div>
            <Button size="sm" onClick={() => navigate("/auth")} className="btn-gradient">
              Get Started
            </Button>
          </div>
        </nav>

        <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 hover:bg-muted"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              The Momentum Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real advice for building fitness habits that stick — written for adults who've been around the block.
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6 md:p-8">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-8">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group border-border/50"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                >
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(post.published_at), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        5 min read
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-1 text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                      Read more <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-lg">
              No posts yet — check back soon!
            </p>
          )}
        </div>

        {/* Footer */}
        <footer className="py-12 border-t border-primary/10 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
              <p className="text-muted-foreground font-medium">
                Built by{" "}
                <a href="https://www.chadtdyar.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Chad T Dyar
                </a>
              </p>
              <nav className="flex gap-6 text-sm">
                <a href="/about" className="text-muted-foreground hover:text-primary transition-colors font-medium">Other Apps</a>
                <a href="mailto:support@momentumfit.app" className="text-muted-foreground hover:text-primary transition-colors font-medium">Contact</a>
                <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors font-medium">Privacy</a>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
