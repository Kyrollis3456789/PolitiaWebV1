export interface NavigationItem {
  id: string;
  labelEn: string;
  labelAr: string;
  href: string;
  iconName?: string;
  badge?: string;
  isExternal?: boolean;
}

export type PortalSection = 'dashboard' | 'reader' | 'community' | 'settings';
