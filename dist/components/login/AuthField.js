import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function AuthField({ id, label, type, value, onChange, autoComplete, required = true, inputRef, marginBottom = 'var(--base)', autoFocus = false }) {
    return /*#__PURE__*/ _jsxs("div", {
        style: {
            marginBottom
        },
        children: [
            /*#__PURE__*/ _jsx("label", {
                htmlFor: id,
                style: {
                    display: 'block',
                    color: 'var(--theme-text)',
                    marginBottom: 'calc(var(--base) * 0.5)',
                    fontSize: 'var(--font-size-small)',
                    fontWeight: 500
                },
                children: label
            }),
            /*#__PURE__*/ _jsx("input", {
                id: id,
                type: type,
                value: value,
                onChange: onChange,
                required: required,
                autoComplete: autoComplete,
                ref: inputRef,
                autoFocus: autoFocus,
                style: {
                    width: '100%',
                    padding: 'calc(var(--base) * 0.75)',
                    background: 'var(--theme-input-bg)',
                    border: '1px solid var(--theme-elevation-150)',
                    borderRadius: 'var(--style-radius-s)',
                    color: 'var(--theme-text)',
                    fontSize: 'var(--font-size-base)',
                    outline: 'none',
                    boxSizing: 'border-box'
                }
            })
        ]
    });
}
