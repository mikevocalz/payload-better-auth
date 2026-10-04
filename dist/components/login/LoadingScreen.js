import { jsx as _jsx } from "react/jsx-runtime";
export function LoadingScreen() {
    return /*#__PURE__*/ _jsx("div", {
        style: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--theme-bg)'
        },
        children: /*#__PURE__*/ _jsx("div", {
            style: {
                color: 'var(--theme-text)',
                opacity: 0.7
            },
            children: "Loading..."
        })
    });
}
