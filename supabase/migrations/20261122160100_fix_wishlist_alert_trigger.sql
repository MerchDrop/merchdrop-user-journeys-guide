-- Variable named like the column broke every product stock/price update.
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
