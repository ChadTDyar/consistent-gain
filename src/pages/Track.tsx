import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BodyMapPainReport } from "@/components/BodyMapPainReport";
import { ProgressTab } from "@/components/ProgressTab";
import { DailyContext } from "@/components/DailyContext";
import { SEO } from "@/components/SEO";

export default function Track() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/auth");
    };
    checkAuth();
  }, [navigate]);

  return (
    <>
      <SEO title="Track - Momentum" description="Track your pain, progress, and daily wellness." />
      <div className="min-h-screen bg-background-cream pb-24">
        <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border px-4 py-4">
          <h1 className="text-2xl font-display font-bold text-gradient">Track</h1>
        </header>

        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Tabs defaultValue="pain" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="pain">Body Map</TabsTrigger>
              <TabsTrigger value="context">Daily Check-in</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="pain">
              <BodyMapPainReport onComplete={() => {}} />
            </TabsContent>

            <TabsContent value="context">
              <DailyContext />
            </TabsContent>

            <TabsContent value="progress">
              <ProgressTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
