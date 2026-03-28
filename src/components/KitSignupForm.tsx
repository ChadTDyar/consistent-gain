import { useEffect } from 'react';

interface KitSignupFormProps {
  className?: string;
}

export function KitSignupForm({ className }: KitSignupFormProps) {
  useEffect(() => {
    const uid = 'a6166c24ca';
    if (document.querySelector(`script[data-uid="${uid}"]`)) return;

    const script = document.createElement('script');
    script.src = `https://lab-notes-2.ck.page/${uid}/index.js`;
    script.async = true;
    script.setAttribute('data-uid', uid);
    document.head.appendChild(script);

    return () => {
      const s = document.querySelector(`script[data-uid="${uid}"]`);
      if (s) document.head.removeChild(s);
    };
  }, []);

  return <div className={className} data-uid="a6166c24ca" />;
}
