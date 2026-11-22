-- Wishlist alerts: restock, price drop and drop-live, emailed by order-reminders.
CREATE TABLE IF NOT EXISTS public.wishlist_alerts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL CHECK (kind IN ('restock', 'price_drop', 'drop_live')),
  old_price_cents INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at    TIMESTAMPTZ
);
ALTER TABLE public.wishlist_alerts ENABLE ROW LEVEL SECURITY; -- service role only
CREATE INDEX IF NOT EXISTS wishlist_alerts_unsent ON public.wishlist_alerts (created_at) WHERE sent_at IS NULL;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS drop_alerted_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.queue_wishlist_alerts()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_kind TEXT;
BEGIN
  IF NEW.status <> 'published' THEN RETURN NEW; END IF;
  IF COALESCE(OLD.stock, 0) = 0 AND COALESCE(NEW.stock, 0) > 0 THEN v_kind := 'restock';
  ELSIF NEW.price_cents < OLD.price_cents THEN v_kind := 'price_drop';
  ELSE RETURN NEW;
  END IF;
  -- At most one pending alert per product and kind.
  IF NOT EXISTS (SELECT 1 FROM public.wishlist_alerts
                 WHERE product_id = NEW.id AND kind = v_kind AND sent_at IS NULL) THEN
    INSERT INTO public.wishlist_alerts (product_id, kind, old_price_cents) VALUES (NEW.id, v_kind, OLD.price_cents);
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS queue_wishlist_alerts ON public.products;
CREATE TRIGGER queue_wishlist_alerts AFTER UPDATE OF stock, price_cents ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.queue_wishlist_alerts();
