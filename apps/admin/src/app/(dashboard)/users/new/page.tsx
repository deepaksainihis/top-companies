import { UserForm } from "@/components/forms/user-form";

export default function NewUserPage() {
  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Add User</h1>
        <p className="text-sm text-muted-foreground">Create a new admin user.</p>
      </div>
      <UserForm />
    </div>
  );
}
