"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faqSchema, type FaqInput } from "@/lib/validation/content";
import { createFaqAction, updateFaqAction } from "./actions";
import { FormField } from "@/components/admin/form-field";
import { Input, Textarea, Switch } from "@/components/admin/ui/input";
import { SubmitButton } from "@/components/admin/submit-button";
import { AdminButton } from "@/components/admin/ui/button";
import { toast } from "@/components/admin/toast";
import type { Faq } from "@/lib/db/schema";

interface FaqFormProps {
  faq?: Faq;
}

export function FaqForm({ faq }: FaqFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FaqInput>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: faq?.question ?? "",
      answer: faq?.answer ?? "",
      category: faq?.category ?? "",
      order: faq?.order ?? 0,
      published: faq?.published ?? true,
    },
  });

  function onSubmit(data: FaqInput) {
    startTransition(async () => {
      const result = faq ? await updateFaqAction(faq.id, data) : await createFaqAction(data);
      if (result.success) {
        toast.success(faq ? "FAQ updated." : "FAQ created.");
        router.push("/admin/website/faq");
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
          <FormField label="Question" required error={errors.question?.message}>
            <Input {...register("question")} />
          </FormField>
          <FormField label="Answer" required error={errors.answer?.message}>
            <Textarea rows={4} {...register("answer")} />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Category" error={errors.category?.message}>
              <Input {...register("category")} placeholder="General" />
            </FormField>
            <FormField label="Order" error={errors.order?.message}>
              <Input type="number" {...register("order", { valueAsNumber: true })} />
            </FormField>
            <FormField label="Published">
              <Controller
                name="published"
                control={control}
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
              />
            </FormField>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SubmitButton pending={isPending}>{faq ? "Save changes" : "Create FAQ"}</SubmitButton>
        <AdminButton type="button" variant="outline" onClick={() => router.push("/admin/website/faq")}>
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}
