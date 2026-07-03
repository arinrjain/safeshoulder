'use client';

import { useTheme } from '@/lib/ThemeContext';
import TeenNav from './TeenNav';
import AdultNav from './AdultNav';

export default function NavWrapper() {
  const { theme } = useTheme();

  return theme === 'teen' ? <TeenNav /> : <AdultNav />;
}
