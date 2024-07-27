import { Tooltip, useTheme } from '@mui/material'

export default function ({ fillPercentage }) {
    const theme = useTheme()
    const isDarkTheme = theme.palette.mode === 'dark'

    const earlyFillHex = isDarkTheme
        ? 'rgba(45,148,36, 0.6)'
        : 'rgba(45,148,36,0.21)'
    const midFillHex = isDarkTheme
        ? 'rgba(197,182,153, 0.8)'
        : 'rgba(225,157,25,0.3)'
    const lateFillHex = isDarkTheme
        ? 'rgba(206,37,37, 0.6)'
        : 'rgba(206,37,37,0.2)'

    const fillHex =
        fillPercentage < 33
            ? earlyFillHex
            : fillPercentage < 66
              ? midFillHex
              : lateFillHex
    const notFillHex = '#00000000'

    const barStyle = {
        width: '10px',
        background: `linear-gradient(to bottom, 
    ${fillHex} ${fillPercentage}%, 
    ${notFillHex} ${fillPercentage}%)`,
    }

    const toolTipText = `${parseInt(fillPercentage)}% to ghosted`

    return (
        <Tooltip title={toolTipText}>
            <div style={barStyle}></div>
        </Tooltip>
    )
}
