import { requireAdmin } from "@/lib/auth/guard";
import { getBlogCategories, getBlogTags } from "@/lib/db/queries/blog";
import { getAllTeamMembersAdmin } from "@/lib/db/queries/team";
import { PageHeader } from "@/components/admin/page-header";
import { PostForm } from "../post-form";

export default async function NewBlogPostPage() {
  await requireAdmin();
  const [categories, tags, teamMembers] = await Promise.all([
    getBlogCategories(),
    getBlogTags(),
    getAllTeamMembersAdmin(),
  ]);

  return (
    <div>
      <PageHeader title="New Blog Post" description="Write a new article." />
      <PostForm categories={categories} tags={tags} teamMembers={teamMembers} />
    </div>
  );
}
