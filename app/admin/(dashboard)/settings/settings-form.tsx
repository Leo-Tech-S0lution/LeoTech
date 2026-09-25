"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { siteSettingsSchema, type SiteSettingsInput } from "@/lib/validation/settings";
import { updateSiteSettingsAction } from "./actions";
import { FormField } from "@/components/admin/form-field";
import { Input, Textarea } from "@/components/admin/ui/input";
import { PairListEditor } from "@/components/admin/pair-list-editor";
import { MediaPicker } from "@/components/admin/media-picker";
import { SubmitButton } from "@/components/admin/submit-button";
import { toast } from "@/components/admin/toast";
import type { SiteSettings } from "@/lib/db/schema";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      companyName: settings.companyName,
      tagline: settings.tagline ?? "",
      footerDescription: settings.footerDescription ?? "",
      email: settings.email ?? "",
      phone: settings.phone ?? "",
      address: settings.address ?? "",
      businessHours: settings.businessHours ?? "",
      schedulingUrl: settings.schedulingUrl ?? "",
      socialLinks: settings.socialLinks ?? [],
      defaultSeoTitle: settings.defaultSeoTitle ?? "",
      defaultSeoDescription: settings.defaultSeoDescription ?? "",
      defaultOgImage: settings.defaultOgImage ?? "",
    },
  });

  function onSubmit(data: SiteSettingsInput) {
    startTransition(async () => {
      const result = await updateSiteSettingsAction(data);
      if (result.success) {
        toast.success("Settings saved.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Company</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Company name" required error={errors.companyName?.message}>
            <Input {...register("companyName")} />
          </FormField>
          <FormField label="Tagline" error={errors.tagline?.message}>
            <Input {...register("tagline")} />
          </FormField>
          <FormField label="Footer description" error={errors.footerDescription?.message} className="sm:col-span-2">
            <Textarea rows={3} {...register("footerDescription")} />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Contact</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Email" error={errors.email?.message}>
            <Input {...register("email")} type="email" />
          </FormField>
          <FormField label="Phone" error={errors.phone?.message}>
            <Input {...register("phone")} />
          </FormField>
          <FormField label="Address" error={errors.address?.message} className="sm:col-span-2">
            <Input {...register("address")} />
          </FormField>
          <FormField label="Business hours" error={errors.businessHours?.message}>
            <Input {...register("businessHours")} placeholder="Mon – Fri, 9:00 AM – 6:00 PM" />
          </FormField>
          <FormField label="Scheduling URL" error={errors.schedulingUrl?.message} hint="Calendly or similar booking link.">
            <Input {...register("schedulingUrl")} placeholder="https://calendly.com/..." />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Social links</h2>
        <Controller
          name="socialLinks"
          control={control}
          render={({ field }) => <PairListEditor value={field.value ?? []} onChange={field.onChange} addLabel="Add link" />}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Default SEO</h2>
        <div className="grid grid-cols-1 gap-4">
          <FormField label="Default SEO title" error={errors.defaultSeoTitle?.message}>
            <Input {...register("defaultSeoTitle")} />
          </FormField>
          <FormField label="Default SEO description" error={errors.defaultSeoDescription?.message}>
            <Input {...register("defaultSeoDescription")} />
          </FormField>
          <FormField label="Default OG image">
            <Controller
              name="defaultOgImage"
              control={control}
              render={({ field }) => <MediaPicker value={field.value} onChange={field.onChange} label="OG image" />}
            />
          </FormField>
        </div>
      </div>

      <SubmitButton pending={isPending}>Save settings</SubmitButton>
    </form>
  );
}
