import type { AuthBlockProps } from "@/lib/block-adapters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AuthBlock({ props }: { props: AuthBlockProps }) {
  const { isSignup, layout, background, fields, hasSignupLink, appName } = props;
  const title = isSignup ? `Create your ${appName} account` : `Sign in to ${appName}`;
  const description = isSignup ? "Enter your details below to create your account" : "Enter your email below to sign in to your account";

  const form = (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isSignup && (
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input placeholder="Jane Doe" />
          </Field>
        )}
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input type="email" placeholder="m@example.com" />
        </Field>
        {fields === "full" && (
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input type="password" />
          </Field>
        )}
        <Button className="w-full">{isSignup ? "Create account" : "Sign in"}</Button>
        {hasSignupLink && (
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account? <span className="text-foreground underline">Sign up</span>
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (layout === "split-image") {
    return (
      // Single column on a phone, and the brand panel becomes a short band
      // above the form instead of a half-width column ~180px wide.
      <div className="grid min-h-[420px] grid-cols-1 overflow-hidden rounded-[calc(var(--radius)*1.2)] border border-border sm:grid-cols-2">
        <div className="flex h-24 items-center justify-center bg-muted text-sm text-muted-foreground sm:order-last sm:h-auto">
          {appName} brand image
        </div>
        <div className="flex items-center justify-center p-5 sm:p-8">{form}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-[420px] items-center justify-center rounded-[calc(var(--radius)*1.2)] border border-border p-5 sm:p-8",
        background === "muted" && "bg-muted"
      )}
    >
      {form}
    </div>
  );
}
