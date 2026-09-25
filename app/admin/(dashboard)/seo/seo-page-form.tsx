"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { seoPageSchema, type SeoPageInput } from "@/lib/validation/seo";
import { createSeoPageAction, updateSeoPageAction } from "./actions";
import { FormField } from "@/components/admin/form-field";
import { Input } from "@/components/admin/ui/input";
import { MediaPicker } from "@/components/admin/media-picker";
import { SubmitButton } from "@/components/admin/submit-button";
import { AdminButton } from "@/components/admin/ui/button";
import { toast } from "@/components/admin/toast";
import type { SeoPage } from "@/lib/db/schema";

interface SeoPageFormProps {
  seoPage?: SeoPage;
}

export function SeoPageForm({ seoPage }: SeoPageFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(seoPageSchema),
    defaultValues: {
      path: seoPage?.path ?? "",
      title: seoPage?.title ?? "",
      description: seoPage?.description ?? "",
      ogImage: seoPage?.ogImage ?? "",
    },
  });

  function onSubmit(data: SeoPageInput) {
    startTransition(async () => {
      const result = seoPage ? await updateSeoPageAction(seoPage.id, data) : await createSeoPageAction(data);

      if (result.success) {
        toast.success(seoPage ? "SEO entry updated." : "SEO entry created.");
        router.push("/admin/seo");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-4">
          <FormField label="Path" required error={errors.path?.message} hint="e.g. /about, /contact, /services">
            <Input {...register("path")} placeholder="/about" disabled={!!seoPage} />
          </FormField>
          <FormField label="Title" error={errors.title?.message}>
            <Input {...register("title")} />
          </FormField>
          <FormField label="Description" error={errors.description?.message}>
            <Input {...register("description")} />
          </FormField>
          <FormField label="OG image">
            <Controller
              name="ogImage"
              control={control}
              render={({ field }) => <MediaPicker value={field.value} onChange={field.onChange} label="OG image" />}
            />
          </FormField>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SubmitButton pending={isPending}>{seoPage ? "Save changes" : "Create entry"}</SubmitButton>
        <AdminButton type="button" variant="outline" onClick={() => router.push("/admin/seo")}>
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}
