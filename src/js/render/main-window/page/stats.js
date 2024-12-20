import { useEffect, useState } from 'react'
import SanKeyGraph from '../../components/sankey-graph.js'
import { Stack } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'

export default function () {
    const [sankeyData, setSankeyData] = useState(null)
    const [dateRangeInput, setDateRangeInput] = useState(
        {
            startDate: null,
            endDate: null
        }
    )

    useEffect(() => {
        window.api.onAllApplicationsSankeyData((event, data) => {
            setSankeyData(data)
        })

        window.api.getAllApplicationsSankeyData(dateRangeInput.startDate, dateRangeInput.endDate)
    }, [dateRangeInput])

    const handleChange = (event) => {
        let {id, value} = event.target
        setDateRangeInput((prevState) => ({
            ...prevState,
                [id]: value,
        }))
    }

    return (
        <Stack spacing={2}>
            <Stack spacing={2} direction="row" >
                <DatePicker
                    label="Start Date"
                    onChange={(date) =>
                        handleChange({
                            target: {
                                id: 'startDate',
                                value: date?.format('YYYY-MM-DD')
                            },
                        })
                    }
                    slotProps={{
                        textField: { size: "small" },
                        field: {clearable: true, onClear: () => handleChange({
                            target: {
                                id: 'startDate',
                                value: null
                            },
                        })},
                    }}
                />
                <DatePicker
                    label="End Date"
                    size="small"
                    onChange={(date) =>
                        handleChange({
                            target: {
                                id: 'endDate',
                                value: date?.format('YYYY-MM-DD')
                            },
                        })
                    }
                    slotProps={{
                        textField: { size: "small" },
                        field: {clearable: true, onClear: () => handleChange({
                                target: {
                                    id: 'endDate',
                                    value: null
                                },
                            })},
                    }}
                />
            </Stack>
            {sankeyData && <SanKeyGraph data={sankeyData} height={300} />}
        </Stack>
    )
}
