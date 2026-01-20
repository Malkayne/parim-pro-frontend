import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import logo from 'src/assets/images/logos/logo-icon.svg';
import type { ReactNode } from 'react';

import { forgotAdminPassword } from '../features/auth/authApi';
import { getApiErrorMessage } from '../shared/api/apiError';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';

const schema = z.object({
  mail: z.string().email('Valid email is required'),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-md items-center px-4">
        <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2 transition-opacity hover:opacity-80">
            <img src={logo} alt="Parim Pro Logo" className="h-10 w-10" />
            <span className="text-2xl font-bold tracking-tight">Parim Pro</span>
          </Link>

          <h1 className="text-xl font-semibold">Forgot password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Request an OTP to reset admin password</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit(async (values) => {
              setServerError(null);
              setLoading(true);
              try {
                await forgotAdminPassword({ mail: values.mail });
                navigate(`/auth/reset-password?mail=${encodeURIComponent(values.mail)}`);
              } catch (err) {
                setServerError(getApiErrorMessage(err, 'Failed to send reset OTP'));
              } finally {
                setLoading(false);
              }
            })}
          >
            <Field label="Email" error={errors.mail?.message}>
              <Input
                {...register('mail')}
                type="email"
                className="mt-1"
              />
            </Field>

            {serverError ? (
              <div className="rounded-md border border-error bg-lighterror px-3 py-2 text-sm text-error">
                {serverError}
              </div>
            ) : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Sending…' : 'Send reset OTP'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <Link to="/auth/login" className="text-primary underline">Back to login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">{label}</label>
        {error ? <span className="text-xs text-error">{error}</span> : null}
      </div>
      {children}
    </div>
  );
}
