"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm, Controller, type Control, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { isBlankRow, teamMemberSchema, type TeamMemberFormValues, type TeamMemberInput } from "@/lib/validation/team";
import { checkSlugAvailabilityAction, createTeamMemberAction, updateTeamMemberAction } from "./actions";
import { FormField } from "@/components/admin/form-field";
import { Input, Textarea, Switch, Select } from "@/components/admin/ui/input";
import { StringListEditor } from "@/components/admin/string-list-editor";
import { PairListEditor } from "@/components/admin/pair-list-editor";
import { ObjectListEditor } from "@/components/admin/object-list-editor";
import { MediaPicker } from "@/components/admin/media-picker";
import { SubmitButton } from "@/components/admin/submit-button";
import { AdminButton } from "@/components/admin/ui/button";
import { toast } from "@/components/admin/toast";
import { composeName, profileUrl, slugFromName } from "@/lib/team/profile";
import type { TeamMember } from "@/lib/db/schema";

interface TeamFormProps {
  member?: TeamMember;
  /** Owner-level controls: slug, visibility, verification, activation, QR enable. */
  canManage: boolean;
  /** Rendered after the QR step when editing (Digital ID / QR panel). */
  qrPanel?: React.ReactNode;
}

type SlugState = "idle" | "checking" | "available" | "taken";

function Step({ n, title, description, children }: { n: number; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5" aria-labelledby={`step-${n}`}>
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
          {n}
        </span>
        <div>
          <h2 id={`step-${n}`} className="font-display text-sm font-semibold text-heading">{title}</h2>
          {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function firstErrorMessage(errors: FieldErrors<TeamMemberFormValues>): string {
  for (const [key, err] of Object.entries(errors)) {
    if (!err) continue;
    if ("message" in err && typeof err.message === "string" && err.message) return `${key}: ${err.message}`;
    if (Array.isArray(err)) {
      const idx = err.findIndex(Boolean);
      const inner = err[idx] as Record<string, { message?: string }> | undefined;
      const field = inner && Object.entries(inner).find(([, v]) => v?.message);
      if (field) return `${key} #${idx + 1} ${field[0]}: ${field[1].message}`;
    }
  }
  return "Please fix the highlighted fields.";
}

export function TeamForm({ member, canManage, qrPanel }: TeamFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const slugTouched = useRef(Boolean(member));
  const [slugState, setSlugState] = useState<SlugState>("idle");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      firstName: member?.firstName ?? "",
      middleName: member?.middleName ?? "",
      lastName: member?.lastName ?? "",
      name: member?.name ?? "",
      image: member?.image ?? "",
      coverImage: member?.coverImage ?? "",
      employeeId: member?.employeeId ?? "",
      position: member?.position ?? "",
      department: member?.department ?? "",
      joiningDate: member?.joiningDate ?? "",
      employmentType: member?.employmentType ?? undefined,
      email: member?.email ?? "",
      phone: member?.phone ?? "",
      whatsapp: member?.whatsapp ?? "",
      location: member?.location ?? "",
      bio: member?.bio ?? "",
      biography: member?.biography ?? "",
      skills: member?.skills ?? [],
      experience: member?.experience ?? [],
      education: member?.education ?? [],
      projects: member?.projects ?? [],
      certifications: member?.certifications ?? [],
      socialLinks: member?.socialLinks ?? [],
      slug: member?.slug ?? "",
      order: member?.order ?? 0,
      published: member?.published ?? true,
      isActive: member?.isActive ?? true,
      isVerified: member?.isVerified ?? false,
      qrEnabled: member?.qrEnabled ?? true,
    },
  });

  const [firstName, middleName, lastName, name, slug] = watch(["firstName", "middleName", "lastName", "name", "slug"]);
  const composed = composeName(firstName, middleName, lastName);
  const hasNameParts = composed.length > 0;

  // Full name follows first/middle/last whenever those are used.
  useEffect(() => {
    if (hasNameParts) setValue("name", composed, { shouldValidate: false });
  }, [composed, hasNameParts, setValue]);

  // New members: slug follows the name until the admin edits it by hand.
  useEffect(() => {
    if (!slugTouched.current) setValue("slug", slugFromName(name ?? ""));
  }, [name, setValue]);

  // Debounced uniqueness check.
  useEffect(() => {
    const value = (slug ?? "").trim();
    if (!value || value === member?.slug) {
      setSlugState("idle");
      return;
    }
    setSlugState("checking");
    const t = setTimeout(async () => {
      const result = await checkSlugAvailabilityAction(value, member?.id);
      setSlugState(result.success && result.data ? "available" : "taken");
    }, 400);
    return () => clearTimeout(t);
  }, [slug, member?.slug, member?.id]);

  const slugChanged = Boolean(member && slug && slug !== member.slug);
  const lockSettings = Boolean(member) && !canManage;

  function onSubmit(data: TeamMemberInput) {
    if (slugState === "taken") {
      toast.error("That profile URL is already in use. Choose another slug.");
      return;
    }
    startTransition(async () => {
      const result = member ? await updateTeamMemberAction(member.id, data) : await createTeamMemberAction(data);

      if (result.success) {
        toast.success(member ? "Team member updated." : "Team member created — profile and QR are ready.");
        router.push(member ? "/admin/team" : `/admin/team/${result.data.id}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form
      onSubmit={(e) => {
        // Drop repeatable rows the admin added but never filled in, then validate.
        for (const key of ["experience", "education", "projects", "certifications"] as const) {
          const rows = (getValues(key) ?? []) as Record<string, unknown>[];
          const kept = rows.filter((row) => !isBlankRow(row));
          if (kept.length !== rows.length) setValue(key, kept as never);
        }
        return handleSubmit(onSubmit, (errs) => toast.error(firstErrorMessage(errs)))(e);
      }}
      className="space-y-6"
    >
      <Step n={1} title="Basic information">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="First name" error={errors.firstName?.message}>
            <Input {...register("firstName")} autoComplete="off" />
          </FormField>
          <FormField label="Middle name" error={errors.middleName?.message}>
            <Input {...register("middleName")} autoComplete="off" />
          </FormField>
          <FormField label="Last name" error={errors.lastName?.message}>
            <Input {...register("lastName")} autoComplete="off" />
          </FormField>
          <FormField
            label="Full name"
            required
            error={errors.name?.message}
            hint={hasNameParts ? "Composed from first, middle and last name." : undefined}
            className="sm:col-span-3"
          >
            <Input {...register("name")} readOnly={hasNameParts} className={hasNameParts ? "bg-slate-50" : undefined} />
          </FormField>
          <FormField label="Profile photo" className="sm:col-span-3">
            <Controller
              name="image"
              control={control}
              render={({ field }) => <MediaPicker value={field.value} onChange={field.onChange} label="Photo" />}
            />
          </FormField>
          <FormField label="Cover photo" hint="Optional background for the profile header." className="sm:col-span-3">
            <Controller
              name="coverImage"
              control={control}
              render={({ field }) => <MediaPicker value={field.value} onChange={field.onChange} label="Cover photo" />}
            />
          </FormField>
        </div>
      </Step>

      <Step n={2} title="Professional information">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Employee ID" error={errors.employeeId?.message} hint="e.g. LTS-2026-002 — must be unique.">
            <Input {...register("employeeId")} className="font-mono uppercase" />
          </FormField>
          <FormField label="Designation" error={errors.position?.message}>
            <Input {...register("position")} placeholder="Managing Director" />
          </FormField>
          <FormField label="Department" error={errors.department?.message}>
            <Input {...register("department")} placeholder="Management" />
          </FormField>
          <FormField label="Joining date" error={errors.joiningDate?.message}>
            <Input type="date" {...register("joiningDate")} />
          </FormField>
          <FormField label="Employment type" error={errors.employmentType?.message}>
            <Select {...register("employmentType")}>
              <option value="">—</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </Select>
          </FormField>
          <FormField label="Display order" error={errors.order?.message}>
            <Input type="number" {...register("order", { valueAsNumber: true })} />
          </FormField>
        </div>
      </Step>

      <Step n={3} title="Contact" description="Shown publicly on the profile as Call / Email / WhatsApp buttons.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </FormField>
          <FormField label="Phone" error={errors.phone?.message} hint="Include country code, e.g. +977 98XXXXXXXX">
            <Input type="tel" {...register("phone")} />
          </FormField>
          <FormField label="WhatsApp" error={errors.whatsapp?.message} hint="International format with country code.">
            <Input type="tel" {...register("whatsapp")} />
          </FormField>
          <FormField label="Location" error={errors.location?.message}>
            <Input {...register("location")} placeholder="City, Nepal" />
          </FormField>
        </div>
      </Step>

      <Step n={4} title="Professional profile">
        <div className="space-y-5">
          <FormField label="Short bio" error={errors.bio?.message} hint="One or two sentences — used on team cards and search snippets.">
            <Textarea rows={2} {...register("bio")} />
          </FormField>
          <FormField label="Biography" error={errors.biography?.message}>
            <Textarea rows={6} {...register("biography")} />
          </FormField>
          <FormField label="Skills">
            <Controller
              name="skills"
              control={control}
              render={({ field }) => (
                <StringListEditor value={field.value ?? []} onChange={field.onChange} addLabel="Add skill" />
              )}
            />
          </FormField>
          <FormField label="Experience">
            <Controller
              name="experience"
              control={control}
              render={({ field }) => (
                <ObjectListEditor
                  value={field.value ?? []}
                  onChange={field.onChange}
                  itemLabel="Role"
                  addLabel="Add experience"
                  fields={[
                    { key: "role", label: "Role", required: true },
                    { key: "organization", label: "Organization", required: true },
                    { key: "period", label: "Period", placeholder: "2025 – Present" },
                    { key: "description", label: "Description", multiline: true },
                  ]}
                />
              )}
            />
          </FormField>
          <FormField label="Education">
            <Controller
              name="education"
              control={control}
              render={({ field }) => (
                <ObjectListEditor
                  value={field.value ?? []}
                  onChange={field.onChange}
                  itemLabel="Education"
                  addLabel="Add education"
                  fields={[
                    { key: "degree", label: "Degree / program", required: true },
                    { key: "institution", label: "Institution", required: true },
                    { key: "period", label: "Period", placeholder: "2018 – 2022" },
                    { key: "description", label: "Description", multiline: true },
                  ]}
                />
              )}
            />
          </FormField>
          <FormField label="Projects">
            <Controller
              name="projects"
              control={control}
              render={({ field }) => (
                <ObjectListEditor
                  value={field.value ?? []}
                  onChange={field.onChange}
                  itemLabel="Project"
                  addLabel="Add project"
                  fields={[
                    { key: "name", label: "Project name", required: true },
                    { key: "url", label: "Link", placeholder: "https://…" },
                    { key: "description", label: "Description", multiline: true },
                  ]}
                />
              )}
            />
          </FormField>
          <FormField label="Certifications">
            <Controller
              name="certifications"
              control={control}
              render={({ field }) => (
                <ObjectListEditor
                  value={field.value ?? []}
                  onChange={field.onChange}
                  itemLabel="Certification"
                  addLabel="Add certification"
                  fields={[
                    { key: "name", label: "Certification", required: true },
                    { key: "issuer", label: "Issuer" },
                    { key: "year", label: "Year" },
                    { key: "url", label: "Credential link", placeholder: "https://…" },
                  ]}
                />
              )}
            />
          </FormField>
        </div>
      </Step>

      <Step n={5} title="Social links" description="Use labels like LinkedIn, GitHub, Facebook, Instagram, Website.">
        <Controller
          name="socialLinks"
          control={control}
          render={({ field }) => (
            <PairListEditor
              value={field.value ?? []}
              onChange={field.onChange}
              labelPlaceholder="Label (e.g. LinkedIn)"
              urlPlaceholder="https://…"
              addLabel="Add link"
            />
          )}
        />
      </Step>

      <Step
        n={6}
        title="Profile settings"
        description={lockSettings ? "Only owners can change the profile URL, visibility, verification and status." : undefined}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Profile URL slug" error={errors.slug?.message} className="sm:col-span-2">
            <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 font-mono text-xs text-slate-500">
                /team/
              </span>
              <input
                {...register("slug", {
                  onChange: () => {
                    slugTouched.current = true;
                  },
                })}
                disabled={lockSettings}
                className="min-w-0 flex-1 bg-white px-3 py-2 font-mono text-sm text-heading outline-hidden disabled:bg-slate-50 disabled:text-slate-400"
                aria-describedby="slug-status"
              />
            </div>
            <p id="slug-status" className="mt-1 flex items-center gap-1 text-xs" aria-live="polite">
              {slugState === "checking" && <span className="text-slate-400">Checking availability…</span>}
              {slugState === "available" && (
                <span className="inline-flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Available
                </span>
              )}
              {slugState === "taken" && (
                <span className="inline-flex items-center gap-1 text-red-600">
                  <XCircle className="h-3.5 w-3.5" /> Already used by another member (or one of their old URLs)
                </span>
              )}
              {slugState === "idle" && slug && (
                <span className="break-all font-mono text-slate-400">{profileUrl(slug)}</span>
              )}
            </p>
            {slugChanged && (
              <div className="mt-2 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p>
                  Changing the URL affects printed ID cards. The old address <strong>/team/{member?.slug}</strong> will
                  keep redirecting to <strong>/team/{slug}</strong>, but new QR codes will use the new URL.
                </p>
              </div>
            )}
          </FormField>

          <ToggleRow
            control={control}
            name="published"
            label="Public"
            hint="Listed in the team directory and sitemap, and indexable by search engines. Private profiles still open from the QR."
            disabled={lockSettings}
          />
          <ToggleRow
            control={control}
            name="isActive"
            label="Active"
            hint="Inactive profiles show “Profile Unavailable” to anyone who scans the QR."
            disabled={lockSettings}
          />
          <ToggleRow
            control={control}
            name="isVerified"
            label="Verified team member"
            hint="Shows the ✓ Verified Leo Tech Solution Team Member badge."
            disabled={!canManage}
          />
        </div>
      </Step>

      <Step n={7} title="QR code" description="The QR only contains the public profile URL — never personal data.">
        <div className="space-y-4">
          <ToggleRow
            control={control}
            name="qrEnabled"
            label="QR enabled"
            hint="Generated automatically. Editing profile details never changes the QR."
            disabled={lockSettings}
          />
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">QR destination</p>
            <p className="mt-0.5 break-all font-mono text-sm text-heading">{slug ? profileUrl(slug) : "—"}</p>
          </div>
          {qrPanel}
        </div>
      </Step>

      <div className="flex items-center gap-2">
        <SubmitButton pending={isPending}>{member ? "Save changes" : "Create team member"}</SubmitButton>
        <AdminButton type="button" variant="outline" onClick={() => router.push("/admin/team")}>
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}

function ToggleRow({
  control,
  name,
  label,
  hint,
  disabled,
}: {
  control: Control<TeamMemberFormValues, unknown, TeamMemberInput>;
  name: "published" | "isActive" | "isVerified" | "qrEnabled";
  label: string;
  hint: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-3">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
      </div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} disabled={disabled} />
        )}
      />
    </div>
  );
}
