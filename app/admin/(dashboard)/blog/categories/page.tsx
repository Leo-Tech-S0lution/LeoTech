import { requireAdmin } from "@/lib/auth/guard";
import { getBlogCategories, getBlogTags } from "@/lib/db/queries/blog";
import { PageHeader } from "@/components/admin/page-header";
import { NameSlugManager } from "./name-slug-manager";
import {
  createBlogCategoryAction,
  updateBlogCategoryAction,
  deleteBlogCategoryAction,
  createBlogTagAction,
  updateBlogTagAction,
  deleteBlogTagAction,
} from "./actions";

export default async function BlogTaxonomyPage() {
  await requireAdmin();
  const [categories, tags] = await Promise.all([getBlogCategories(), getBlogTags()]);

  return (
    <div>
      <PageHeader title="Blog Categories & Tags" description="Manage the taxonomy used to organize blog posts." />
      <div className="space-y-6">
        <NameSlugManager
          title="Categories"
          items={categories}
          createAction={createBlogCategoryAction}
          updateAction={updateBlogCategoryAction}
          deleteAction={deleteBlogCategoryAction}
        />
        <NameSlugManager
          title="Tags"
          items={tags}
          createAction={createBlogTagAction}
          updateAction={updateBlogTagAction}
          deleteAction={deleteBlogTagAction}
        />
      </div>
    </div>
  );
}
