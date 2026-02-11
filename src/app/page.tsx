import AuthForm from "@/components/AuthForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-dark-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">PM Mastermind</h1>
          <p className="text-gray-400">Sign in to access your event dashboard</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
