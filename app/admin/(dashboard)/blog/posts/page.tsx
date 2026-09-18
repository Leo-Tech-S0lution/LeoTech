import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { getAllBlogPostsAdmin } from "@/lib/db/queries/blog";
import { PageHeader } from "@/components/admin/page-header";
import { AdminButton } from "@/components/admin/ui/button";
import { PostsTable } from "./posts-table";

export default async function BlogPostsPage() {
  await requireAdmin();
  const posts = await getAllBlogPostsAdmin();

  return (
    <div>
      <PageHeader
        title="Blog Posts"
        description="Manage articles published on the blog."
        actions={
          <AdminButton href="/admin/blog/posts/new" size="sm">
            <Plus className="h-3.5 w-3.5" />
            New Post
          </AdminButton>
        }
      />
      <PostsTable posts={posts} />
    </div>
  );
}
