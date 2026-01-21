import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    // Force Uzbek locale only
    locales: ['uz'],
    defaultLocale: 'uz',
    localePrefix: 'always'
});

export const config = {
    // Match only internationalized pathnames
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
