update auth.users
set encrypted_password = crypt('MomentumDemo2025!', gen_salt('bf')),
    updated_at = now()
where email = 'apple-review@momentumfit.app';