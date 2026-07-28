"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { forgotPasswordSchema, ForgotPasswordValues } from "@/lib/schemas/auth";
import { useForgotPassword } from "@/lib/queries/auth";
import { getErrorMessage } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const forgotPassword = useForgotPassword();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await forgotPassword.mutateAsync(values);
      setSent(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          {sent
            ? "If an account exists for that email, a reset link has been sent."
            : "Enter your email and we'll send you a reset link."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!sent && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@topdevelopmentcompany.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={forgotPassword.isPending}>
                {forgotPassword.isPending ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          </Form>
        )}
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-foreground">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
