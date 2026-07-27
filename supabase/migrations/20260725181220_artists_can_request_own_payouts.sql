-- Artists can request a payout for their own artist profile.
-- Amount/available-balance validation happens app-side (RequestPayoutDialog);
-- RLS here only enforces ownership and that new requests start as 'pending'.
CREATE POLICY "Artists can request own payouts"
ON public.payouts FOR INSERT
WITH CHECK (
  status = 'pending'
  AND EXISTS (
    SELECT 1 FROM public.artist_profiles ap
    WHERE ap.id = artist_id AND ap.user_id = auth.uid()
  )
);

-- Artists can cancel their own payout while it is still pending.
CREATE POLICY "Artists can cancel own pending payouts"
ON public.payouts FOR DELETE
USING (
  status = 'pending'
  AND EXISTS (
    SELECT 1 FROM public.artist_profiles ap
    WHERE ap.id = artist_id AND ap.user_id = auth.uid()
  )
);
