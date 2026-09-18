import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { getBlogPostByIdAdmin, getBlogCategories, getBlogTags } from "@/lib/db/queries/blog";
import { getAllTeamMembersAdmin } from "@/lib/db/queries/team";
import { PageHeader } from "@/components/admin/page-header";
import { PostForm } from "../post-form";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [result, categories, tags, teamMembers] = await Promise.all([
    getBlogPostByIdAdmin(id),
    getBlogCategories(),
    getBlogTags(),
    getAllTeamMembersAdmin(),
  ]);
  if (!result) notFound();

  return (
    <div>
      <PageHeader title="Edit Blog Post" description={result.post.title} />
      <PostForm
        post={result.post}
        postTagIds={result.tagIds}
        categories={categories}
        tags={tags}
        teamMembers={teamMembers}
      />
    </div>
  );
}
