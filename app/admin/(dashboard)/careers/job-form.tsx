"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobOpeningSchema, type JobOpeningInput } from "@/lib/validation/careers";
import { createJobOpeningAction, updateJobOpeningAction } from "./actions";
import { toSlug } from "@/lib/utils/text";
import { FormField } from "@/components/admin/form-field";
import { Input, Textarea, Select } from "@/components/admin/ui/input";
import { StringListEditor } from "@/components/admin/string-list-editor";
import { SubmitButton } from "@/components/admin/submit-button";
import { AdminButton } from "@/components/admin/ui/button";
import { toast } from "@/components/admin/toast";
import type { JobOpening } from "@/lib/db/schema";

interface JobFormProps {
  job?: JobOpening;
}

export function JobForm({ job }: JobFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(jobOpeningSchema),
    defaultValues: {
      title: job?.title ?? "",
      slug: job?.slug ?? "",
      department: job?.department ?? "",
      location: job?.location ?? "",
      employmentType: job?.employmentType ?? "full-time",
      description: job?.description ?? "",
      responsibilities: job?.responsibilities ?? [],
      requirements: job?.requirements ?? [],
      benefits: job?.benefits ?? [],
      applicationInstructions: job?.applicationInstructions ?? "",
      deadline: job?.deadline ?? "",
      status: job?.status ?? "draft",
    },
  });

  function onSubmit(data: JobOpeningInput) {
    startTransition(async () => {
      const result = job ? await updateJobOpeningAction(job.id, data) : await createJobOpeningAction(data);

      if (result.success) {
        toast.success(job ? "Job opening updated." : "Job opening created.");
        router.push("/admin/careers");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-heading">Basics</h2>
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
                    if (!job) setValue("slug", toSlug(e.target.value));
                  }}
                />
              )}
            />
          </FormField>
          <FormField label="Slug" required error={errors.slug?.message} hint="Used in the public URL. Must be unique.">
            <Input {...register("slug")} />
          </FormField>
          <FormField label="Department" error={errors.department?.message}>
            <Input {...register("department")} placeholder="Engineering" />
          </FormField>
          <FormField label="Location" error={errors.location?.message}>
            <Input {...register("location")} placeholder="San Francisco, CA (Hybrid)" />
          </FormField>
          <FormField label="Employment type" error={errors.employmentType?.message}>
            <Select {...register("employmentType")}>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </Select>
          </FormField>
          <FormField label="Application deadline" error={errors.deadline?.message}>
            <Input type="date" {...register("deadline")} />
          </FormField>
          <FormField label="Description" error={errors.description?.message} className="sm:col-span-2">
            <Textarea rows={4} {...register("description")} />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-heading">Details</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FormField label="Responsibilities">
            <Controller
              name="responsibilities"
              control={control}
              render={({ field }) => <StringListEditor value={field.value ?? []} onChange={field.onChange} addLabel="Add item" />}
            />
          </FormField>
          <FormField label="Requirements">
            <Controller
              name="requirements"
              control={control}
              render={({ field }) => <StringListEditor value={field.value ?? []} onChange={field.onChange} addLabel="Add item" />}
            />
          </FormField>
          <FormField label="Benefits">
            <Controller
              name="benefits"
              control={control}
              render={({ field }) => <StringListEditor value={field.value ?? []} onChange={field.onChange} addLabel="Add item" />}
            />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-heading">Application &amp; Publishing</h2>
        <div className="grid grid-cols-1 gap-4">
          <FormField label="Application instructions" error={errors.applicationInstructions?.message}>
            <Textarea rows={2} {...register("applicationInstructions")} />
          </FormField>
          <FormField label="Status" error={errors.status?.message} className="max-w-xs">
            <Select {...register("status")}>
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </Select>
          </FormField>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SubmitButton pending={isPending}>{job ? "Save changes" : "Create job opening"}</SubmitButton>
        <AdminButton type="button" variant="outline" onClick={() => router.push("/admin/careers")}>
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}
