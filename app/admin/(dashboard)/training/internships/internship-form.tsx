"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { internshipProgramSchema, type InternshipProgramInput } from "@/lib/validation/training";
import { createInternshipAction, updateInternshipAction } from "./actions";
import { FormField } from "@/components/admin/form-field";
import { Input, Textarea, Select } from "@/components/admin/ui/input";
import { StringListEditor } from "@/components/admin/string-list-editor";
import { SubmitButton } from "@/components/admin/submit-button";
import { AdminButton } from "@/components/admin/ui/button";
import { toast } from "@/components/admin/toast";
import type { InternshipProgram } from "@/lib/db/schema";

interface InternshipFormProps {
  program?: InternshipProgram;
}

export function InternshipForm({ program }: InternshipFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(internshipProgramSchema),
    defaultValues: {
      title: program?.title ?? "",
      description: program?.description ?? "",
      duration: program?.duration ?? "",
      technologies: program?.technologies ?? [],
      projects: program?.projects ?? "",
      mentorship: program?.mentorship ?? "",
      certificate: program?.certificate ?? "",
      eligibility: program?.eligibility ?? "",
      status: program?.status ?? "draft",
      order: program?.order ?? 0,
    },
  });

  function onSubmit(data: InternshipProgramInput) {
    startTransition(async () => {
      const result = program
        ? await updateInternshipAction(program.id, data)
        : await createInternshipAction(data);

      if (result.success) {
        toast.success(program ? "Internship program updated." : "Internship program created.");
        router.push("/admin/training/internships");
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
            <Input {...register("title")} />
          </FormField>
          <FormField label="Duration" error={errors.duration?.message}>
            <Input {...register("duration")} placeholder="12 weeks" />
          </FormField>
          <FormField label="Description" error={errors.description?.message} className="sm:col-span-2">
            <Textarea rows={4} {...register("description")} />
          </FormField>
          <FormField label="Technologies" className="sm:col-span-2">
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
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Program details</h2>
        <div className="grid grid-cols-1 gap-4">
          <FormField label="Projects" error={errors.projects?.message} hint="What interns build during the program.">
            <Textarea rows={2} {...register("projects")} />
          </FormField>
          <FormField label="Mentorship" error={errors.mentorship?.message}>
            <Textarea rows={2} {...register("mentorship")} />
          </FormField>
          <FormField label="Certificate" error={errors.certificate?.message}>
            <Textarea rows={2} {...register("certificate")} />
          </FormField>
          <FormField label="Eligibility" error={errors.eligibility?.message}>
            <Textarea rows={2} {...register("eligibility")} />
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
          <FormField label="Order" error={errors.order?.message}>
            <Input type="number" {...register("order", { valueAsNumber: true })} />
          </FormField>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SubmitButton pending={isPending}>{program ? "Save changes" : "Create program"}</SubmitButton>
        <AdminButton type="button" variant="outline" onClick={() => router.push("/admin/training/internships")}>
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}
