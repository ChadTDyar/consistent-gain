import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

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

export function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load testimonials");
    } else {
      setTestimonials(data ?? []);
    }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from("testimonials").update({ is_approved: true }).eq("id", id);
    if (error) return toast.error("Failed to approve");
    toast.success("Testimonial approved");
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, is_approved: true } : t)));
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from("testimonials").update({ is_approved: false }).eq("id", id);
    if (error) return toast.error("Failed to reject");
    toast.success("Testimonial rejected");
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, is_approved: false } : t)));
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) return toast.error("Failed to delete");
    toast.success("Testimonial deleted");
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) {
    return <Card><CardContent className="py-8 text-center text-muted-foreground">Loading testimonials...</CardContent></Card>;
  }

  const pending = testimonials.filter((t) => !t.is_approved);
  const approved = testimonials.filter((t) => t.is_approved);

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Badge variant="secondary" className="px-2 py-0.5">{pending.length}</Badge>
          Pending Review
        </h3>
        {pending.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-6 text-center text-muted-foreground">No pending testimonials.</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pending.map((t) => (
              <TestimonialItem key={t.id} testimonial={t} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 px-2 py-0.5">{approved.length}</Badge>
          Approved & Live
        </h3>
        {approved.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-6 text-center text-muted-foreground">No approved testimonials.</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {approved.map((t) => (
              <TestimonialItem key={t.id} testimonial={t} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TestimonialItem({
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
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {t.display_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-sm">{t.display_name}</CardTitle>
              {t.location && <p className="text-xs text-muted-foreground">{t.location}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={t.is_approved ? "default" : "outline"} className="text-xs">
              {t.is_approved ? "Live" : "Pending"}
            </Badge>
            <div className="flex gap-0.5">
              {[...Array(t.rating)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-primary text-primary" />
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm italic text-foreground">"{t.quote}"</p>
        {t.achievement && <p className="text-xs text-primary font-semibold">🏆 {t.achievement}</p>}
        <p className="text-xs text-muted-foreground">Submitted {new Date(t.created_at).toLocaleDateString()}</p>
        <div className="flex gap-2 pt-1">
          {!t.is_approved && (
            <Button size="sm" onClick={() => onApprove(t.id)}>
              <CheckCircle className="h-3 w-3 mr-1" /> Approve
            </Button>
          )}
          {t.is_approved && (
            <Button size="sm" variant="outline" onClick={() => onReject(t.id)}>
              <XCircle className="h-3 w-3 mr-1" /> Unapprove
            </Button>
          )}
          <Button size="sm" variant="destructive" onClick={() => onDelete(t.id)}>
            <Trash2 className="h-3 w-3 mr-1" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
