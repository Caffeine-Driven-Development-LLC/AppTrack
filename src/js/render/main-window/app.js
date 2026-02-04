import { createRoot } from 'react-dom/client'
import Navigation from '../components/navigation.js'
import { ViewContextProvider } from './view-context.js'
import { EventFlowContextProvider } from './event-flow-context.js'
import { TooltipProvider } from '../ui/Tooltip.jsx'
import { useEffect } from 'react'

const container = document.getElementById('root')
const root = createRoot(container)

function App() {
    useEffect(() => {
        window.settingsApi.onGetSettings((event, args) => {
            const themeToUse =
                args.displayTheme === 'system'
                    ? args.systemTheme
                    : args.displayTheme
            const useDark = themeToUse === 'dark'

            // Sync Tailwind dark class with theme
            if (useDark) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        })
        window.settingsApi.getSettings()

        // Default to dark mode
        document.documentElement.classList.add('dark')

        return () => {
            window.settingsApi.removeListeners()
        }
    }, [])

    return (
        <TooltipProvider>
            <ViewContextProvider>
                <EventFlowContextProvider>
                    <Navigation />
                </EventFlowContextProvider>
            </ViewContextProvider>
        </TooltipProvider>
    )
}

root.render(<App />)
