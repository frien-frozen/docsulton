import { createNavigation } from 'next-intl/navigation';

export const locales = ['uz', 'ru', 'en'] as const;
export const localePrefix = 'always'; // Default

export const { Link, redirect, usePathname, useRouter } =
    createNavigation({ locales, localePrefix });
1