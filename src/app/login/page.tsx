import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
        <p className="text-gray-500 mb-6">Sign in to access your documents</p>
        
        <form
          action={async () => {
            "use server";
            await signIn("credentials", { redirectTo: "/" });
          }}
        >
          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Sign in with Demo Account
          </button>
        </form>
      </div>
    </div>
  );
}
