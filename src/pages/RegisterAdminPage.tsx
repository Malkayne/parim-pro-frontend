import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import type { ReactNode } from 'react';

import type { AdminRole } from '../features/auth/authApi';
import { registerAdmin } from '../features/auth/authApi';
import { getApiErrorMessage } from '../shared/api/apiError';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { PasswordInput } from 'src/components/ui/password-input';

const schema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    mail: z.string().email('Valid email is required'),
    phoneNumber: z.string().min(7, 'Phone number is required'),
    role: z.literal('event_manager').default('event_manager'),
    createPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((v) => v.createPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.input<typeof schema>;

export function RegisterAdminPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'event_manager',
    },
  });

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-md items-center px-4">
        <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Create admin account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Register an event manager/admin</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit(async (values) => {
              setServerError(null);
              setLoading(true);

              try {
                await registerAdmin({
                  fullName: values.fullName,
                  mail: values.mail,
                  phoneNumber: values.phoneNumber,
                  role: 'event_manager' as AdminRole,
                  createPassword: values.createPassword,
                  confirmPassword: values.confirmPassword,
                });

                navigate(`/auth/verify-otp?mail=${encodeURIComponent(values.mail)}`);
              } catch (err) {
                setServerError(getApiErrorMessage(err, 'Registration failed'));
              } finally {
                setLoading(false);
              }
            })}
          >
            <input type="hidden" value="event_manager" {...register('role')} />

            <Field label="Full name" error={errors.fullName?.message}>
              <Input
                {...register('fullName')}
                className="mt-1"
              />
            </Field>

            <Field label="Email" error={errors.mail?.message}>
              <Input
                {...register('mail')}
                type="email"
                className="mt-1"
              />
            </Field>

            <Field label="Phone number" error={errors.phoneNumber?.message}>
              <Input
                {...register('phoneNumber')}
                className="mt-1"
              />
            </Field>

            <Field label="Password" error={errors.createPassword?.message}>
              <PasswordInput
                {...register('createPassword')}
                className="mt-1"
              />
            </Field>

            <Field label="Confirm password" error={errors.confirmPassword?.message}>
              <PasswordInput
                {...register('confirmPassword')}
                className="mt-1"
              />
            </Field>

            {serverError ? (
              <div className="rounded-md border border-error bg-lighterror px-3 py-2 text-sm text-error">
                {serverError}
              </div>
            ) : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating…' : 'Create account'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-primary underline">
                Sign in
              </Link>
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
