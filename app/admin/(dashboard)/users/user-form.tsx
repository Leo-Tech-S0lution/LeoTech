"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAdminUserSchema,
  updateAdminUserSchema,
  resetPasswordSchema,
  type CreateAdminUserInput,
  type UpdateAdminUserInput,
  type ResetPasswordInput,
} from "@/lib/validation/auth";
import { createAdminUserAction, updateAdminUserAction, resetAdminPasswordAction } from "./actions";
import { FormField } from "@/components/admin/form-field";
import { Input, Select } from "@/components/admin/ui/input";
import { SubmitButton } from "@/components/admin/submit-button";
import { AdminButton } from "@/components/admin/ui/button";
import { toast } from "@/components/admin/toast";
import type { AdminUser } from "@/lib/db/schema";

export function UserForm({ user }: { user?: AdminUser }) {
  return (
    <div className="space-y-6">
      {user ? <EditUserForm user={user} /> : <CreateUserForm />}
      {user ? <ResetPasswordForm userId={user.id} /> : null}
    </div>
  );
}

function CreateUserForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createAdminUserSchema),
    defaultValues: { name: "", email: "", role: "editor" as const, password: "" },
  });

  function onSubmit(data: CreateAdminUserInput) {
    startTransition(async () => {
      const result = await createAdminUserAction(data);
      if (result.success) {
        toast.success("User created.");
        router.push("/admin/users");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Name" required error={errors.name?.message}>
            <Input {...register("name")} />
          </FormField>
          <FormField label="Email" required error={errors.email?.message}>
            <Input {...register("email")} type="email" />
          </FormField>
          <FormField label="Role" error={errors.role?.message}>
            <Select {...register("role")}>
              <option value="editor">Editor</option>
              <option value="owner">Owner</option>
            </Select>
          </FormField>
          <FormField label="Password" required error={errors.password?.message}>
            <Input {...register("password")} type="password" />
          </FormField>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SubmitButton pending={isPending}>Create user</SubmitButton>
        <AdminButton type="button" variant="outline" onClick={() => router.push("/admin/users")}>
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}

function EditUserForm({ user }: { user: AdminUser }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateAdminUserSchema),
    defaultValues: { id: user.id, name: user.name, email: user.email, role: user.role },
  });

  function onSubmit(data: UpdateAdminUserInput) {
    startTransition(async () => {
      const result = await updateAdminUserAction(data);
      if (result.success) {
        toast.success("User updated.");
        router.push("/admin/users");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Name" required error={errors.name?.message}>
            <Input {...register("name")} />
          </FormField>
          <FormField label="Email" required error={errors.email?.message}>
            <Input {...register("email")} type="email" />
          </FormField>
          <FormField label="Role" error={errors.role?.message}>
            <Select {...register("role")}>
              <option value="editor">Editor</option>
              <option value="owner">Owner</option>
            </Select>
          </FormField>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SubmitButton pending={isPending}>Save changes</SubmitButton>
        <AdminButton type="button" variant="outline" onClick={() => router.push("/admin/users")}>
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}

function ResetPasswordForm({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { id: userId, password: "" },
  });

  function onSubmit(data: ResetPasswordInput) {
    startTransition(async () => {
      const result = await resetAdminPasswordAction(data);
      if (result.success) {
        toast.success("Password reset.");
        reset({ id: userId, password: "" });
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  if (!open) {
    return (
      <AdminButton type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Reset password
      </AdminButton>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 font-display text-sm font-semibold text-heading">Reset password</h2>
      <div className="flex items-end gap-2">
        <FormField label="New password" required error={errors.password?.message}>
          <Input {...register("password")} type="password" />
        </FormField>
        <SubmitButton pending={isPending} pendingLabel="Saving…">
          Set password
        </SubmitButton>
        <AdminButton type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}
