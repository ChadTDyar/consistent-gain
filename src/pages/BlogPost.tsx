import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import momentumLogo from "@/assets/momentum-logo.png";
import { format } from "date-fns";
import DOMPurify from "dompurify";

export default function BlogPost() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Post not found");
      return data;
    },
    enabled: !!slug,
  });

  if (error) {
    return (
      <div className="min-h-screen bg-background-cream flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-display font-bold text-foreground">Post not found</h1>
          <Button onClick={() => navigate("/blog")}>Back to Blog</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {post && (
        <SEO
          title={post.meta_title || post.title}
          description={post.meta_description || post.excerpt}
          keywords={post.meta_keywords || ""}
          schema={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            author: { "@type": "Person", name: post.author },
            datePublished: post.published_at,
            dateModified: post.updated_at,
          }}
        />
      )}
      <div className="min-h-screen bg-background-cream">
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

        <article className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-3xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/blog")}
            className="mb-8 hover:bg-muted"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : post ? (
            <>
              <header className="mb-10">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {post.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(post.published_at), "MMMM d, yyyy")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    5 min read
                  </span>
                </div>
              </header>

              <div
                className="prose prose-lg max-w-none text-foreground
                  prose-headings:font-display prose-headings:text-foreground
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground
                  prose-li:text-muted-foreground
                  prose-blockquote:border-primary prose-blockquote:text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(post.content, {
                    ALLOWED_TAGS: ['h2', 'h3', 'h4', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'blockquote', 'br', 'span'],
                    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
                  }),
                }}
              />

              {/* CTA */}
              <div className="mt-16 p-8 rounded-xl text-center text-white shadow-xl" style={{ background: 'var(--gradient-primary)' }}>
                <h3 className="text-2xl font-display font-bold mb-3">Ready to build your own momentum?</h3>
                <p className="text-white/90 mb-6">Start tracking your fitness habits today — free for up to 3 goals.</p>
                <Button
                  onClick={() => navigate("/auth")}
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white hover:scale-105 transition-all font-semibold"
                >
                  Start Your Journey
                </Button>
              </div>
            </>
          ) : null}
        </article>

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
                <a href="/blog" className="text-muted-foreground hover:text-primary transition-colors font-medium">Blog</a>
                <a href="/story" className="text-muted-foreground hover:text-primary transition-colors font-medium">Our Story</a>
                <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors font-medium">Privacy</a>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
