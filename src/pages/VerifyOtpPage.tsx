import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import logo from 'src/assets/images/logos/logo-icon.svg';
import type { ReactNode } from 'react';

import { resendAdminOtp, verifyAdminOtp } from '../features/auth/authApi';
import { getApiErrorMessage } from '../shared/api/apiError';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';

const schema = z.object({
  mail: z.string().email('Valid email is required'),
  otp: z.string().min(4, 'OTP is required'),
});

type FormValues = z.infer<typeof schema>;

export function VerifyOtpPage() {
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
      otp: '',
    },
  });

  const mail = watch('mail');

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-md items-center px-4">
        <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2 transition-opacity hover:opacity-80">
            <img src={logo} alt="Parim Pro Logo" className="h-10 w-10" />
            <span className="text-2xl font-bold tracking-tight">Parim Pro</span>
          </Link>

          <h1 className="text-xl font-semibold">Verify OTP</h1>
          <p className="mt-1 text-sm text-muted-foreground">Verify admin email to activate login</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit(async (values) => {
              setServerError(null);
              setServerSuccess(null);
              setLoading(true);
              try {
                const res = await verifyAdminOtp({ mail: values.mail, otp: values.otp });
                setServerSuccess(res?.message ?? 'Verified');
                navigate('/auth/login', { replace: true });
              } catch (err) {
                setServerError(getApiErrorMessage(err, 'OTP verification failed'));
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
              {loading ? 'Verifying…' : 'Verify'}
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
                  const res = await resendAdminOtp({ mail });
                  setServerSuccess(res?.message ?? 'OTP sent');
                } catch (err) {
                  setServerError(getApiErrorMessage(err, 'Failed to resend OTP'));
                } finally {
                  setResendLoading(false);
                }
              }}
            >
              {resendLoading ? 'Resending…' : 'Resend OTP'}
            </Button>

            <div className="flex justify-between text-sm text-muted-foreground">
              <Link to="/auth/login" className="text-primary underline">Back to login</Link>
              <Link to="/auth/register" className="text-primary underline">Create account</Link>
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
