import { LoginForm } from "@/components/auth/login-form"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">8-a-Side Tournament</h1>
        <p className="text-muted-foreground">Team Login</p>
      </div>
      <LoginForm />
    </main>
  )
}