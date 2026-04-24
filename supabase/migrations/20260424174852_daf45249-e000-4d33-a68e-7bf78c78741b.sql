UPDATE auth.users
SET
  encrypted_password = crypt('MomentumDemo2025!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'apple-review@momentumfit.app';