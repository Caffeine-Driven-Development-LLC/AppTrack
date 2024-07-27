import { createContext, useState } from 'react'
import ApplicationList from './page/application-list.js'

const initialViewHistory = [
    {
        view: <ApplicationList />,
        title: 'Applications',
    },
]

export const ViewContext = createContext()

export function ViewContextProvider({ children }) {
    const [viewHistory, setViewHistory] = useState(initialViewHistory)
    const currentView = viewHistory[viewHistory.length - 1]

    const pushView = (view, title) => {
        setViewHistory((prevState) => [
            ...prevState,
            {
                view: view,
                title: title,
            },
        ])
    }

    return (
        <ViewContext.Provider
            value={{ viewHistory, setViewHistory, currentView, pushView }}
        >
            {children}
        </ViewContext.Provider>
    )
}
