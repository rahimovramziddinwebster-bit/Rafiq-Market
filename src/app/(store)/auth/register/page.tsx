"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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

type FormData = { name: string; email: string; password: string };

export default function RegisterPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useT();

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t.auth.nameTooShort),
        email: z.string().email(t.auth.invalidEmail),
        password: z.string().min(6, t.auth.passwordTooShort),
      }),
    [t]
  );

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role: "BUYER" }),
      });

      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? t.auth.registrationFailed);
        return;
      }

      toast.success(t.auth.accountCreated);
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      router.push("/");
      router.refresh();
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
          <h1 className="text-2xl font-bold">{t.auth.createAccount}</h1>
          <p className="text-muted-foreground mt-1">{t.auth.createAccountDesc}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name" className="mb-1.5 block">{t.auth.fullName}</Label>
              <Input id="name" {...register("name")} placeholder="John Doe" autoComplete="name" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="mb-1.5 block">{t.auth.email}</Label>
              <Input id="email" type="email" {...register("email")} placeholder="you@example.com" autoComplete="email" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="mb-1.5 block">{t.auth.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  {...register("password")}
                  placeholder={t.auth.minChars}
                  autoComplete="new-password"
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
              {loading ? t.auth.creatingAccount : t.auth.createAccountBtn}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t.auth.haveAccount} </span>
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              {t.auth.signIn}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
