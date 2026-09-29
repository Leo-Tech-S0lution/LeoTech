import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/sections/page-header";
import { Reveal } from "@/components/animations/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/text";
import { getPublishedBlogPosts, getBlogCategories } from "@/lib/db/queries/blog";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  return buildPageMetadata("/blog", {
    title: "Blog",
    description:
      "Engineering insights, tutorials and news from the Leo Tech Solution team.",
  });
}

interface BlogPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category, q } = await searchParams;
  const [posts, categories] = await Promise.all([getPublishedBlogPosts(), getBlogCategories()]);

  const filtered = posts.filter((post) => {
    const matchesCategory = !category || post.category?.slug === category;
    const matchesQuery =
      !q || post.title.toLowerCase().includes(q.toLowerCase()) || post.excerpt?.toLowerCase().includes(q.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <>
      <PageHeader eyebrow="BLOG" title="Insights & Engineering Notes" description="Notes on software, AI/ML, cloud, and building a technology career." pattern="grid" />

      <section className="py-20 lg:py-28">
        <div className="container-tech">
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-8">
            <Link
              href="/blog"
              className={cn(
                "px-3 py-1.5 text-xs font-medium uppercase tracking-wide",
                !category ? "bg-navy-900 text-white" : "text-slate-500 hover:bg-slate-100",
              )}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog?category=${cat.slug}`}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium uppercase tracking-wide",
                  category === cat.slug ? "bg-navy-900 text-white" : "text-slate-500 hover:bg-slate-100",
                )}
              >
                {cat.name}
              </Link>
            ))}
            <form action="/blog" method="get" className="ml-auto">
              {category && <input type="hidden" name="category" value={category} />}
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search articles..."
                className="border border-border bg-white px-3 py-1.5 text-sm text-heading placeholder:text-slate-400 focus:border-blue-400 focus:outline-hidden"
              />
            </form>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-8">
              <EmptyState message="No articles match your filters yet." />
            </div>
          ) : (
            <Reveal stagger className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                  <div className="relative aspect-16/10 overflow-hidden border border-border bg-slate-100">
                    {post.featuredImage && (
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 ease-technical group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {post.category && (
                        <span className="font-mono uppercase tracking-wide text-blue-600">{post.category.name}</span>
                      )}
                      {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                      {post.readingTimeMinutes && <span>{post.readingTimeMinutes} min read</span>}
                    </div>
                    <h2 className="mt-2 font-display text-lg font-semibold text-heading group-hover:text-blue-600">
                      {post.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
