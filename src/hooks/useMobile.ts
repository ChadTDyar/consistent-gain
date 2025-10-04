import { useEffect, useState } from 'react';
import { mobileService } from '@/services/mobile.service';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(mobileService.isMobile());
  }, []);

  return isMobile;
}

export function usePlatform() {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web');

  useEffect(() => {
    setPlatform(mobileService.getPlatform());
  }, []);

  return platform;
}

export function useHaptics() {
  return {
    impact: mobileService.hapticImpact.bind(mobileService),
    success: mobileService.hapticSuccess.bind(mobileService),
    warning: mobileService.hapticWarning.bind(mobileService),
    error: mobileService.hapticError.bind(mobileService),
  };
}
