-- Standardize handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert basic user record
  INSERT INTO public.users (
    id,
    full_name,
    email,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    now(),
    now()
  );

  -- Assign default investor role
  INSERT INTO public.user_roles (user_id, role_id)
  SELECT NEW.id, r.id
  FROM public.roles r
  WHERE r.name = 'investor'
  ON CONFLICT (user_id, role_id) DO NOTHING;

  -- Initialize user metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'email_verified', false,
    'phone_verified', false,
    'registration_completed', false
  )
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user(); 