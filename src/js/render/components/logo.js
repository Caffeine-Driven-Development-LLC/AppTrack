import { Avatar, Box, useTheme } from '@mui/material'
import { useEffect } from 'react'

export default function ({ companyName, logoPath, trigger }) {
    const theme = useTheme()

    const hrefToLogo = logoPath ? `media://${logoPath}` : null

    useEffect(() => {}, [trigger])

    const colors = [
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
        return hash % colors.length
    }

    const background = colors[hashStringToInt(companyName)]

    return (
        <Avatar variant="square" alt={companyName} src={hrefToLogo}>
            <Box
                sx={{
                    bgcolor: background,
                    color: theme.palette.text.primary,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {companyName[0]?.toUpperCase() || ''}
            </Box>
        </Avatar>
    )
}
