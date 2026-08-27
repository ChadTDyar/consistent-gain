DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;

CREATE POLICY "Admins can manage blog posts"
ON public.blog_posts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete blog posts"
ON public.blog_posts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));