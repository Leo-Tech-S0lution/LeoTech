"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { testimonialSchema, type TestimonialInput } from "@/lib/validation/testimonials";
import { createTestimonialAction, updateTestimonialAction } from "./actions";
import { FormField } from "@/components/admin/form-field";
import { Input, Textarea, Switch } from "@/components/admin/ui/input";
import { MediaPicker } from "@/components/admin/media-picker";
import { SubmitButton } from "@/components/admin/submit-button";
import { AdminButton } from "@/components/admin/ui/button";
import { toast } from "@/components/admin/toast";
import type { Testimonial } from "@/lib/db/schema";

interface TestimonialFormProps {
  testimonial?: Testimonial;
}

export function TestimonialForm({ testimonial }: TestimonialFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TestimonialInput>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: testimonial?.name ?? "",
      position: testimonial?.position ?? "",
      company: testimonial?.company ?? "",
      content: testimonial?.content ?? "",
      image: testimonial?.image ?? "",
      rating: testimonial?.rating ?? 5,
      order: testimonial?.order ?? 0,
      published: testimonial?.published ?? true,
    },
  });

  function onSubmit(data: TestimonialInput) {
    startTransition(async () => {
      const result = testimonial
        ? await updateTestimonialAction(testimonial.id, data)
        : await createTestimonialAction(data);

      if (result.success) {
        toast.success(testimonial ? "Testimonial updated." : "Testimonial created.");
        router.push("/admin/testimonials");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Basics</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Name" required error={errors.name?.message}>
            <Input {...register("name")} />
          </FormField>
          <FormField label="Position" error={errors.position?.message}>
            <Input {...register("position")} placeholder="Operations Director" />
          </FormField>
          <FormField label="Company" error={errors.company?.message}>
            <Input {...register("company")} />
          </FormField>
          <FormField label="Rating (1–5)" error={errors.rating?.message}>
            <Input type="number" min={1} max={5} {...register("rating", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Testimonial" required error={errors.content?.message} className="sm:col-span-2">
            <Textarea rows={5} {...register("content")} />
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
          <FormField label="Photo" className="sm:col-span-2">
            <Controller
              name="image"
              control={control}
              render={({ field }) => <MediaPicker value={field.value} onChange={field.onChange} label="Photo" />}
            />
          </FormField>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SubmitButton pending={isPending}>{testimonial ? "Save changes" : "Create testimonial"}</SubmitButton>
        <AdminButton type="button" variant="outline" onClick={() => router.push("/admin/testimonials")}>
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}
