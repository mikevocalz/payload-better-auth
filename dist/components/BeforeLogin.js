'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation.js';
import { useConfig } from '@payloadcms/ui';
/**
 * BeforeLogin component that redirects to the custom login page.
 * Injected into Payload's beforeLogin slot to intercept default login.
 */ export function BeforeLogin({ loginUrl } = {}) {
    const router = useRouter();
    const { config: { routes: { admin: adminRoute } } } = useConfig();
    const target = loginUrl ?? `${adminRoute}/login`;
    useEffect(()=>{
        router.replace(target);
    }, [
        router,
        target
    ]);
    // Show loading state while redirecting
    return /*#__PURE__*/ _jsx("div", {
        style: {
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--theme-bg)',
            color: 'var(--theme-text)'
        },
        children: /*#__PURE__*/ _jsx("div", {
            children: "Redirecting to login..."
        })
    });
}
export default BeforeLogin;
