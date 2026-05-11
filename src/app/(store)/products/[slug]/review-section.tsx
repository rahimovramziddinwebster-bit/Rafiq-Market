"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import Link from "next/link";
import { useT } from "@/lib/i18n";

type FormData = { rating: number; comment?: string };

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: { id: string; name: string | null; avatar: string | null };
}

interface Props {
  productId: string;
  reviews: Review[];
  rating: number;
  reviewCount: number;
  ratingDist: { star: number; count: number }[];
}

export function ReviewSection({ productId, reviews: initial, rating, reviewCount, ratingDist }: Props) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const t = useT();

  const schema = useMemo(
    () =>
      z.object({
        rating: z.number().int().min(1, t.productDetail.submitReview).max(5),
        comment: z.string().optional(),
      }),
    [t]
  );

  const { handleSubmit, setValue, watch, register, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0 },
  });
  const currentRating = watch("rating");

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...data }),
      });
      if (!res.ok) throw new Error();
      const review = await res.json();
      setReviews((prev) => [
        {
          ...review,
          createdAt: new Date(review.createdAt),
          user: {
            id: (session?.user as { id?: string })?.id ?? "",
            name: session?.user?.name ?? null,
            avatar: session?.user?.image ?? null,
          },
        },
        ...prev.filter((r) => r.user.id !== (session?.user as { id?: string })?.id),
      ]);
      reset();
      toast.success(t.productDetail.submitReview);
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">{t.productDetail.customerReviews}</h2>

      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="text-center">
          <div className="text-5xl font-bold text-foreground mb-2">{rating.toFixed(1)}</div>
          <StarRating value={Math.round(rating)} readonly size="lg" />
          <p className="text-sm text-muted-foreground mt-2">{reviewCount} {t.productDetail.reviews}</p>
        </div>

        <div className="md:col-span-2 space-y-2">
          {ratingDist.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-sm w-4 text-right">{star}</span>
              <StarRating value={star} readonly size="sm" />
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: reviewCount > 0 ? `${(count / reviewCount) * 100}%` : "0%" }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-6">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {session ? (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-muted/30 rounded-xl p-5 mb-8 border border-border">
          <h3 className="font-semibold mb-4">{t.productDetail.writeReview}</h3>
          <div className="mb-3">
            <StarRating value={currentRating} onChange={(v) => setValue("rating", v)} size="lg" />
          </div>
          <Textarea
            {...register("comment")}
            placeholder={t.productDetail.commentPlaceholder}
            rows={3}
            className="mb-3"
          />
          <Button type="submit" disabled={submitting || currentRating === 0} className="cursor-pointer">
            {submitting ? t.productDetail.submitting : t.productDetail.submitReview}
          </Button>
        </form>
      ) : (
        <div className="bg-muted/30 rounded-xl p-5 mb-8 border border-border text-center">
          <p className="text-muted-foreground mb-3">{t.productDetail.signInToReview}</p>
          <Button asChild size="sm" className="cursor-pointer">
            <Link href="/auth/login">{t.productDetail.signIn}</Link>
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">{t.productDetail.noReviews}</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="flex gap-4 p-4 rounded-xl border border-border">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={r.user.avatar ?? ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {r.user.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <span className="text-sm font-medium">{r.user.name ?? t.productDetail.anonymous}</span>
                    <StarRating value={r.rating} readonly size="sm" />
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {format(new Date(r.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
