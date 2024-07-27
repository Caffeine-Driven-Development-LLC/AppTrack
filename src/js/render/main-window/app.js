import { createRoot } from 'react-dom/client'
import { LocalizationProvider } from '@mui/x-date-pickers'
import NavigationMenu from '../components/navigation-menu.js'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs/AdapterDayjs.js'
import { ViewContextProvider } from './view-context.js'
import { Box, createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { EventFlowContextProvider } from './event-flow-context.js'
import { useEffect, useState } from 'react'

const container = document.getElementById('root')
const root = createRoot(container)

function App() {
    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
            background: {
                default: '#484848',
                paper: '#555555',
            },
            text: {
                primary: '#e0e0e0',
            },
            tableHeader: {
                default: `#555555`,
            },
        },
    })

    const lightTheme = createTheme({
        palette: {
            mode: 'light',
            background: {
                default: '#ffffff',
            },
            text: {
                primary: '#000000',
            },
            tableHeader: {
                default: '#f0f0f0',
            },
        },
    })

    const [theme, setTheme] = useState(lightTheme)

    useEffect(() => {
        window.settingsApi.onGetSettings((event, args) => {
            const themeToUse =
                args.displayTheme === 'system'
                    ? args.systemTheme
                    : args.displayTheme
            setTheme(themeToUse === 'dark' ? darkTheme : lightTheme)
        })
        window.settingsApi.getSettings()
        return () => {
            window.settingsApi.removeListeners()
        }
    }, [])

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ThemeProvider theme={theme}>
                <ViewContextProvider>
                    <EventFlowContextProvider>
                        <Box>
                            <CssBaseline />
                            <NavigationMenu />
                        </Box>
                    </EventFlowContextProvider>
                </ViewContextProvider>
            </ThemeProvider>
        </LocalizationProvider>
    )
}

root.render(<App />)
