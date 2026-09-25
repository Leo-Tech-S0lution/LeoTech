"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema, type ServiceInput } from "@/lib/validation/services";
import { createServiceAction, updateServiceAction } from "./actions";
import { toSlug } from "@/lib/utils/text";
import { FormField } from "@/components/admin/form-field";
import { Input, Textarea, Select, Switch } from "@/components/admin/ui/input";
import { IconPicker } from "@/components/admin/icon-picker";
import { StringListEditor } from "@/components/admin/string-list-editor";
import { MediaPicker } from "@/components/admin/media-picker";
import { SubmitButton } from "@/components/admin/submit-button";
import { AdminButton } from "@/components/admin/ui/button";
import { toast } from "@/components/admin/toast";
import type { Service } from "@/lib/db/schema";

interface ServiceFormProps {
  service?: Service;
}

export function ServiceForm({ service }: ServiceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: service?.title ?? "",
      slug: service?.slug ?? "",
      shortDescription: service?.shortDescription ?? "",
      description: service?.description ?? "",
      icon: service?.icon ?? "cpu",
      features: service?.features ?? [],
      technologies: service?.technologies ?? [],
      ctaLabel: service?.ctaLabel ?? "",
      ctaHref: service?.ctaHref ?? "",
      order: service?.order ?? 0,
      featured: service?.featured ?? false,
      status: service?.status ?? "draft",
      seoTitle: service?.seoTitle ?? "",
      seoDescription: service?.seoDescription ?? "",
      ogImage: service?.ogImage ?? "",
    },
  });

  function onSubmit(data: ServiceInput) {
    startTransition(async () => {
      const result = service
        ? await updateServiceAction(service.id, data)
        : await createServiceAction(data);

      if (result.success) {
        toast.success(service ? "Service updated." : "Service created.");
        router.push("/admin/services");
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
          <FormField label="Title" required error={errors.title?.message}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    if (!service) setValue("slug", toSlug(e.target.value));
                  }}
                />
              )}
            />
          </FormField>
          <FormField label="Slug" required error={errors.slug?.message} hint="Used in the public URL. Must be unique.">
            <Input {...register("slug")} />
          </FormField>
          <FormField label="Short description" error={errors.shortDescription?.message} className="sm:col-span-2">
            <Textarea rows={2} {...register("shortDescription")} />
          </FormField>
          <FormField label="Description" error={errors.description?.message} className="sm:col-span-2">
            <Textarea rows={5} {...register("description")} />
          </FormField>
          <FormField label="Icon" error={errors.icon?.message}>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => <IconPicker value={field.value ?? ""} onChange={field.onChange} />}
            />
          </FormField>
          <FormField label="Order" error={errors.order?.message}>
            <Input type="number" {...register("order", { valueAsNumber: true })} />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Features & Technologies</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Features">
            <Controller
              name="features"
              control={control}
              render={({ field }) => (
                <StringListEditor value={field.value ?? []} onChange={field.onChange} addLabel="Add feature" />
              )}
            />
          </FormField>
          <FormField label="Technologies">
            <Controller
              name="technologies"
              control={control}
              render={({ field }) => (
                <StringListEditor value={field.value ?? []} onChange={field.onChange} addLabel="Add technology" />
              )}
            />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Call to action</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="CTA label" error={errors.ctaLabel?.message}>
            <Input {...register("ctaLabel")} placeholder="Get started" />
          </FormField>
          <FormField label="CTA link" error={errors.ctaHref?.message}>
            <Input {...register("ctaHref")} placeholder="/contact" />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Publishing</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Status" error={errors.status?.message}>
            <Select {...register("status")}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
          </FormField>
          <FormField label="Featured">
            <Controller
              name="featured"
              control={control}
              render={({ field }) => <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />}
            />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">SEO</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="SEO title" error={errors.seoTitle?.message}>
            <Input {...register("seoTitle")} />
          </FormField>
          <FormField label="SEO description" error={errors.seoDescription?.message}>
            <Input {...register("seoDescription")} />
          </FormField>
          <FormField label="OG image" className="sm:col-span-2">
            <Controller
              name="ogImage"
              control={control}
              render={({ field }) => <MediaPicker value={field.value} onChange={field.onChange} label="OG image" />}
            />
          </FormField>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SubmitButton pending={isPending}>{service ? "Save changes" : "Create service"}</SubmitButton>
        <AdminButton type="button" variant="outline" onClick={() => router.push("/admin/services")}>
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}
