// Theme configuration for SafeShoulder dual-theme system

export type Theme = 'teen' | 'adult';

export const themeConfig = {
  teen: {
    name: 'teen',
    label: 'Teen Support',
    primaryColor: '#7C3AED',
    secondaryColor: '#06B6D4',
    backgroundColor: '#0F172A',
    surfaceColor: '#1E293B',
    textColor: '#F1F5F9',
    accentColor: '#EC4899',
    personaName: 'Aisha',
    domains: ['school_bullying'],
  },
  adult: {
    name: 'adult',
    label: 'Adult Support',
    primaryColor: '#4F46E5',
    secondaryColor: '#06B6D4',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#1E293B',
    accentColor: '#E11D48',
    personaName: 'Aisha',
    domains: ['relationship_issues', 'domestic', 'financial', 'workplace'],
  },
};

export const detectTheme = (pathname: string): Theme => {
  if (pathname.startsWith('/teen')) return 'teen';
  return 'adult';
};
