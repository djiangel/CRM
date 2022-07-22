import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2';
import { Empty } from 'antd';

export default function RevenueForecast({ revenue }) {

    const [line, setLine] = useState(null);

    useEffect(() => {
        if (revenue) {
            setLine({
                labels: revenue.forecast.map(d => d.date),
                datasets: [
                    {
                        label: 'Revenue Forecast',
                        fill: true,
                        lineTension: 0.4,
                        borderWidth: 1,
                        backgroundColor: 'rgba(75,192,192,0.4)',
                        borderColor: 'rgba(75,192,192,1)',
                        pointBorderColor: 'rgba(75,192,192,1)',
                        pointBackgroundColor: '#fff',
                        pointBorderWidth: 1,
                        pointHoverRadius: 9,
                        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                        pointHoverBorderColor: 'rgba(220,220,220,1)',
                        pointHoverBorderWidth: 2,
                        pointRadius: 3,
                        data: revenue.forecast.map(d => d.rev_sum)
                    },
                    {
                        label: 'Actual Revenue',
                        fill: true,
                        lineTension: 0.4,
                        borderWidth: 1,
                        backgroundColor: 'rgba(75,192,192,0.4)',
                        borderColor: 'rgba(75,192,192,1)',
                        pointBorderColor: 'rgba(75,192,192,1)',
                        pointBackgroundColor: '#fff',
                        pointBorderWidth: 1,
                        pointHoverRadius: 9,
                        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                        pointHoverBorderColor: 'rgba(220,220,220,1)',
                        pointHoverBorderWidth: 2,
                        pointRadius: 3,
                        data: revenue.revenue.map(d => d.rev_sum)
                    }
                ]
            })
        }
    }, [revenue])


    return (
        revenue.forecast.length || revenue.revenue.length ?
            <Line data={line}
                options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    legend: { position: 'bottom' },
                    layout: {
                        padding: {
                            right: 5,
                        }
                    }
                }} />
            : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />

    )
}