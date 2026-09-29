import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { Reveal } from "@/components/animations/reveal";
import { formatDate } from "@/lib/utils/text";
import type { BlogPostWithRelations } from "@/lib/db/queries/blog";

interface BlogPreviewProps {
  title: string;
  description: string | null;
  posts: BlogPostWithRelations[];
}

export function BlogPreview({ title, description, posts }: BlogPreviewProps) {
  if (posts.length === 0) return null;

  return (
    <SectionWrapper index="10" label="From the Blog" title={title} description={description}>
      <Reveal stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
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
                  <span className="font-mono uppercase tracking-wide text-blue-600">
                    {post.category.name}
                  </span>
                )}
                {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
              </div>
              <h3 className="mt-2 font-display text-lg font-semibold text-heading group-hover:text-blue-600">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </Reveal>

      <div className="mt-10 text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700"
        >
          Read More Articles
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </SectionWrapper>
  );
}
