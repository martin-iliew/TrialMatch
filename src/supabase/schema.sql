-- ============================================================
-- Signup trigger: auto-create profile row when auth user is created
-- ============================================================
-- IMPORTANT: This trigger must be applied AFTER the profiles table exists.
-- DB Dev must merge this into the full schema.sql alongside all table definitions.

-- Required constraints for Server Actions:
-- clinics table must have UNIQUE(owner_id)
-- clinic_availability table must have UNIQUE(clinic_id)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
