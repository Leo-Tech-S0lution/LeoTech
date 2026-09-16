import "server-only";
import { db } from "@/lib/db";
import { testimonials, type Testimonial } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  return db
    .select()
    .from(testimonials)
    .where(eq(testimonials.published, true))
    .orderBy(asc(testimonials.order));
}

export async function getAllTestimonialsAdmin(): Promise<Testimonial[]> {
  return db.select().from(testimonials).orderBy(asc(testimonials.order));
}
