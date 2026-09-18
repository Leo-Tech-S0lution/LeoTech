import Link from "next/link";
import { Briefcase, Newspaper, GraduationCap, Star, Users, Mail, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { getAllProjectsAdmin } from "@/lib/db/queries/projects";
import { getAllBlogPostsAdmin } from "@/lib/db/queries/blog";
import { getAllCoursesAdmin } from "@/lib/db/queries/training";
import { getAllTestimonialsAdmin } from "@/lib/db/queries/testimonials";
import { getAllTeamMembersAdmin } from "@/lib/db/queries/team";
import { getNewInquiriesCount, getRecentInquiriesAdmin } from "@/lib/db/queries/contact";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { AdminButton } from "@/components/admin/ui/button";
import { formatDate } from "@/lib/utils/text";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [projects, posts, courses, testimonials, team, newInquiries, recentInquiries] = await Promise.all([
    getAllProjectsAdmin(),
    getAllBlogPostsAdmin(),
    getAllCoursesAdmin(),
    getAllTestimonialsAdmin(),
    getAllTeamMembersAdmin(),
    getNewInquiriesCount(),
    getRecentInquiriesAdmin(5),
  ]);

  const publishedProjects = projects.filter((p) => p.status === "published").length;
  const publishedPosts = posts.filter((p) => p.status === "published").length;
  const recentPosts = posts.slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your site content and recent activity."
        actions={
          <>
            <AdminButton href="/admin/blog/posts/new" variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5" />
              New Post
            </AdminButton>
            <AdminButton href="/admin/projects/new" variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5" />
              New Project
            </AdminButton>
            <AdminButton href="/admin/services/new" variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5" />
              New Service
            </AdminButton>
            <AdminButton href="/" target="_blank" variant="primary" size="sm">
              View Site
            </AdminButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Projects"
          value={projects.length}
          subvalue={`${publishedProjects} published`}
          icon={Briefcase}
          href="/admin/projects"
        />
        <StatCard
          label="Blog Posts"
          value={posts.length}
          subvalue={`${publishedPosts} published`}
          icon={Newspaper}
          href="/admin/blog/posts"
        />
        <StatCard
          label="Training Courses"
          value={courses.length}
          icon={GraduationCap}
          href="/admin/training/courses"
        />
        <StatCard label="Testimonials" value={testimonials.length} icon={Star} href="/admin/testimonials" />
        <StatCard label="Team Members" value={team.length} icon={Users} href="/admin/team" />
        <StatCard
          label="New Inquiries"
          value={newInquiries}
          icon={Mail}
          href="/admin/messages"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-navy-900">Recent Blog Posts</h2>
            <Link href="/admin/blog/posts" className="text-xs font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {recentPosts.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No posts yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentPosts.map((post) => (
                <li key={post.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/blog/posts/${post.id}`}
                      className="block truncate text-sm font-medium text-navy-900 hover:text-blue-600"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-slate-400">{formatDate(post.updatedAt)}</p>
                  </div>
                  <StatusBadge status={post.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-navy-900">Recent Inquiries</h2>
            <Link href="/admin/messages" className="text-xs font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No inquiries yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentInquiries.map((inquiry) => (
                <li key={inquiry.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link
                      href="/admin/messages"
                      className="block truncate text-sm font-medium text-navy-900 hover:text-blue-600"
                    >
                      {inquiry.name}
                    </Link>
                    <p className="truncate text-xs text-slate-400">{inquiry.email}</p>
                  </div>
                  <StatusBadge status={inquiry.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
