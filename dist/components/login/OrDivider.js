import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function OrDivider() {
    return /*#__PURE__*/ _jsxs("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            margin: 'calc(var(--base) * 1.5) 0',
            gap: 'calc(var(--base) * 1)'
        },
        children: [
            /*#__PURE__*/ _jsx("div", {
                style: {
                    flex: 1,
                    height: '1px',
                    background: 'var(--theme-elevation-150)'
                }
            }),
            /*#__PURE__*/ _jsx("span", {
                style: {
                    color: 'var(--theme-text)',
                    opacity: 0.6,
                    fontSize: 'var(--font-size-small)'
                },
                children: "or"
            }),
            /*#__PURE__*/ _jsx("div", {
                style: {
                    flex: 1,
                    height: '1px',
                    background: 'var(--theme-elevation-150)'
                }
            })
        ]
    });
}
