
-- Allow admins to delete blog posts (the ALL policy doesn't always cover DELETE in all contexts)
CREATE POLICY "Admins can delete blog posts"
ON public.blog_posts FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
