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
        window.api.onAllApplicationsSankeyData((event, data) => {
            setSankeyData(data)
        })

        window.api.getAllApplicationsSankeyData(dateRangeInput.startDate, dateRangeInput.endDate)
    }, [dateRangeInput])

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4">
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
            {sankeyData && <SanKeyGraph data={sankeyData} height={300} />}
        </div>
    )
}
