-- Orders are created only by the process-payment edge function (service role),
-- which prices the cart server-side. Client inserts let any signed-in user
-- create an order with any total and status, e.g. already "paid".
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create order items for their orders" ON public.order_items;
