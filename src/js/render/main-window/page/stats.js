import { useEffect, useState } from 'react'
import SanKeyGraph from '../../components/sankey-graph.js'
import { Stack } from '@mui/material'

export default function () {
    const [sankeyData, setSankeyData] = useState(null)

    useEffect(() => {
        window.api.onAllApplicationsSankeyData((event, data) => {
            setSankeyData(data)
        })

        window.api.getAllApplicationsSankeyData()
    }, [])

    return (
        <Stack>
            {sankeyData && <SanKeyGraph data={sankeyData} height={300} />}
        </Stack>
    )
}
