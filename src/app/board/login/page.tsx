import { LoginForm } from './login-form'

export default function BoardLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Transakauto — Leads</h1>
          <p className="mt-2 text-sm text-graphite">Connectez-vous pour accéder au tableau.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
