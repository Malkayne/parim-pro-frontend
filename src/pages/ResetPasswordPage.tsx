import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import type { ReactNode } from 'react';

import { resendAdminPasswordResetOtp, resetAdminPassword } from '../features/auth/authApi';
import { getApiErrorMessage } from '../shared/api/apiError';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { PasswordInput } from 'src/components/ui/password-input';

const schema = z
  .object({
    mail: z.string().email('Valid email is required'),
    otp: z.string().min(4, 'OTP is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const defaultMail = useMemo(() => params.get('mail') ?? '', [params]);

  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mail: defaultMail,
    },
  });

  const mail = watch('mail');

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-md items-center px-4">
        <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Reset password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use the OTP sent to your email</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit(async (values) => {
              setServerError(null);
              setServerSuccess(null);
              setLoading(true);
              try {
                await resetAdminPassword({
                  mail: values.mail,
                  otp: values.otp,
                  newPassword: values.newPassword,
                });
                navigate('/auth/login', { replace: true });
              } catch (err) {
                setServerError(getApiErrorMessage(err, 'Reset password failed'));
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

            <Field label="OTP" error={errors.otp?.message}>
              <Input
                {...register('otp')}
                inputMode="numeric"
                className="mt-1"
              />
            </Field>

            <Field label="New password" error={errors.newPassword?.message}>
              <PasswordInput
                {...register('newPassword')}
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

            {serverSuccess ? (
              <div className="rounded-md border border-success bg-lightsuccess px-3 py-2 text-sm text-success">
                {serverSuccess}
              </div>
            ) : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Resetting…' : 'Reset password'}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={resendLoading || !mail}
              className="w-full"
              onClick={async () => {
                setServerError(null);
                setServerSuccess(null);
                setResendLoading(true);
                try {
                  const res = await resendAdminPasswordResetOtp({ mail });
                  setServerSuccess(res?.message ?? 'Reset OTP sent');
                } catch (err) {
                  setServerError(getApiErrorMessage(err, 'Failed to resend reset OTP'));
                } finally {
                  setResendLoading(false);
                }
              }}
            >
              {resendLoading ? 'Resending…' : 'Resend reset OTP'}
            </Button>

            <div className="flex justify-between text-sm text-muted-foreground">
              <Link to="/auth/login" className="text-primary underline">Login</Link>
              <Link to="/auth/forgot-password" className="text-primary underline">Resend reset OTP</Link>
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
