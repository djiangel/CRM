import React, { useRef, useEffect, useState } from "react";
import axiosInstance from '../../api/axiosApi';
import { Empty, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux'
import { Bar, Line } from 'react-chartjs-2';


export default function EstimatedRevenue() {

    const data = useSelector(state => state.api.analytics.estimated_revenue)

    const [line, setLine] = useState(null);
    const [bar, setBar] = useState(null);

    useEffect(() => {
        setBar({
            labels: data.map(d => d.sales_project_name),
            datasets: [
                {
                    label: 'Estimated Revenue',
                    backgroundColor: 'rgba(255,99,132,0.2)',
                    borderColor: 'rgba(255,99,132,1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                    hoverBorderColor: 'rgba(255,99,132,1)',
                    data: data.map(d => d.est_rev)
                },
                {
                    label: 'Revenue Sum',
                    backgroundColor: 'rgba(102,153,255,0.2)',
                    borderColor: 'rgba(102,153,255,1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(102,153,255,0.4)',
                    hoverBorderColor: 'rgba(102,153,255,1)',
                    data: data.map(d => d.rev_sum)
                }
            ]
        })

        setLine({
            labels: data.map(d => d.sales_project_name),
            datasets: [
                {
                    label: 'Revenue Rate',
                    fill: false,
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
                    data: data.map(d => d.rev_rate)
                }
            ]
        })
    }, [])

    return (
        <React.Fragment>
            <p>Estimated Revenue VS Actual Revenue</p>
            {data.length && bar && line ?
                <React.Fragment>
                    <div className="est-rev-bar">
                        <Bar
                            data={bar}
                            options={{
                                maintainAspectRatio: false,
                                responsive: true,
                                scales: {
                                    xAxes: [{
                                        ticks: {
                                            callback: function (value) {
                                                if (value.length > 10) {
                                                    return value.substr(0, 10) + '...'; //truncate
                                                } else {
                                                    return value
                                                }
                                            }
                                        }
                                    }]
                                }
                            }}
                        />
                    </div>
                    <div className="est-rev-line">
                        <Line data={line}
                            options={{
                                maintainAspectRatio: false,
                                responsive: true,
                                scales: {
                                    xAxes: [{
                                        display: false
                                    }]
                                },
                                legend: { position: 'bottom' },
                                layout: {
                                    padding: {
                                        right: 5,
                                    }
                                }
                            }} />
                    </div>
                </React.Fragment>
                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ height: '100%' }} />}
        </React.Fragment>
    )
}

