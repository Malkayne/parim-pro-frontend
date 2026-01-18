import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../features/auth/useAuth';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { PasswordInput } from 'src/components/ui/password-input';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAdmin } = useAuth();

  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-md items-center px-4">
        <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Admin access (OTP verification required)</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);

              try {
                await loginAdmin({ mail, password });
                const fromPathname =
                  (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
                  '/';
                navigate(fromPathname, { replace: true });
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Login failed');
              } finally {
                setLoading(false);
              }
            }}
          >
            <div>
              <label className="block text-sm font-medium">Email</label>
              <Input
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                className="mt-1"
                type="email"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                autoComplete="current-password"
                required
              />
            </div>

            {error ? (
              <div className="rounded-md border border-error bg-lighterror px-3 py-2 text-sm text-error">
                {error}
              </div>
            ) : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <Link to="/auth/forgot-password" className="text-primary underline">
                Forgot password?
              </Link>
              <Link to="/auth/register" className="text-primary underline">
                Create admin account
              </Link>
            </div>
            <Link to="/auth/verify-otp" className="text-primary underline text-center">
              Verify OTP / Resend OTP
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
