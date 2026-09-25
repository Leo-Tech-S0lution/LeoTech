"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { heroSlideSchema, type HeroSlideInput } from "@/lib/validation/content";
import { createHeroSlideAction, updateHeroSlideAction } from "./actions";
import { FormField } from "@/components/admin/form-field";
import { Input, Textarea, Switch } from "@/components/admin/ui/input";
import { MediaPicker } from "@/components/admin/media-picker";
import { SubmitButton } from "@/components/admin/submit-button";
import { AdminButton } from "@/components/admin/ui/button";
import { toast } from "@/components/admin/toast";
import type { HeroSlide } from "@/lib/db/schema";

interface HeroSlideFormProps {
  slide?: HeroSlide;
}

export function HeroSlideForm({ slide }: HeroSlideFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(heroSlideSchema),
    defaultValues: {
      title: slide?.title ?? "",
      subtitle: slide?.subtitle ?? "",
      description: slide?.description ?? "",
      image: slide?.image ?? "",
      cta1Label: slide?.cta1Label ?? "",
      cta1Href: slide?.cta1Href ?? "",
      cta2Label: slide?.cta2Label ?? "",
      cta2Href: slide?.cta2Href ?? "",
      order: slide?.order ?? 0,
      active: slide?.active ?? true,
    },
  });

  function onSubmit(data: HeroSlideInput) {
    startTransition(async () => {
      const result = slide
        ? await updateHeroSlideAction(slide.id, data)
        : await createHeroSlideAction(data);

      if (result.success) {
        toast.success(slide ? "Hero slide updated." : "Hero slide created.");
        router.push("/admin/website/hero");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Content</h2>
        <div className="grid grid-cols-1 gap-4">
          <FormField
            label="Title"
            required
            error={errors.title?.message}
            hint="Use a line break for a multi-line headline, e.g. after 'Engineering Software,'"
          >
            <Textarea rows={2} {...register("title")} />
          </FormField>
          <FormField label="Subtitle badge" error={errors.subtitle?.message} hint="Small badge above the headline.">
            <Input {...register("subtitle")} placeholder="TECHNOLOGY • INNOVATION • TRAINING" />
          </FormField>
          <FormField label="Description" error={errors.description?.message}>
            <Textarea rows={3} {...register("description")} />
          </FormField>
          <FormField label="Background image" hint="Optional — the hero has an animated network background by default.">
            <Controller
              name="image"
              control={control}
              render={({ field }) => <MediaPicker value={field.value} onChange={field.onChange} label="Image" />}
            />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Call to action buttons</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Primary button label" error={errors.cta1Label?.message}>
            <Input {...register("cta1Label")} placeholder="Start a Project" />
          </FormField>
          <FormField label="Primary button link" error={errors.cta1Href?.message}>
            <Input {...register("cta1Href")} placeholder="/contact" />
          </FormField>
          <FormField label="Secondary button label" error={errors.cta2Label?.message}>
            <Input {...register("cta2Label")} placeholder="Explore Services" />
          </FormField>
          <FormField label="Secondary button link" error={errors.cta2Href?.message}>
            <Input {...register("cta2Href")} placeholder="/services" />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Publishing</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Order" error={errors.order?.message}>
            <Input type="number" {...register("order", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Active">
            <Controller
              name="active"
              control={control}
              render={({ field }) => <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />}
            />
          </FormField>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SubmitButton pending={isPending}>{slide ? "Save changes" : "Create slide"}</SubmitButton>
        <AdminButton type="button" variant="outline" onClick={() => router.push("/admin/website/hero")}>
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}
