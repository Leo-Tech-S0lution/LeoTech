"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, type ProjectInput } from "@/lib/validation/projects";
import { createProjectAction, updateProjectAction } from "./actions";
import { GalleryPicker } from "./gallery-picker";
import { toSlug } from "@/lib/utils/text";
import { FormField } from "@/components/admin/form-field";
import { Input, Textarea, Select, Switch } from "@/components/admin/ui/input";
import { StringListEditor } from "@/components/admin/string-list-editor";
import { MediaPicker } from "@/components/admin/media-picker";
import { SubmitButton } from "@/components/admin/submit-button";
import { AdminButton } from "@/components/admin/ui/button";
import { toast } from "@/components/admin/toast";
import type { Project } from "@/lib/db/schema";

interface ProjectFormProps {
  project?: Project;
}

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title ?? "",
      slug: project?.slug ?? "",
      client: project?.client ?? "",
      category: project?.category ?? "",
      summary: project?.summary ?? "",
      challenge: project?.challenge ?? "",
      solution: project?.solution ?? "",
      results: project?.results ?? "",
      technologies: project?.technologies ?? [],
      coverImage: project?.coverImage ?? "",
      gallery: project?.gallery ?? [],
      projectUrl: project?.projectUrl ?? "",
      featured: project?.featured ?? false,
      status: project?.status ?? "draft",
      order: project?.order ?? 0,
      seoTitle: project?.seoTitle ?? "",
      seoDescription: project?.seoDescription ?? "",
      ogImage: project?.ogImage ?? "",
    },
  });

  function onSubmit(data: ProjectInput) {
    startTransition(async () => {
      const result = project
        ? await updateProjectAction(project.id, data)
        : await createProjectAction(data);

      if (result.success) {
        toast.success(project ? "Project updated." : "Project created.");
        router.push("/admin/projects");
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
                    if (!project) setValue("slug", toSlug(e.target.value));
                  }}
                />
              )}
            />
          </FormField>
          <FormField label="Slug" required error={errors.slug?.message} hint="Used in the public URL. Must be unique.">
            <Input {...register("slug")} />
          </FormField>
          <FormField label="Client" error={errors.client?.message}>
            <Input {...register("client")} />
          </FormField>
          <FormField label="Category" error={errors.category?.message}>
            <Input {...register("category")} placeholder="Web Development" />
          </FormField>
          <FormField label="Summary" error={errors.summary?.message} hint="Short blurb shown in listings (max 300 chars)." className="sm:col-span-2">
            <Textarea rows={2} {...register("summary")} />
          </FormField>
          <FormField label="Order" error={errors.order?.message}>
            <Input type="number" {...register("order", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Project URL" error={errors.projectUrl?.message}>
            <Input {...register("projectUrl")} placeholder="https://example.com" />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Case study</h2>
        <div className="grid grid-cols-1 gap-4">
          <FormField label="Challenge" error={errors.challenge?.message}>
            <Textarea rows={4} {...register("challenge")} />
          </FormField>
          <FormField label="Solution" error={errors.solution?.message}>
            <Textarea rows={4} {...register("solution")} />
          </FormField>
          <FormField label="Results" error={errors.results?.message}>
            <Textarea rows={4} {...register("results")} />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Technologies</h2>
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

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Media</h2>
        <div className="grid grid-cols-1 gap-6">
          <FormField label="Cover image">
            <Controller
              name="coverImage"
              control={control}
              render={({ field }) => (
                <MediaPicker value={field.value} onChange={field.onChange} label="Cover image" />
              )}
            />
          </FormField>
          <FormField label="Gallery" hint="Additional images shown on the project's detail page.">
            <Controller
              name="gallery"
              control={control}
              render={({ field }) => (
                <GalleryPicker value={field.value ?? []} onChange={field.onChange} />
              )}
            />
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
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
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
        <SubmitButton pending={isPending}>{project ? "Save changes" : "Create project"}</SubmitButton>
        <AdminButton type="button" variant="outline" onClick={() => router.push("/admin/projects")}>
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}
