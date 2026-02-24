import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  published_at: string;
  is_published: boolean;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  cover_image_url: string | null;
  updated_at: string;
}

const emptyPost = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author: "Chad T Dyar",
  is_published: false,
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  cover_image_url: "",
};

export function AdminBlog() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyPost);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (post: typeof form & { id?: string }) => {
      const payload = {
        title: post.title.trim(),
        slug: post.slug.trim(),
        excerpt: post.excerpt.trim(),
        content: post.content,
        author: post.author.trim(),
        is_published: post.is_published,
        meta_title: post.meta_title?.trim() || null,
        meta_description: post.meta_description?.trim() || null,
        meta_keywords: post.meta_keywords?.trim() || null,
        cover_image_url: post.cover_image_url?.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (post.id) {
        const { error } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", post.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({ title: editingPost ? "Post updated" : "Post created" });
      closeDialog();
    },
    onError: (err: any) => {
      toast({ title: "Error saving post", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({ title: "Post deleted" });
    },
    onError: (err: any) => {
      toast({ title: "Error deleting post", description: err.message, variant: "destructive" });
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from("blog_posts")
        .update({ is_published, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({ title: "Publish status updated" });
    },
  });

  const openCreate = () => {
    setEditingPost(null);
    setForm(emptyPost);
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      is_published: post.is_published,
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
      meta_keywords: post.meta_keywords || "",
      cover_image_url: post.cover_image_url || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPost(null);
    setForm(emptyPost);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: editingPost ? f.slug : generateSlug(title),
    }));
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.slug.trim() || !form.excerpt.trim() || !form.content.trim()) {
      toast({ title: "Missing required fields", description: "Title, slug, excerpt, and content are required.", variant: "destructive" });
      return;
    }
    saveMutation.mutate(editingPost ? { ...form, id: editingPost.id } : form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Blog Posts</h3>
          <p className="text-sm text-muted-foreground">{posts?.length ?? 0} total posts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="btn-gradient">
              <Plus className="h-4 w-4 mr-2" /> New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? "Edit Post" : "New Blog Post"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="How to Build Fitness Habits After 40" />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="how-to-build-fitness-habits-after-40" />
              </div>
              <div>
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea id="excerpt" value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} placeholder="A short summary for the blog listing..." rows={2} />
              </div>
              <div>
                <Label htmlFor="content">Content (HTML) *</Label>
                <Textarea id="content" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="<h2>Introduction</h2><p>Your content here...</p>" rows={10} className="font-mono text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input id="author" value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="cover_image_url">Cover Image URL</Label>
                  <Input id="cover_image_url" value={form.cover_image_url} onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input id="meta_title" value={form.meta_title} onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))} placeholder="SEO title (defaults to post title)" />
              </div>
              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea id="meta_description" value={form.meta_description} onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))} placeholder="SEO description..." rows={2} />
              </div>
              <div>
                <Label htmlFor="meta_keywords">Meta Keywords</Label>
                <Input id="meta_keywords" value={form.meta_keywords} onChange={(e) => setForm((f) => ({ ...f, meta_keywords: e.target.value }))} placeholder="fitness, habits, over 40" />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_published} onCheckedChange={(checked) => setForm((f) => ({ ...f, is_published: checked }))} />
                <Label>Publish immediately</Label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button onClick={handleSave} disabled={saveMutation.isPending} className="btn-gradient">
                  {saveMutation.isPending ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading posts...</p>
      ) : !posts?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No blog posts yet. Create your first one!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="border-border/50">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground truncate">{post.title}</h4>
                    <Badge variant={post.is_published ? "default" : "secondary"} className="shrink-0">
                      {post.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">/blog/{post.slug}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePublish.mutate({ id: post.id, is_published: !post.is_published })}
                    title={post.is_published ? "Unpublish" : "Publish"}
                  >
                    {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm("Delete this post permanently?")) {
                        deleteMutation.mutate(post.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
