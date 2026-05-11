"use client";

import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useT } from "@/lib/i18n";

type FormData = { email: string; password: string };

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useT();

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().email(t.auth.invalidEmail),
        password: z.string().min(1, t.auth.passwordRequired),
      }),
    [t]
  );

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error(t.auth.invalidCredentials);
      } else {
        toast.success(t.auth.welcomeBackToast);
        router.push(callbackUrl);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1 mb-6">
            <span className="text-3xl font-bold text-yellow-500">Rafiq</span>
            <span className="text-3xl font-bold text-[#7B1C1C]">market</span>
          </Link>
          <h1 className="text-2xl font-bold">{t.auth.welcomeBack}</h1>
          <p className="text-muted-foreground mt-1">{t.auth.signInDesc}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email" className="mb-1.5 block">{t.auth.email}</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="mb-1.5 block">{t.auth.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Toggle password"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full cursor-pointer font-semibold" disabled={loading}>
              {loading ? t.auth.signingIn : t.auth.signIn}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t.auth.noAccount} </span>
            <Link href="/auth/register" className="text-primary font-medium hover:underline">
              {t.auth.signUp}
            </Link>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <p className="font-medium mb-1">{t.auth.demoAccounts}</p>
            <p>Buyer: buyer@uzum.uz / buyer123</p>
            <p>Seller: techstore@uzum.uz / seller123</p>
            <p>Admin: admin@uzum.uz / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
