"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamMemberSchema, type TeamMemberInput } from "@/lib/validation/team";
import { createTeamMemberAction, updateTeamMemberAction } from "./actions";
import { FormField } from "@/components/admin/form-field";
import { Input, Textarea, Switch } from "@/components/admin/ui/input";
import { StringListEditor } from "@/components/admin/string-list-editor";
import { PairListEditor } from "@/components/admin/pair-list-editor";
import { MediaPicker } from "@/components/admin/media-picker";
import { SubmitButton } from "@/components/admin/submit-button";
import { AdminButton } from "@/components/admin/ui/button";
import { toast } from "@/components/admin/toast";
import type { TeamMember } from "@/lib/db/schema";

interface TeamFormProps {
  member?: TeamMember;
}

export function TeamForm({ member }: TeamFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TeamMemberInput>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: member?.name ?? "",
      position: member?.position ?? "",
      bio: member?.bio ?? "",
      image: member?.image ?? "",
      skills: member?.skills ?? [],
      socialLinks: member?.socialLinks ?? [],
      order: member?.order ?? 0,
      published: member?.published ?? true,
    },
  });

  function onSubmit(data: TeamMemberInput) {
    startTransition(async () => {
      const result = member
        ? await updateTeamMemberAction(member.id, data)
        : await createTeamMemberAction(data);

      if (result.success) {
        toast.success(member ? "Team member updated." : "Team member created.");
        router.push("/admin/team");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Basics</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Name" required error={errors.name?.message}>
            <Input {...register("name")} />
          </FormField>
          <FormField label="Position" error={errors.position?.message}>
            <Input {...register("position")} placeholder="Lead Engineer" />
          </FormField>
          <FormField label="Bio" error={errors.bio?.message} className="sm:col-span-2">
            <Textarea rows={5} {...register("bio")} />
          </FormField>
          <FormField label="Order" error={errors.order?.message}>
            <Input type="number" {...register("order", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Published">
            <Controller
              name="published"
              control={control}
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
          </FormField>
          <FormField label="Photo" className="sm:col-span-2">
            <Controller
              name="image"
              control={control}
              render={({ field }) => <MediaPicker value={field.value} onChange={field.onChange} label="Photo" />}
            />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Skills</h2>
        <FormField label="Skills">
          <Controller
            name="skills"
            control={control}
            render={({ field }) => (
              <StringListEditor value={field.value ?? []} onChange={field.onChange} addLabel="Add skill" />
            )}
          />
        </FormField>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-navy-900">Social links</h2>
        <FormField label="Social links">
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
        </FormField>
      </div>

      <div className="flex items-center gap-2">
        <SubmitButton pending={isPending}>{member ? "Save changes" : "Create team member"}</SubmitButton>
        <AdminButton type="button" variant="outline" onClick={() => router.push("/admin/team")}>
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}
