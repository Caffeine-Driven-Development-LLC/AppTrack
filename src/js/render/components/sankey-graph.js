import React, { useEffect, useRef, useState } from 'react'
import { Chart, LinearScale, Tooltip } from 'chart.js'
import { Flow, SankeyController } from 'chartjs-chart-sankey'

Chart.register(SankeyController, Flow, LinearScale, Tooltip)

export default function SankeyGraph({ data, height }) {
    const [chart, setChart] = useState(null)
    const svgRef = useRef()

    const isDarkTheme = document.documentElement.classList.contains('dark')
    const textColor = isDarkTheme ? '#f8f8f8' : '#1e1e1e'

    const defaultColor = '#6abaaa'

    const drawChart = () => {
        const { nodes, links } = data

        const ctx = svgRef?.current.getContext('2d')

        const getColor = (c) => {
            return nodes?.find((n) => n.name === c)?.color || defaultColor
        }

        const l = nodes.reduce((acc, c) => {
            acc[c.name] = `${c.name} (${c.value})`
            return acc
        }, {})

        return new Chart(ctx, {
            type: 'sankey',
            data: {
                datasets: [
                    {
                        data: links,
                        labels: l,
                        colorFrom: (c) =>
                            getColor(
                                c?.dataset?.data[c.dataIndex]?.from ||
                                    defaultColor
                            ),
                        colorTo: (c) =>
                            getColor(
                                c?.dataset?.data[c.dataIndex]?.to ||
                                    defaultColor
                            ),
                        colorMode: 'gradient',
                        borderWidth: 1,
                        borderColor: 'black',
                        color: textColor,
                    },
                ],
            },
            options: {
                plugins: {
                    tooltip: {
                        displayColors: false,
                        callbacks: {
                            label(context) {
                                const { dataset, dataIndex } = context
                                const { from, to, flow } =
                                    dataset.data[dataIndex]
                                const fromNodeValue = nodes.find(
                                    (n) => n.name === from
                                ).value
                                const percentFromFlow = (
                                    (flow / fromNodeValue) *
                                    100
                                ).toFixed(2)
                                return `${from} -> ${to}: ${flow} (${percentFromFlow}%)`
                            },
                        },
                    },
                },
                maintainAspectRatio: false,
            },
        })
    }

    useEffect(() => {
        chart?.destroy()
        setChart(null)
        setChart(drawChart())
    }, [isDarkTheme, data])

    return (
        <canvas
            ref={svgRef}
            style={{
                maxHeight: `${height || 100}px`,
                minHeight: `${height || 100}px`,
                width: '100%',
            }}
        />
    )
}
