import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface OtpInputProps {
  email: string;
  onVerify: (token: string) => Promise<void>;
  onResend: () => Promise<void>;
  isVerifying: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({ email, onVerify, onResend, isVerifying }) => {
  const [otp, setOtp] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  useEffect(() => {
    // Auto-submit when OTP is complete
    if (otp.length === 6) {
      onVerify(otp);
    }
  }, [otp, onVerify]);

  const handleResend = async () => {
    if (!canResend) return;
    
    try {
      await onResend();
      setCanResend(false);
      setCountdown(60);
      setOtp('');
      toast.success('Verification code resent', { description: 'Check your email for the new code' });
    } catch (error) {
      toast.error('Failed to resend code', { description: 'Please try again' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">Enter Verification Code</h3>
        <p className="text-sm text-muted-foreground">
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          disabled={isVerifying}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {isVerifying && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Verifying code...</span>
        </div>
      )}

      <div className="text-center">
        <Button
          variant="link"
          onClick={handleResend}
          disabled={!canResend || isVerifying}
          className="text-sm"
        >
          {canResend 
            ? 'Resend code' 
            : `Resend code in ${countdown}s`
          }
        </Button>
      </div>
    </div>
  );
};
