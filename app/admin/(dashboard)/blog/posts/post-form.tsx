"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { blogPostSchema, type BlogPostInput } from "@/lib/validation/blog";
import { createBlogPostAction, updateBlogPostAction } from "./actions";
import { createBlogTagAction } from "../categories/actions";
import { toSlug } from "@/lib/utils/text";
import { FormField } from "@/components/admin/form-field";
import { Input, Textarea, Select, Switch } from "@/components/admin/ui/input";
import { MediaPicker } from "@/components/admin/media-picker";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SubmitButton } from "@/components/admin/submit-button";
import { AdminButton } from "@/components/admin/ui/button";
import { toast } from "@/components/admin/toast";
import { cn } from "@/lib/utils/cn";
import type { BlogPost, BlogCategory, BlogTag, TeamMember } from "@/lib/db/schema";

interface PostFormProps {
  post?: BlogPost;
  postTagIds?: string[];
  categories: BlogCategory[];
  tags: BlogTag[];
  teamMembers: TeamMember[];
}

export function PostForm({ post, postTagIds = [], categories, tags: initialTags, teamMembers }: PostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tags, setTags] = useState(initialTags);
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      content: post?.content ?? "",
      featuredImage: post?.featuredImage ?? "",
      categoryId: post?.categoryId ?? "",
      authorId: post?.authorId ?? "",
      tagIds: postTagIds,
      featured: post?.featured ?? false,
      status: post?.status ?? "draft",
      seoTitle: post?.seoTitle ?? "",
      seoDescription: post?.seoDescription ?? "",
      ogImage: post?.ogImage ?? "",
      publishedAt: post?.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 10) : "",
    },
  });

  const selectedTagIds = watch("tagIds");

  function toggleTag(id: string) {
    const current = selectedTagIds ?? [];
    setValue("tagIds", current.includes(id) ? current.filter((t) => t !== id) : [...current, id]);
  }

  function handleCreateTag() {
    if (!newTagName.trim()) return;
    setCreatingTag(true);
    startTransition(async () => {
      const result = await createBlogTagAction({ name: newTagName.trim(), slug: toSlug(newTagName.trim()) });
      setCreatingTag(false);
      if (result.success) {
        setTags((prev) => [...prev, result.data]);
        setValue("tagIds", [...(selectedTagIds ?? []), result.data.id]);
        setNewTagName("");
      } else {
        toast.error(result.error);
      }
    });
  }

  function onSubmit(data: BlogPostInput) {
    startTransition(async () => {
      const result = post ? await updateBlogPostAction(post.id, data) : await createBlogPostAction(data);

      if (result.success) {
        toast.success(post ? "Post updated." : "Post created.");
        router.push("/admin/blog/posts");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-heading">Content</h2>
        <div className="grid grid-cols-1 gap-4">
          <FormField label="Title" required error={errors.title?.message}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    if (!post) setValue("slug", toSlug(e.target.value));
                  }}
                />
              )}
            />
          </FormField>
          <FormField label="Slug" required error={errors.slug?.message} hint="Used in the public URL. Must be unique.">
            <Input {...register("slug")} />
          </FormField>
          <FormField label="Excerpt" error={errors.excerpt?.message}>
            <Textarea rows={2} {...register("excerpt")} />
          </FormField>
          <FormField label="Body" error={errors.content?.message}>
            <Controller
              name="content"
              control={control}
              render={({ field }) => <RichTextEditor value={field.value ?? ""} onChange={field.onChange} />}
            />
          </FormField>
          <FormField label="Featured image">
            <Controller
              name="featuredImage"
              control={control}
              render={({ field }) => <MediaPicker value={field.value} onChange={field.onChange} label="Featured image" />}
            />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-heading">Organization</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Category" error={errors.categoryId?.message}>
            <Select {...register("categoryId")}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Author" error={errors.authorId?.message}>
            <Select {...register("authorId")}>
              <option value="">No author</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Tags" className="sm:col-span-2">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const selected = (selectedTagIds ?? []).includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      selected ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:bg-slate-50",
                    )}
                  >
                    #{tag.name}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="New tag name"
                className="max-w-[200px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateTag();
                  }
                }}
              />
              <AdminButton type="button" variant="outline" size="sm" onClick={handleCreateTag} disabled={creatingTag}>
                <Plus className="h-3.5 w-3.5" />
                Add tag
              </AdminButton>
            </div>
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-heading">Publishing</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Status" error={errors.status?.message}>
            <Select {...register("status")}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
          </FormField>
          <FormField label="Published date" error={errors.publishedAt?.message} hint="Leave blank to use the moment this post is first published.">
            <Input type="date" {...register("publishedAt")} />
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
        <h2 className="mb-4 font-display text-sm font-semibold text-heading">SEO</h2>
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
        <SubmitButton pending={isPending}>{post ? "Save changes" : "Create post"}</SubmitButton>
        <AdminButton type="button" variant="outline" onClick={() => router.push("/admin/blog/posts")}>
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}
