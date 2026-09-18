"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { homepageSectionSchema, type HomepageSectionInput } from "@/lib/validation/content";
import { updateHomepageSectionAction } from "./actions";
import { FormField } from "@/components/admin/form-field";
import { Input, Textarea, Switch } from "@/components/admin/ui/input";
import { SubmitButton } from "@/components/admin/submit-button";
import { toast } from "@/components/admin/toast";
import type { HomepageSection } from "@/lib/db/schema";

export function SectionRow({ section }: { section: HomepageSection }) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, control } = useForm<HomepageSectionInput>({
    resolver: zodResolver(homepageSectionSchema),
    defaultValues: {
      title: section.title ?? "",
      description: section.description ?? "",
      enabled: section.enabled,
    },
  });

  function onSubmit(data: HomepageSectionInput) {
    startTransition(async () => {
      const result = await updateHomepageSectionAction(section.id, data);
      if (result.success) {
        toast.success(`${section.label} saved.`);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-sm font-semibold text-navy-900">{section.label}</h2>
        <Controller
          name="enabled"
          control={control}
          render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
        />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4">
        <FormField label="Title override" hint="Leave blank to use the default heading.">
          <Input {...register("title")} placeholder={section.label} />
        </FormField>
        <FormField label="Description override" hint="Leave blank to use the default description.">
          <Textarea rows={2} {...register("description")} />
        </FormField>
      </div>
      <div className="mt-4">
        <SubmitButton pending={isPending} pendingLabel="Saving…">
          Save
        </SubmitButton>
      </div>
    </form>
  );
}
