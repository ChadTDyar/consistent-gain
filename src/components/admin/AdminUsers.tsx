import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, ShieldCheck, Search, Crown } from "lucide-react";
import { toast } from "sonner";

interface UserRow {
  id: string;
  name: string | null;
  is_premium: boolean | null;
  subscription_status: string | null;
  created_at: string | null;
  roles: string[];
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, name, is_premium, subscription_status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load users");
      setLoading(false);
      return;
    }

    const { data: roles } = await supabase.from("user_roles").select("user_id, role");

    const roleMap = new Map<string, string[]>();
    roles?.forEach((r) => {
      const existing = roleMap.get(r.user_id) ?? [];
      existing.push(r.role);
      roleMap.set(r.user_id, existing);
    });

    setUsers(
      (profiles ?? []).map((p) => ({
        ...p,
        roles: roleMap.get(p.id) ?? [],
      }))
    );
    setLoading(false);
  };

  const toggleAdmin = async (userId: string, hasAdmin: boolean) => {
    if (hasAdmin) {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");
      if (error) {
        toast.error("Failed to remove admin role");
        return;
      }
      toast.success("Admin role removed");
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });
      if (error) {
        toast.error("Failed to add admin role");
        return;
      }
      toast.success("Admin role granted");
    }
    await loadUsers();
  };

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <Card><CardContent className="py-8 text-center text-muted-foreground">Loading users...</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => {
                const hasAdmin = user.roles.includes("admin");
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {(user.name ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.name || "Unnamed"}</p>
                          <p className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.is_premium ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                          <Crown className="h-3 w-3 mr-1" /> Premium
                        </Badge>
                      ) : (
                        <Badge variant="outline">Free</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.roles.length === 0 && <Badge variant="secondary">user</Badge>}
                        {user.roles.map((r) => (
                          <Badge key={r} variant={r === "admin" ? "default" : "secondary"}>
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={hasAdmin ? "destructive" : "outline"}
                        onClick={() => toggleAdmin(user.id, hasAdmin)}
                      >
                        {hasAdmin ? (
                          <><Shield className="h-4 w-4 mr-1" /> Revoke Admin</>
                        ) : (
                          <><ShieldCheck className="h-4 w-4 mr-1" /> Make Admin</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
