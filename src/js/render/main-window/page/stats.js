import { useEffect, useState } from 'react'
import SanKeyGraph from '../../components/sankey-graph.js'
import { DatePicker } from '../../ui/index.js'

export default function Stats() {
    const [sankeyData, setSankeyData] = useState(null)
    const [dateRangeInput, setDateRangeInput] = useState({
        startDate: null,
        endDate: null
    })

    useEffect(() => {
        window.applicationApi.onGetAllApplicationsSankeyData((event, data) => {
            setSankeyData(data)
        })

        window.applicationApi.getAllApplicationsSankeyData(dateRangeInput.startDate, dateRangeInput.endDate)

        return () => {
            window.applicationApi.removeListeners()
        }
    }, [])

    useEffect(() => {
        window.applicationApi.getAllApplicationsSankeyData(dateRangeInput.startDate, dateRangeInput.endDate)
    }, [dateRangeInput])

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-end justify-between">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Application Flow
                </h2>
                <div className="flex gap-3">
                    <DatePicker
                        label="Start Date"
                        value={dateRangeInput.startDate}
                        onChange={(value) =>
                            setDateRangeInput((prev) => ({ ...prev, startDate: value }))
                        }
                        clearable
                    />
                    <DatePicker
                        label="End Date"
                        value={dateRangeInput.endDate}
                        onChange={(value) =>
                            setDateRangeInput((prev) => ({ ...prev, endDate: value }))
                        }
                        clearable
                    />
                </div>
            </div>
            {sankeyData ? (
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4">
                    <SanKeyGraph data={sankeyData} height={300} />
                </div>
            ) : (
                <div className="text-center py-12 text-[var(--text-muted)]">
                    No application data to display. Start tracking applications to see your flow.
                </div>
            )}
        </div>
    )
}
