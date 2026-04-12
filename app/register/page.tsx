import { Suspense } from "react";
import RegisterForm from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center"
        style={{ background: "#0a0f1e" }}>
        <p style={{ color: "#64748b" }}>Loading...</p>
      </main>
    }>
      <RegisterForm />
    </Suspense>
  );
}