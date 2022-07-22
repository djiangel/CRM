import React, { useState, useEffect } from 'react'
import moment from 'moment';
import axiosInstance from '../../api/axiosApi';
import { Empty, Button, Select, Row, Col, Spin, Modal } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';
import { connect } from 'react-redux'
import { Bar, Line } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux'

const { Option } = Select;

export default function ActualRevenue({ group }) {

    const [visible, setVisible] = useState(false);
    const [bar, setBar] = useState(null);
    const [line, setLine] = useState(null);

    const data = useSelector(state => state.api.analytics.actual_revenue)
    const loading = useSelector(state => state.loading.loading)

    const dispatch = useDispatch()

    useEffect(() => {
        if (data.data) {
            setBar({
                labels: data.data.map(d => d.formatted_date),
                datasets: [
                    {
                        label: 'Revenue KPI',
                        backgroundColor: 'rgba(255,99,132,0.2)',
                        borderColor: 'rgba(255,99,132,1)',
                        borderWidth: 1,
                        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                        hoverBorderColor: 'rgba(255,99,132,1)',
                        data: data.data.map(d => d.kpi)
                    },
                    {
                        label: 'Revenue Sum',
                        backgroundColor: 'rgba(102,153,255,0.2)',
                        borderColor: 'rgba(102,153,255,1)',
                        borderWidth: 1,
                        hoverBackgroundColor: 'rgba(102,153,255,0.4)',
                        hoverBorderColor: 'rgba(102,153,255,1)',
                        data: data.data.map(d => d.rev_sum)
                    }
                ]
            })
            setLine({
                labels: data.data.map(d => d.formatted_date),
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
                        data: data.data.map(d => d.rev_rate)
                    }
                ]
            })
        }
    }, [data])

    const chart = (modal) => {
        return (
            data.data ?
                <React.Fragment>
                    <div className='select-grid'>
                        <div className='select-metric-title'>Metric:</div>
                        <div className='metric-select'>
                            <Select value={data.metric} onChange={(value) => dispatch({ type: 'RANGE_ANALYTICS', loading: 'actual_revenue', group: group, metric: value, range: true })}>
                                <Option value='month'>Month</Option>
                                <Option value='quarter'>Quarter</Option>
                                <Option value='year'>Year</Option>
                            </Select>
                        </div>
                        <div className='select-start-title'>Start:</div>
                        <div className='start-select'>
                            <Select value={data.start} onChange={(value) => dispatch({ type: 'RANGE_ANALYTICS', loading: 'actual_revenue', group: group, start: value })}>
                                {data.range.map(date => (
                                    <Option value={date.start}>{date.formatted_date}</Option>
                                ))}
                            </Select>
                        </div>
                        <div className='select-end-title'>End:</div>
                        <div className='end-select'>
                            <Select value={data.end} onChange={(value) => dispatch({ type: 'RANGE_ANALYTICS', loading: 'actual_revenue', group: group, end: value })}>
                                {data.range.map(date => (
                                    <Option value={date.end}>{date.formatted_date}</Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                    <div className="act-rev-bar">
                        <Bar
                            data={bar}
                            options={{
                                maintainAspectRatio: false,
                                responsive: true
                            }}
                        />
                    </div>
                    <div className="act-rev-line">
                        <Line data={line}
                            options={{
                                maintainAspectRatio: false,
                                responsive: true,
                                scales: {
                                    xAxes: [{
                                        display: false //this will remove all the x-axis grid lines
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
                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ height: '100%' }} />
        )
    }

    return (
        <React.Fragment>
            <p>Actual Revenue VS KPI
                    <Button type="primary" style={{ float: 'right' }} size='small' shape='circle' onClick={() => setVisible(true)}>
                    <FullscreenOutlined />
                </Button>
            </p>
            {loading['actual_revenue'] === false ? chart() : <div style={{ textAlign: 'center' }}><Spin /></div>}
            <Modal
                title="Actual Revenue VS KPI"
                width={'85vw'}
                bodyStyle={{ height: '80vh' }}
                style={{ top: '1%' }}
                visible={visible}
                onOk={() => setVisible(false)}
                onCancel={() => setVisible(false)}
            >
                {loading['actual_revenue'] === false && visible ? chart(true) : <div style={{ textAlign: 'center' }}><Spin /></div>}
            </Modal>
        </React.Fragment>
    )
}



