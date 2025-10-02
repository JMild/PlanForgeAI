import LoginForm from "@/src/app/auth/login/LoginForm";

export const metadata = { title: "Sign-In" };

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-6 sm:p-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
