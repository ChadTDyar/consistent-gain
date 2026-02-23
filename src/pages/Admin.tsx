import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, XCircle, Trash2, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

interface Testimonial {
  id: string;
  display_name: string;
  location: string | null;
  quote: string;
  achievement: string | null;
  rating: number;
  is_approved: boolean;
  created_at: string;
  user_id: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasAdmin = roles?.some((r: any) => r.role === "admin") ?? false;
    setIsAdmin(hasAdmin);

    if (hasAdmin) {
      await loadTestimonials();
    }
    setLoading(false);
  };

  const loadTestimonials = async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading testimonials:", error);
      toast.error("Failed to load testimonials");
      return;
    }
    setTestimonials(data ?? []);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from("testimonials")
      .update({ is_approved: true })
      .eq("id", id);

    if (error) {
      toast.error("Failed to approve");
      return;
    }
    toast.success("Testimonial approved and now visible on the site");
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_approved: true } : t))
    );
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from("testimonials")
      .update({ is_approved: false })
      .eq("id", id);

    if (error) {
      toast.error("Failed to reject");
      return;
    }
    toast.success("Testimonial rejected");
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_approved: false } : t))
    );
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Testimonial deleted");
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
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

  const pending = testimonials.filter((t) => !t.is_approved);
  const approved = testimonials.filter((t) => t.is_approved);

  return (
    <>
      <SEO title="Admin Dashboard - Momentum" description="Manage testimonials and feedback" />
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage user testimonials</p>
            </div>
          </div>

          {/* Pending Reviews */}
          <section className="mb-10">
            <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
              <Badge variant="secondary" className="text-base px-3 py-1">
                {pending.length}
              </Badge>
              Pending Review
            </h2>
            {pending.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No testimonials awaiting review.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pending.map((t) => (
                  <TestimonialCard
                    key={t.id}
                    testimonial={t}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Approved */}
          <section>
            <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
              <Badge className="text-base px-3 py-1 bg-success text-success-foreground">
                {approved.length}
              </Badge>
              Approved & Live
            </h2>
            {approved.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No approved testimonials yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {approved.map((t) => (
                  <TestimonialCard
                    key={t.id}
                    testimonial={t}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function TestimonialCard({
  testimonial: t,
  onApprove,
  onReject,
  onDelete,
}: {
  testimonial: Testimonial;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {t.display_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-base">{t.display_name}</CardTitle>
              {t.location && <p className="text-sm text-muted-foreground">{t.location}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={t.is_approved ? "default" : "outline"}>
              {t.is_approved ? "Approved" : "Pending"}
            </Badge>
            <div className="flex gap-0.5">
              {[...Array(t.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-foreground italic">"{t.quote}"</p>
        {t.achievement && (
          <p className="text-sm text-primary font-semibold">🏆 {t.achievement}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Submitted {new Date(t.created_at).toLocaleDateString()}
        </p>
        <div className="flex gap-2 pt-2">
          {!t.is_approved && (
            <Button size="sm" onClick={() => onApprove(t.id)} className="btn-gradient">
              <CheckCircle className="h-4 w-4 mr-1" /> Approve
            </Button>
          )}
          {t.is_approved && (
            <Button size="sm" variant="outline" onClick={() => onReject(t.id)}>
              <XCircle className="h-4 w-4 mr-1" /> Unapprove
            </Button>
          )}
          <Button size="sm" variant="destructive" onClick={() => onDelete(t.id)}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
