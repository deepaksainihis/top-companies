"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuditFooter } from "@/components/shared/audit-footer";
import { ImageUpload } from "@/components/shared/image-upload";
import { userFormSchema, UserFormInput, UserFormValues } from "@/lib/schemas/users";
import { useCreateUser, useUpdateUser } from "@/lib/queries/users";
import { applyFieldErrors } from "@/lib/apply-field-errors";
import { getErrorMessage, getFieldErrors } from "@/lib/api-client";
import { AdminUser } from "@/lib/types";

const BACK_HREF = "/users";

export function UserForm({ user }: { user?: AdminUser }) {
  const router = useRouter();
  const isEdit = !!user;

  const createUser = useCreateUser();
  const updateUser = useUpdateUser(user?.id ?? 0);

  const form = useForm<UserFormInput, unknown, UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      avatar: user?.avatar ?? "",
      password: "",
    },
  });

  const onSubmit = async (values: UserFormValues) => {
    const { password, ...rest } = values;
    const payload = password ? { ...rest, password } : rest;

    try {
      if (isEdit) {
        await updateUser.mutateAsync(payload);
        toast.success("User updated");
      } else {
        await createUser.mutateAsync(payload);
        toast.success("User created");
      }
      router.push(BACK_HREF);
    } catch (error) {
      applyFieldErrors(getFieldErrors(error), form.setError);
      toast.error(getErrorMessage(error));
    }
  };

  const isSubmitting = createUser.isPending || updateUser.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload label="Avatar" value={field.value} onChange={field.onChange} aspect="square" />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>
                    {isEdit ? "Leave blank to keep the current password." : "At least 8 characters."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {user && <AuditFooter record={user} />}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push(BACK_HREF)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
