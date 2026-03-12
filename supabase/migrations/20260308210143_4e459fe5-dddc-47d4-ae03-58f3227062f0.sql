
-- Create invoices table with auto-incrementing invoice number
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  payment_id uuid REFERENCES public.payments(id) ON DELETE CASCADE,
  invoice_number text NOT NULL UNIQUE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  description text,
  status text NOT NULL DEFAULT 'issued',
  payment_method text,
  issued_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Sequence for invoice numbering
CREATE SEQUENCE public.invoice_number_seq START 1001;

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS policies (PERMISSIVE)
CREATE POLICY "Users can read own invoices" ON public.invoices FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can read all invoices" ON public.invoices FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can insert invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Auto-generate invoice when payment is inserted
CREATE OR REPLACE FUNCTION public.generate_invoice_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.invoices (user_id, payment_id, invoice_number, amount, currency, description, payment_method, status)
  VALUES (
    NEW.user_id,
    NEW.id,
    'INV-' || LPAD(nextval('public.invoice_number_seq')::text, 6, '0'),
    NEW.amount,
    NEW.currency,
    NEW.description,
    NEW.payment_method,
    CASE WHEN NEW.status IN ('completed', 'paid') THEN 'paid' ELSE 'issued' END
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_invoice
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_invoice_on_payment();

-- Update invoice status when payment status changes
CREATE OR REPLACE FUNCTION public.update_invoice_on_payment_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.invoices
  SET status = CASE 
    WHEN NEW.status IN ('completed', 'paid') THEN 'paid'
    WHEN NEW.status = 'refunded' THEN 'refunded'
    WHEN NEW.status = 'failed' THEN 'cancelled'
    ELSE 'issued'
  END
  WHERE payment_id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_invoice_status
  AFTER UPDATE OF status ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoice_on_payment_update();
