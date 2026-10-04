'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useRef } from 'react';
import { createAuthClient } from 'better-auth/react';
import { useAuthClientBaseURL } from '../useAuthMountPath.js';
/**
 * Client component for API keys management.
 * Lists, creates, and deletes API keys with permission selection (read/write per collection).
 */ export function ApiKeysManagementClient({ authClient: providedClient, title = 'API Keys', permissions = [], organizations = [] } = {}) {
    const [apiKeys, setApiKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyExpiry, setNewKeyExpiry] = useState('');
    // Selected permissions: { posts: ['read', 'write'], pages: ['read'] }
    const [selectedPermissions, setSelectedPermissions] = useState({});
    const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
    const [selectedOrganizationId, setSelectedOrganizationId] = useState('');
    const hasPermissions = permissions.length > 0;
    const hasOrganizations = organizations.length > 0;
    const authBaseURL = useAuthClientBaseURL();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientRef = useRef(null);
    const getClient = async ()=>{
        if (providedClient) return providedClient;
        if (clientRef.current) return clientRef.current;
        const { apiKeyClient } = await import('@better-auth/api-key/client');
        clientRef.current = createAuthClient({
            ...authBaseURL ? {
                baseURL: authBaseURL
            } : {},
            plugins: [
                apiKeyClient()
            ]
        });
        return clientRef.current;
    };
    // Toggle a specific action for a collection
    function toggleAction(slug, action) {
        setSelectedPermissions((prev)=>{
            const current = prev[slug] ?? [];
            if (current.includes(action)) {
                // Remove action — if removing 'read' also remove 'write'
                if (action === 'read') {
                    const filtered = current.filter((a)=>a !== 'read' && a !== 'write');
                    if (filtered.length === 0) {
                        const { [slug]: _, ...rest } = prev;
                        return rest;
                    }
                    return {
                        ...prev,
                        [slug]: filtered
                    };
                }
                const filtered = current.filter((a)=>a !== action);
                if (filtered.length === 0) {
                    const { [slug]: _, ...rest } = prev;
                    return rest;
                }
                return {
                    ...prev,
                    [slug]: filtered
                };
            } else {
                // Add action — if adding 'write' also add 'read'
                if (action === 'write') {
                    return {
                        ...prev,
                        [slug]: [
                            ...new Set([
                                ...current,
                                'read',
                                'write'
                            ])
                        ]
                    };
                }
                return {
                    ...prev,
                    [slug]: [
                        ...current,
                        action
                    ]
                };
            }
        });
    }
    // Bulk toggle all of an action type
    function toggleAllOfType(action) {
        const allHave = permissions.every((p)=>(selectedPermissions[p.slug] ?? []).includes(action));
        if (allHave) {
            // Remove this action from all — if removing 'read' also remove 'write'
            setSelectedPermissions((prev)=>{
                const next = {};
                for (const [slug, actions] of Object.entries(prev)){
                    const filtered = action === 'read' ? actions.filter((a)=>a !== 'read' && a !== 'write') : actions.filter((a)=>a !== action);
                    if (filtered.length > 0) next[slug] = filtered;
                }
                return next;
            });
        } else {
            // Add this action to all — if 'write' also add 'read'
            setSelectedPermissions((prev)=>{
                const next = {
                    ...prev
                };
                for (const p of permissions){
                    const current = next[p.slug] ?? [];
                    if (action === 'write') {
                        next[p.slug] = [
                            ...new Set([
                                ...current,
                                'read',
                                'write'
                            ])
                        ];
                    } else {
                        next[p.slug] = [
                            ...new Set([
                                ...current,
                                action
                            ])
                        ];
                    }
                }
                return next;
            });
        }
    }
    function isAllOfTypeSelected(action) {
        return permissions.length > 0 && permissions.every((p)=>(selectedPermissions[p.slug] ?? []).includes(action));
    }
    function isSomeOfTypeSelected(action) {
        const count = permissions.filter((p)=>(selectedPermissions[p.slug] ?? []).includes(action)).length;
        return count > 0 && count < permissions.length;
    }
    function clearAll() {
        setSelectedPermissions({});
    }
    function selectAll() {
        const next = {};
        for (const p of permissions){
            next[p.slug] = [
                'read',
                'write'
            ];
        }
        setSelectedPermissions(next);
    }
    // Count total selected actions
    const selectedCount = useMemo(()=>{
        let count = 0;
        for (const actions of Object.values(selectedPermissions)){
            count += actions.length;
        }
        return count;
    }, [
        selectedPermissions
    ]);
    // Format permissions for display
    function formatPermissions(perms) {
        if (!perms) return [];
        const labels = [];
        for (const [slug, actions] of Object.entries(perms)){
            const def = permissions.find((p)=>p.slug === slug);
            const label = def?.label ?? slug;
            for (const action of actions){
                labels.push(`${label}: ${action}`);
            }
        }
        return labels;
    }
    useEffect(()=>{
        let ignore = false;
        fetchApiKeys(()=>!ignore);
        return ()=>{
            ignore = true;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // `isActive` guards against setState after unmount and StrictMode double-fetch.
    // Defaults to always-active for the post-mutation re-fetches, which run while
    // the component is mounted.
    async function fetchApiKeys(isActive = ()=>true) {
        setLoading(true);
        setError(null);
        try {
            const client = await getClient();
            const result = await client.apiKey.list();
            if (!isActive()) return;
            if (result.error) {
                setError(result.error.message ?? 'Failed to load API keys');
            } else {
                const data = result.data;
                setApiKeys(Array.isArray(data) ? data : data.apiKeys ?? []);
            }
        } catch  {
            if (isActive()) setError('Failed to load API keys');
        } finally{
            if (isActive()) setLoading(false);
        }
    }
    async function handleCreate(e) {
        e.preventDefault();
        setCreating(true);
        setError(null);
        setNewlyCreatedKey(null);
        try {
            const client = await getClient();
            const createOptions = {
                name: newKeyName
            };
            if (newKeyExpiry) {
                createOptions.expiresIn = parseInt(newKeyExpiry) * 24 * 60 * 60;
            }
            // Send permissions directly in BA's native format
            if (hasPermissions && selectedCount > 0) {
                createOptions.permissions = selectedPermissions;
            }
            // Bind to organization if selected
            if (selectedOrganizationId) {
                createOptions.organizationId = selectedOrganizationId;
            }
            const result = await client.apiKey.create(createOptions);
            if (result.error) {
                setError(result.error.message ?? 'Failed to create API key');
            } else if (result.data) {
                setNewlyCreatedKey(result.data.key);
                setShowCreateForm(false);
                setNewKeyName('');
                setNewKeyExpiry('');
                setSelectedPermissions({});
                setSelectedOrganizationId('');
                fetchApiKeys();
            }
        } catch  {
            setError('Failed to create API key');
        } finally{
            setCreating(false);
        }
    }
    async function handleDelete(keyId) {
        if (!confirm('Are you sure you want to delete this API key?')) {
            return;
        }
        setDeleting(keyId);
        setError(null);
        try {
            const client = await getClient();
            const result = await client.apiKey.delete({
                keyId
            });
            if (result.error) {
                setError(result.error.message ?? 'Failed to delete API key');
            } else {
                setApiKeys((prev)=>prev.filter((k)=>k.id !== keyId));
            }
        } catch  {
            setError('Failed to delete API key');
        } finally{
            setDeleting(null);
        }
    }
    function formatDate(date) {
        if (!date) return 'Never';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleString();
    }
    return /*#__PURE__*/ _jsxs("div", {
        style: {
            maxWidth: '900px',
            margin: '0 auto',
            padding: 'calc(var(--base) * 2)'
        },
        children: [
            /*#__PURE__*/ _jsxs("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'calc(var(--base) * 2)'
                },
                children: [
                    /*#__PURE__*/ _jsx("h1", {
                        style: {
                            color: 'var(--theme-text)',
                            fontSize: 'var(--font-size-h2)',
                            fontWeight: 600,
                            margin: 0
                        },
                        children: title
                    }),
                    /*#__PURE__*/ _jsx("button", {
                        onClick: ()=>setShowCreateForm(true),
                        style: {
                            padding: 'calc(var(--base) * 0.5) calc(var(--base) * 1)',
                            background: 'var(--theme-elevation-800)',
                            border: 'none',
                            borderRadius: 'var(--style-radius-s)',
                            color: 'var(--theme-elevation-50)',
                            fontSize: 'var(--font-size-small)',
                            cursor: 'pointer'
                        },
                        children: "Create API Key"
                    })
                ]
            }),
            error && /*#__PURE__*/ _jsx("div", {
                style: {
                    color: 'var(--theme-error-500)',
                    marginBottom: 'var(--base)',
                    fontSize: 'var(--font-size-small)',
                    padding: 'calc(var(--base) * 0.75)',
                    background: 'var(--theme-error-50)',
                    borderRadius: 'var(--style-radius-s)',
                    border: '1px solid var(--theme-error-200)'
                },
                children: error
            }),
            newlyCreatedKey && /*#__PURE__*/ _jsxs("div", {
                style: {
                    marginBottom: 'calc(var(--base) * 1.5)',
                    padding: 'calc(var(--base) * 1)',
                    background: 'var(--theme-success-50)',
                    borderRadius: 'var(--style-radius-m)',
                    border: '1px solid var(--theme-success-200)'
                },
                children: [
                    /*#__PURE__*/ _jsx("div", {
                        style: {
                            color: 'var(--theme-success-700)',
                            fontWeight: 500,
                            marginBottom: 'calc(var(--base) * 0.5)'
                        },
                        children: "API Key Created"
                    }),
                    /*#__PURE__*/ _jsx("p", {
                        style: {
                            color: 'var(--theme-text)',
                            opacity: 0.8,
                            fontSize: 'var(--font-size-small)',
                            marginBottom: 'calc(var(--base) * 0.5)'
                        },
                        children: "Copy this key now - you won't be able to see it again:"
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                        style: {
                            display: 'flex',
                            gap: 'calc(var(--base) * 0.5)',
                            alignItems: 'center'
                        },
                        children: [
                            /*#__PURE__*/ _jsx("code", {
                                style: {
                                    flex: 1,
                                    padding: 'calc(var(--base) * 0.5)',
                                    background: 'var(--theme-elevation-100)',
                                    borderRadius: 'var(--style-radius-s)',
                                    fontFamily: 'monospace',
                                    fontSize: 'var(--font-size-small)',
                                    color: 'var(--theme-text)',
                                    wordBreak: 'break-all'
                                },
                                children: newlyCreatedKey
                            }),
                            /*#__PURE__*/ _jsx("button", {
                                onClick: ()=>{
                                    navigator.clipboard.writeText(newlyCreatedKey);
                                },
                                style: {
                                    padding: 'calc(var(--base) * 0.5)',
                                    background: 'var(--theme-elevation-200)',
                                    border: 'none',
                                    borderRadius: 'var(--style-radius-s)',
                                    cursor: 'pointer'
                                },
                                children: "Copy"
                            })
                        ]
                    })
                ]
            }),
            showCreateForm && /*#__PURE__*/ _jsxs("div", {
                style: {
                    marginBottom: 'calc(var(--base) * 1.5)',
                    padding: 'calc(var(--base) * 1.5)',
                    background: 'var(--theme-elevation-50)',
                    borderRadius: 'var(--style-radius-m)',
                    border: '1px solid var(--theme-elevation-100)'
                },
                children: [
                    /*#__PURE__*/ _jsx("h2", {
                        style: {
                            color: 'var(--theme-text)',
                            fontSize: 'var(--font-size-h4)',
                            fontWeight: 500,
                            margin: '0 0 var(--base) 0'
                        },
                        children: "Create New API Key"
                    }),
                    /*#__PURE__*/ _jsxs("form", {
                        onSubmit: handleCreate,
                        children: [
                            /*#__PURE__*/ _jsxs("div", {
                                style: {
                                    marginBottom: 'var(--base)'
                                },
                                children: [
                                    /*#__PURE__*/ _jsx("label", {
                                        style: {
                                            display: 'block',
                                            color: 'var(--theme-text)',
                                            fontSize: 'var(--font-size-small)',
                                            marginBottom: 'calc(var(--base) * 0.25)'
                                        },
                                        children: "Name"
                                    }),
                                    /*#__PURE__*/ _jsx("input", {
                                        type: "text",
                                        value: newKeyName,
                                        onChange: (e)=>setNewKeyName(e.target.value),
                                        required: true,
                                        placeholder: "My API Key",
                                        style: {
                                            width: '100%',
                                            padding: 'calc(var(--base) * 0.5)',
                                            background: 'var(--theme-input-bg)',
                                            border: '1px solid var(--theme-elevation-150)',
                                            borderRadius: 'var(--style-radius-s)',
                                            color: 'var(--theme-text)',
                                            boxSizing: 'border-box'
                                        }
                                    })
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                style: {
                                    marginBottom: 'var(--base)'
                                },
                                children: [
                                    /*#__PURE__*/ _jsx("label", {
                                        style: {
                                            display: 'block',
                                            color: 'var(--theme-text)',
                                            fontSize: 'var(--font-size-small)',
                                            marginBottom: 'calc(var(--base) * 0.25)'
                                        },
                                        children: "Expires in (days, optional)"
                                    }),
                                    /*#__PURE__*/ _jsx("input", {
                                        type: "number",
                                        value: newKeyExpiry,
                                        onChange: (e)=>setNewKeyExpiry(e.target.value),
                                        placeholder: "30",
                                        min: "1",
                                        style: {
                                            width: '100%',
                                            padding: 'calc(var(--base) * 0.5)',
                                            background: 'var(--theme-input-bg)',
                                            border: '1px solid var(--theme-elevation-150)',
                                            borderRadius: 'var(--style-radius-s)',
                                            color: 'var(--theme-text)',
                                            boxSizing: 'border-box'
                                        }
                                    })
                                ]
                            }),
                            hasOrganizations && /*#__PURE__*/ _jsxs("div", {
                                style: {
                                    marginBottom: 'var(--base)'
                                },
                                children: [
                                    /*#__PURE__*/ _jsx("label", {
                                        style: {
                                            display: 'block',
                                            color: 'var(--theme-text)',
                                            fontSize: 'var(--font-size-small)',
                                            marginBottom: 'calc(var(--base) * 0.25)'
                                        },
                                        children: "Organization (optional)"
                                    }),
                                    /*#__PURE__*/ _jsxs("select", {
                                        value: selectedOrganizationId,
                                        onChange: (e)=>setSelectedOrganizationId(e.target.value),
                                        style: {
                                            width: '100%',
                                            padding: 'calc(var(--base) * 0.5)',
                                            background: 'var(--theme-input-bg)',
                                            border: '1px solid var(--theme-elevation-150)',
                                            borderRadius: 'var(--style-radius-s)',
                                            color: 'var(--theme-text)',
                                            boxSizing: 'border-box'
                                        },
                                        children: [
                                            /*#__PURE__*/ _jsx("option", {
                                                value: "",
                                                children: "No organization (global key)"
                                            }),
                                            organizations.map((org)=>/*#__PURE__*/ _jsx("option", {
                                                    value: String(org.id),
                                                    children: org.name
                                                }, String(org.id)))
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
                                        style: {
                                            marginTop: 'calc(var(--base) * 0.25)',
                                            fontSize: '11px',
                                            color: 'var(--theme-elevation-600)'
                                        },
                                        children: selectedOrganizationId ? 'API key will only have access to this organization\'s data.' : 'Without an organization, the key will not have org-scoped access.'
                                    })
                                ]
                            }),
                            hasPermissions && /*#__PURE__*/ _jsxs("div", {
                                style: {
                                    marginBottom: 'var(--base)'
                                },
                                children: [
                                    /*#__PURE__*/ _jsx("label", {
                                        style: {
                                            display: 'block',
                                            color: 'var(--theme-text)',
                                            fontSize: 'var(--font-size-small)',
                                            marginBottom: 'calc(var(--base) * 0.5)'
                                        },
                                        children: "Permissions"
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        style: {
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 'calc(var(--base) * 0.5)',
                                            marginBottom: 'calc(var(--base) * 0.75)'
                                        },
                                        children: [
                                            /*#__PURE__*/ _jsx(BulkButton, {
                                                label: "All Read",
                                                active: isAllOfTypeSelected('read'),
                                                indeterminate: isSomeOfTypeSelected('read'),
                                                onClick: ()=>toggleAllOfType('read')
                                            }),
                                            /*#__PURE__*/ _jsx(BulkButton, {
                                                label: "All Write",
                                                active: isAllOfTypeSelected('write'),
                                                indeterminate: isSomeOfTypeSelected('write'),
                                                onClick: ()=>toggleAllOfType('write')
                                            }),
                                            /*#__PURE__*/ _jsx("div", {
                                                style: {
                                                    flex: 1
                                                }
                                            }),
                                            /*#__PURE__*/ _jsx("button", {
                                                type: "button",
                                                onClick: selectAll,
                                                style: {
                                                    padding: '4px 8px',
                                                    background: 'transparent',
                                                    border: '1px solid var(--theme-elevation-200)',
                                                    borderRadius: 'var(--style-radius-s)',
                                                    color: 'var(--theme-text)',
                                                    fontSize: '11px',
                                                    cursor: 'pointer',
                                                    opacity: 0.8
                                                },
                                                children: "Select All"
                                            }),
                                            /*#__PURE__*/ _jsx("button", {
                                                type: "button",
                                                onClick: clearAll,
                                                style: {
                                                    padding: '4px 8px',
                                                    background: 'transparent',
                                                    border: '1px solid var(--theme-elevation-200)',
                                                    borderRadius: 'var(--style-radius-s)',
                                                    color: 'var(--theme-text)',
                                                    fontSize: '11px',
                                                    cursor: 'pointer',
                                                    opacity: 0.8
                                                },
                                                children: "Clear"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        style: {
                                            background: 'var(--theme-input-bg)',
                                            border: '1px solid var(--theme-elevation-150)',
                                            borderRadius: 'var(--style-radius-s)',
                                            maxHeight: '400px',
                                            overflowY: 'auto'
                                        },
                                        children: [
                                            /*#__PURE__*/ _jsxs("div", {
                                                style: {
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 60px 60px',
                                                    gap: 'calc(var(--base) * 0.5)',
                                                    padding: 'calc(var(--base) * 0.5) calc(var(--base) * 0.75)',
                                                    borderBottom: '1px solid var(--theme-elevation-150)',
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    color: 'var(--theme-elevation-600)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ _jsx("span", {
                                                        children: "Collection"
                                                    }),
                                                    /*#__PURE__*/ _jsx("span", {
                                                        style: {
                                                            textAlign: 'center'
                                                        },
                                                        children: "Read"
                                                    }),
                                                    /*#__PURE__*/ _jsx("span", {
                                                        style: {
                                                            textAlign: 'center'
                                                        },
                                                        children: "Write"
                                                    })
                                                ]
                                            }),
                                            permissions.map((perm)=>{
                                                const actions = selectedPermissions[perm.slug] ?? [];
                                                const hasRead = actions.includes('read');
                                                const hasWrite = actions.includes('write');
                                                return /*#__PURE__*/ _jsxs("div", {
                                                    style: {
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr 60px 60px',
                                                        gap: 'calc(var(--base) * 0.5)',
                                                        padding: 'calc(var(--base) * 0.5) calc(var(--base) * 0.75)',
                                                        borderBottom: '1px solid var(--theme-elevation-100)',
                                                        alignItems: 'center',
                                                        background: hasRead || hasWrite ? 'var(--theme-elevation-50)' : 'transparent'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ _jsx("span", {
                                                            style: {
                                                                color: 'var(--theme-text)',
                                                                fontSize: 'var(--font-size-small)',
                                                                fontWeight: 500
                                                            },
                                                            children: perm.label
                                                        }),
                                                        /*#__PURE__*/ _jsx("label", {
                                                            style: {
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                cursor: 'pointer'
                                                            },
                                                            children: /*#__PURE__*/ _jsx("input", {
                                                                type: "checkbox",
                                                                checked: hasRead,
                                                                onChange: ()=>toggleAction(perm.slug, 'read'),
                                                                style: {
                                                                    cursor: 'pointer'
                                                                }
                                                            })
                                                        }),
                                                        /*#__PURE__*/ _jsx("label", {
                                                            style: {
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                cursor: 'pointer'
                                                            },
                                                            children: /*#__PURE__*/ _jsx("input", {
                                                                type: "checkbox",
                                                                checked: hasWrite,
                                                                onChange: ()=>toggleAction(perm.slug, 'write'),
                                                                style: {
                                                                    cursor: 'pointer'
                                                                }
                                                            })
                                                        })
                                                    ]
                                                }, perm.slug);
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
                                        style: {
                                            marginTop: 'calc(var(--base) * 0.5)',
                                            fontSize: '11px',
                                            color: selectedCount === 0 ? 'var(--theme-warning-500)' : 'var(--theme-elevation-600)'
                                        },
                                        children: selectedCount === 0 ? 'No permissions selected. Key will have no access.' : `${selectedCount} permission${selectedCount === 1 ? '' : 's'} selected`
                                    })
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                style: {
                                    display: 'flex',
                                    gap: 'calc(var(--base) * 0.5)'
                                },
                                children: [
                                    /*#__PURE__*/ _jsx("button", {
                                        type: "submit",
                                        disabled: creating,
                                        style: {
                                            padding: 'calc(var(--base) * 0.5) calc(var(--base) * 1)',
                                            background: 'var(--theme-elevation-800)',
                                            border: 'none',
                                            borderRadius: 'var(--style-radius-s)',
                                            color: 'var(--theme-elevation-50)',
                                            fontSize: 'var(--font-size-small)',
                                            cursor: creating ? 'not-allowed' : 'pointer',
                                            opacity: creating ? 0.7 : 1
                                        },
                                        children: creating ? 'Creating...' : 'Create'
                                    }),
                                    /*#__PURE__*/ _jsx("button", {
                                        type: "button",
                                        onClick: ()=>setShowCreateForm(false),
                                        style: {
                                            padding: 'calc(var(--base) * 0.5) calc(var(--base) * 1)',
                                            background: 'transparent',
                                            border: '1px solid var(--theme-elevation-200)',
                                            borderRadius: 'var(--style-radius-s)',
                                            color: 'var(--theme-text)',
                                            fontSize: 'var(--font-size-small)',
                                            cursor: 'pointer'
                                        },
                                        children: "Cancel"
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }),
            loading ? /*#__PURE__*/ _jsx("div", {
                style: {
                    color: 'var(--theme-text)',
                    opacity: 0.7,
                    textAlign: 'center',
                    padding: 'calc(var(--base) * 3)'
                },
                children: "Loading API keys..."
            }) : apiKeys.length === 0 ? /*#__PURE__*/ _jsx("div", {
                style: {
                    color: 'var(--theme-text)',
                    opacity: 0.7,
                    textAlign: 'center',
                    padding: 'calc(var(--base) * 3)'
                },
                children: "No API keys found. Create one to get started."
            }) : /*#__PURE__*/ _jsx("div", {
                style: {
                    background: 'var(--theme-elevation-50)',
                    borderRadius: 'var(--style-radius-m)',
                    overflow: 'hidden',
                    border: '1px solid var(--theme-elevation-100)'
                },
                children: apiKeys.map((key, index)=>/*#__PURE__*/ _jsxs("div", {
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'calc(var(--base) * 1)',
                            borderBottom: index < apiKeys.length - 1 ? '1px solid var(--theme-elevation-100)' : 'none'
                        },
                        children: [
                            /*#__PURE__*/ _jsxs("div", {
                                style: {
                                    flex: 1
                                },
                                children: [
                                    /*#__PURE__*/ _jsx("div", {
                                        style: {
                                            color: 'var(--theme-text)',
                                            fontWeight: 500,
                                            marginBottom: 'calc(var(--base) * 0.25)'
                                        },
                                        children: key.name
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        style: {
                                            color: 'var(--theme-elevation-600)',
                                            fontSize: 'var(--font-size-small)'
                                        },
                                        children: [
                                            (key.start || key.startsWith) && /*#__PURE__*/ _jsxs("code", {
                                                children: [
                                                    key.start || key.startsWith,
                                                    "..."
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsxs("span", {
                                                children: [
                                                    " • Created: ",
                                                    formatDate(key.createdAt)
                                                ]
                                            }),
                                            key.expiresAt && /*#__PURE__*/ _jsxs("span", {
                                                children: [
                                                    " • Expires: ",
                                                    formatDate(key.expiresAt)
                                                ]
                                            }),
                                            key.lastUsedAt && /*#__PURE__*/ _jsxs("span", {
                                                children: [
                                                    " • Last used: ",
                                                    formatDate(key.lastUsedAt)
                                                ]
                                            })
                                        ]
                                    }),
                                    Boolean(key.metadata?.organizationId) && /*#__PURE__*/ _jsx("div", {
                                        style: {
                                            marginTop: 'calc(var(--base) * 0.5)'
                                        },
                                        children: /*#__PURE__*/ _jsxs("span", {
                                            style: {
                                                padding: '2px 6px',
                                                background: 'var(--theme-elevation-150)',
                                                borderRadius: 'var(--style-radius-s)',
                                                fontSize: '11px',
                                                color: 'var(--theme-elevation-700)',
                                                fontWeight: 500
                                            },
                                            children: [
                                                "Org: ",
                                                (()=>{
                                                    const orgId = String(key.metadata?.organizationId ?? '');
                                                    const org = organizations.find((o)=>String(o.id) === orgId);
                                                    return org?.name ?? orgId;
                                                })()
                                            ]
                                        })
                                    }),
                                    key.permissions && Object.keys(key.permissions).length > 0 && /*#__PURE__*/ _jsx("div", {
                                        style: {
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 'calc(var(--base) * 0.25)',
                                            marginTop: 'calc(var(--base) * 0.5)'
                                        },
                                        children: formatPermissions(key.permissions).map((label)=>/*#__PURE__*/ _jsx("span", {
                                                style: {
                                                    padding: '2px 6px',
                                                    background: 'var(--theme-elevation-100)',
                                                    borderRadius: 'var(--style-radius-s)',
                                                    fontSize: '11px',
                                                    color: 'var(--theme-elevation-700)'
                                                },
                                                children: label
                                            }, label))
                                    })
                                ]
                            }),
                            /*#__PURE__*/ _jsx("button", {
                                onClick: ()=>handleDelete(key.id),
                                disabled: deleting === key.id,
                                style: {
                                    padding: 'calc(var(--base) * 0.5) calc(var(--base) * 0.75)',
                                    background: 'transparent',
                                    border: '1px solid var(--theme-error-300)',
                                    borderRadius: 'var(--style-radius-s)',
                                    color: 'var(--theme-error-500)',
                                    fontSize: 'var(--font-size-small)',
                                    cursor: deleting === key.id ? 'not-allowed' : 'pointer',
                                    opacity: deleting === key.id ? 0.7 : 1
                                },
                                children: deleting === key.id ? 'Deleting...' : 'Delete'
                            })
                        ]
                    }, key.id))
            })
        ]
    });
}
/**
 * Bulk action button with active/indeterminate states
 */ function BulkButton({ label, active, indeterminate, onClick }) {
    return /*#__PURE__*/ _jsx("button", {
        type: "button",
        onClick: onClick,
        style: {
            padding: '4px 10px',
            background: active ? 'var(--theme-elevation-700)' : indeterminate ? 'var(--theme-elevation-300)' : 'var(--theme-elevation-100)',
            border: 'none',
            borderRadius: 'var(--style-radius-s)',
            color: active ? 'var(--theme-elevation-50)' : 'var(--theme-text)',
            fontSize: '11px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.15s'
        },
        children: label
    });
}
export default ApiKeysManagementClient;
