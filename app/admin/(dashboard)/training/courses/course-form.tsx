"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trainingCourseSchema, type TrainingCourseInput } from "@/lib/validation/training";
import { createCourseAction, updateCourseAction } from "./actions";
import { toSlug } from "@/lib/utils/text";
import { FormField } from "@/components/admin/form-field";
import { Input, Textarea, Select, Switch } from "@/components/admin/ui/input";
import { StringListEditor } from "@/components/admin/string-list-editor";
import { CurriculumEditor } from "./curriculum-editor";
import { MediaPicker } from "@/components/admin/media-picker";
import { SubmitButton } from "@/components/admin/submit-button";
import { AdminButton } from "@/components/admin/ui/button";
import { toast } from "@/components/admin/toast";
import type { TrainingCourse } from "@/lib/db/schema";

interface CourseFormProps {
  course?: TrainingCourse;
}

export function CourseForm({ course }: CourseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(trainingCourseSchema),
    defaultValues: {
      title: course?.title ?? "",
      slug: course?.slug ?? "",
      category: course?.category ?? "",
      description: course?.description ?? "",
      duration: course?.duration ?? "",
      level: course?.level ?? "beginner",
      technologies: course?.technologies ?? [],
      curriculum: course?.curriculum ?? [],
      projects: course?.projects ?? [],
      certification: course?.certification ?? "",
      price: course?.price ?? "",
      instructor: course?.instructor ?? "",
      startDate: course?.startDate ?? "",
      image: course?.image ?? "",
      featured: course?.featured ?? false,
      status: course?.status ?? "draft",
      order: course?.order ?? 0,
      seoTitle: course?.seoTitle ?? "",
      seoDescription: course?.seoDescription ?? "",
      ogImage: course?.ogImage ?? "",
    },
  });

  function onSubmit(data: TrainingCourseInput) {
    startTransition(async () => {
      const result = course
        ? await updateCourseAction(course.id, data)
        : await createCourseAction(data);

      if (result.success) {
        toast.success(course ? "Course updated." : "Course created.");
        router.push("/admin/training/courses");
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
                    if (!course) setValue("slug", toSlug(e.target.value));
                  }}
                />
              )}
            />
          </FormField>
          <FormField label="Slug" required error={errors.slug?.message} hint="Used in the public URL. Must be unique.">
            <Input {...register("slug")} />
          </FormField>
          <FormField label="Category" error={errors.category?.message}>
            <Input {...register("category")} placeholder="Web Development" />
          </FormField>
          <FormField label="Duration" error={errors.duration?.message}>
            <Input {...register("duration")} placeholder="8 weeks" />
          </FormField>
          <FormField label="Level" error={errors.level?.message}>
            <Select {...register("level")}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </FormField>
          <FormField label="Order" error={errors.order?.message}>
            <Input type="number" {...register("order", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Description" error={errors.description?.message} className="sm:col-span-2">
            <Textarea rows={5} {...register("description")} />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Technologies & Projects</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Technologies">
            <Controller
              name="technologies"
              control={control}
              render={({ field }) => (
                <StringListEditor value={field.value ?? []} onChange={field.onChange} addLabel="Add technology" />
              )}
            />
          </FormField>
          <FormField label="Projects">
            <Controller
              name="projects"
              control={control}
              render={({ field }) => (
                <StringListEditor value={field.value ?? []} onChange={field.onChange} addLabel="Add project" />
              )}
            />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Curriculum</h2>
        <Controller
          name="curriculum"
          control={control}
          render={({ field }) => (
            <CurriculumEditor value={field.value ?? []} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Enrollment details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Certification" error={errors.certification?.message} className="sm:col-span-2">
            <Textarea rows={3} {...register("certification")} />
          </FormField>
          <FormField label="Price" error={errors.price?.message} hint="Plain number, e.g. 1200 or 1200.00">
            <Input {...register("price")} placeholder="1200.00" />
          </FormField>
          <FormField label="Instructor" error={errors.instructor?.message}>
            <Input {...register("instructor")} />
          </FormField>
          <FormField label="Start date" error={errors.startDate?.message}>
            <Input type="date" {...register("startDate")} />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Media & Publishing</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Image" className="sm:col-span-2">
            <Controller
              name="image"
              control={control}
              render={({ field }) => <MediaPicker value={field.value} onChange={field.onChange} label="Image" />}
            />
          </FormField>
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
        <SubmitButton pending={isPending}>{course ? "Save changes" : "Create course"}</SubmitButton>
        <AdminButton type="button" variant="outline" onClick={() => router.push("/admin/training/courses")}>
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}
