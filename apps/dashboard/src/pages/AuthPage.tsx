import { SignIn, SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LogoMark } from "@inbix/ui";

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <LogoMark size={32} />
          <span className="text-lg font-semibold tracking-tight">Inbix</span>
        </Link>
        {children}
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Continue without account
        </Link>
      </div>
    </div>
  );
}

export function SignInPage() {
  return (
    <AuthLayout>
      <SignIn routing="path" path="/sign-in" />
    </AuthLayout>
  );
}

export function SignUpPage() {
  return (
    <AuthLayout>
      <SignUp routing="path" path="/sign-up" />
    </AuthLayout>
  );
}
