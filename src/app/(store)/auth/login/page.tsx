import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
