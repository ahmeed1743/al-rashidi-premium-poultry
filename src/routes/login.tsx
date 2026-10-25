import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "تسجيل الدخول — طيور الرشيدي" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب! يمكنك الدخول الآن.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("أهلاً بك");
        nav({ to: "/admin" });
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="container mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl bg-gradient-card p-6 shadow-card">
          <h1 className="mb-1 text-2xl font-black">{mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}</h1>
          <p className="mb-6 text-sm text-muted-foreground">للوصول للوحة الإدارة فقط.</p>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>البريد الإلكتروني</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label>كلمة المرور</Label>
              <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-background" />
            </div>
            <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl bg-gradient-primary text-primary-foreground">
              {loading ? "جاري..." : mode === "login" ? "دخول" : "إنشاء حساب"}
            </Button>
          </form>
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="mt-4 w-full text-sm text-muted-foreground hover:text-primary"
          >
            {mode === "login" ? "ليس لديك حساب؟ سجل الآن" : "لديك حساب؟ سجل الدخول"}
          </button>
        </div>
      </div>
    </SiteLayout>
  );
}
