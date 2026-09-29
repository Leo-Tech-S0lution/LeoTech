import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { sanitizeRichText } from "@/lib/utils/sanitize";
import { Clock, ArrowUpRight } from "lucide-react";
import { Linkedin, Twitter, Facebook } from "@/components/ui/brand-icons";
import { PageHeader } from "@/components/sections/page-header";
import { Reveal } from "@/components/animations/reveal";
import { formatDate } from "@/lib/utils/text";
import { getBlogPostBySlug, getPublishedBlogPosts, getRelatedPosts } from "@/lib/db/queries/blog";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/seo/site";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt ?? undefined;
  const image = post.ogImage ?? post.featuredImage ?? undefined;

  return {
    title,
    alternates: { canonical: `/blog/${slug}` },
    description,
    openGraph: { title, description, images: image ? [image] : undefined, type: "article" },
    twitter: { title, description, card: "summary_large_image" },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const [related, siteUrl] = [await getRelatedPosts(post), getSiteUrl()];
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const safeContent = sanitizeRichText(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.featuredImage ?? undefined,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt,
    author: post.author ? { "@type": "Person", name: post.author.name } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader eyebrow={post.category?.name ?? "ARTICLE"} title={post.title} pattern="grid" />

      <article className="py-16 lg:py-20">
        <div className="container-tech grid grid-cols-1 gap-16 lg:grid-cols-[1fr_260px]">
          <Reveal>
            <div className="flex flex-wrap items-center gap-4 border-b border-border pb-6 text-sm text-slate-500">
              {post.author && <span>By {post.author.name}</span>}
              {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
              {post.readingTimeMinutes && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {post.readingTimeMinutes} min read
                </span>
              )}
            </div>

            {post.featuredImage && (
              <div className="relative mt-8 aspect-video overflow-hidden border border-border">
                <Image src={post.featuredImage} alt={post.title} fill className="object-cover" priority />
              </div>
            )}

            <div
              className="prose prose-slate mt-10 max-w-none prose-headings:font-display prose-headings:text-heading prose-a:text-blue-600"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />

            {post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
                {post.tags.map((tag) => (
                  <span key={tag.id} className="border border-border px-2.5 py-1 font-mono text-[11px] text-slate-500">
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </Reveal>

          <Reveal className="h-fit space-y-6">
            <div>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Share</h3>
              <div className="mt-3 flex gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Twitter"
                  className="flex h-9 w-9 items-center justify-center border border-border text-slate-500 hover:border-blue-400 hover:text-blue-600"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on LinkedIn"
                  className="flex h-9 w-9 items-center justify-center border border-border text-slate-500 hover:border-blue-400 hover:text-blue-600"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Facebook"
                  className="flex h-9 w-9 items-center justify-center border border-border text-slate-500 hover:border-blue-400 hover:text-blue-600"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              </div>
            </div>

            {related.length > 0 && (
              <div className="border-t border-border pt-6">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Related Articles
                </h3>
                <div className="mt-3 space-y-4">
                  {related.map((p) => (
                    <Link key={p.id} href={`/blog/${p.slug}`} className="group flex items-start gap-1.5 text-sm text-slate-600 hover:text-blue-600">
                      <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                      {p.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </article>
    </>
  );
}
