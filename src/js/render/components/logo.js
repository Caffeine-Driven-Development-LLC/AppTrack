import { useEffect } from 'react'

const COLORS = [
    '#f44336',
    '#e91e63',
    '#9c27b0',
    '#673ab7',
    '#3f51b5',
    '#2196f3',
    '#00bcd4',
    '#009688',
    '#4caf50',
    '#ffeb3b',
    '#ff9800',
    '#ff5722',
]

function hashStringToInt(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash += str.charCodeAt(i)
    }
    return hash % COLORS.length
}

export default function Logo({ companyName, logoPath, trigger, size = 'md' }) {
    const hrefToLogo = logoPath ? `media://${logoPath}` : null

    useEffect(() => {}, [trigger])

    const background = COLORS[hashStringToInt(companyName || '')]

    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
    }

    if (hrefToLogo) {
        return (
            <img
                src={hrefToLogo}
                alt={companyName}
                className={`${sizeClasses[size]} rounded object-cover`}
            />
        )
    }

    return (
        <div
            className={`${sizeClasses[size]} rounded flex items-center justify-center font-semibold text-white`}
            style={{ backgroundColor: background }}
        >
            {companyName?.[0]?.toUpperCase() || ''}
        </div>
    )
}
