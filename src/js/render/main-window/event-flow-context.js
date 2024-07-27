import { createContext, useEffect, useState } from 'react'

export const EventFlowContext = createContext()

export function EventFlowContextProvider({ children }) {
    const [eventFlowMap, setEventFlowMap] = useState([])

    useEffect(() => {
        window.eventFlowApi.onEventFlowMap((event, eventFlowMap) => {
            setEventFlowMap(eventFlowMap)
        })

        window.eventFlowApi.getEventFlowMap()
    }, [])

    return (
        <EventFlowContext.Provider value={{ eventFlowMap, setEventFlowMap }}>
            {children}
        </EventFlowContext.Provider>
    )
}
