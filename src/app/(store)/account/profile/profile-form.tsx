"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { useT } from "@/lib/i18n";

type ProfileFormData = { name: string; email: string };
type PwdFormData = { currentPassword: string; newPassword: string; confirmPassword: string };

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function ProfileForm({ user }: { user: User }) {
  const [saving, setSaving] = useState(false);
  const t = useT();

  const profileSchema = useMemo(
    () => z.object({ name: z.string().min(2), email: z.string().email() }),
    []
  );

  const pwdSchema = useMemo(
    () =>
      z
        .object({
          currentPassword: z.string().min(1),
          newPassword: z.string().min(6),
          confirmPassword: z.string(),
        })
        .refine((d) => d.newPassword === d.confirmPassword, {
          message: t.profile.passwordMismatch,
          path: ["confirmPassword"],
        }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name ?? "", email: user.email ?? "" },
  });

  const {
    register: regPwd,
    handleSubmit: handlePwd,
    formState: { errors: pwdErrors },
    reset: resetPwd,
  } = useForm<PwdFormData>({ resolver: zodResolver(pwdSchema) });

  const onProfile = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success(t.profile.updated);
    } catch {
      toast.error(t.profile.updateFailed);
    } finally {
      setSaving(false);
    }
  };

  const onPassword = async (data: PwdFormData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        toast.error(error ?? t.profile.passwordFailed);
        return;
      }
      toast.success(t.profile.passwordUpdated);
      resetPwd();
    } catch {
      toast.error(t.profile.passwordFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-lg">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.image ?? ""} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
            {user.name?.charAt(0).toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="font-semibold mb-4">{t.profile.personalInfo}</h2>
        <form onSubmit={handleSubmit(onProfile)} className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-1.5 block">{t.profile.fullName}</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email" className="mb-1.5 block">{t.profile.email}</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <Button type="submit" disabled={saving} className="cursor-pointer">
            {saving ? t.profile.saving : t.profile.saveChanges}
          </Button>
        </form>
      </div>

      <Separator />

      <div>
        <h2 className="font-semibold mb-4">{t.profile.changePassword}</h2>
        <form onSubmit={handlePwd(onPassword)} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword" className="mb-1.5 block">{t.profile.currentPassword}</Label>
            <Input id="currentPassword" type="password" {...regPwd("currentPassword")} />
            {pwdErrors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">{pwdErrors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="newPassword" className="mb-1.5 block">{t.profile.newPassword}</Label>
            <Input id="newPassword" type="password" {...regPwd("newPassword")} />
            {pwdErrors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{pwdErrors.newPassword.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="mb-1.5 block">{t.profile.confirmPassword}</Label>
            <Input id="confirmPassword" type="password" {...regPwd("confirmPassword")} />
            {pwdErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{pwdErrors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" disabled={saving} variant="outline" className="cursor-pointer">
            {saving ? t.profile.updating : t.profile.updatePassword}
          </Button>
        </form>
      </div>
    </div>
  );
}

export function ProfileTitle() {
  const t = useT();
  return <h1 className="text-xl font-bold mb-6">{t.profile.pageTitle}</h1>;
}
