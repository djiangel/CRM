import React, { useState, useEffect } from 'react'
import moment from 'moment';
import axiosInstance from '../../api/axiosApi';
import { Empty, Button, Select, Row, Col, Spin, Modal } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';
import { connect } from 'react-redux'
import { Bar, Line } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux'

const { Option } = Select;

export default function TicketConversion({ group }) {

    const [visible, setVisible] = useState(false);
    const [bar, setBar] = useState(null);

    const data = useSelector(state => state.api.analytics.ticket_conversion)
    const loading = useSelector(state => state.loading.loading)

    const dispatch = useDispatch()

    useEffect(() => {
        if (data.data) {
            console.log(data.data)
            setBar({
                labels: data.data.map(d => d.formatted_date),
                datasets: [
                    {
                        label: 'Incomplete Count',
                        backgroundColor: 'rgba(255,99,132,0.2)',
                        borderColor: 'rgba(255,99,132,1)',
                        borderWidth: 1,
                        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                        hoverBorderColor: 'rgba(255,99,132,1)',
                        data: data.data.map(d => d.incomplete)
                    },
                    {
                        label: 'Complete Count',
                        backgroundColor: 'rgba(102,153,255,0.2)',
                        borderColor: 'rgba(102,153,255,1)',
                        borderWidth: 1,
                        hoverBackgroundColor: 'rgba(102,153,255,0.4)',
                        hoverBorderColor: 'rgba(102,153,255,1)',
                        data: data.data.map(d => d.complete)
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
                            <Select value={data.metric} onChange={(value) => dispatch({ type: 'RANGE_ANALYTICS', loading: 'ticket_conversion', group: group, metric: value, range: true })}>
                                <Option value='month'>Month</Option>
                                <Option value='quarter'>Quarter</Option>
                                <Option value='year'>Year</Option>
                            </Select>
                        </div>
                        <div className='select-start-title'>Start:</div>
                        <div className='start-select'>
                            <Select value={data.start} onChange={(value) => dispatch({ type: 'RANGE_ANALYTICS', loading: 'ticket_conversion', group: group, start: value })}>
                                {data.range.map(date => (
                                    <Option value={date.start}>{date.formatted_date}</Option>
                                ))}
                            </Select>
                        </div>
                        <div className='select-end-title'>End:</div>
                        <div className='end-select'>
                            <Select value={data.end} onChange={(value) => dispatch({ type: 'RANGE_ANALYTICS', loading: 'ticket_conversion', group: group, end: value })}>
                                {data.range.map(date => (
                                    <Option value={date.end}>{date.formatted_date}</Option>
                                ))}
                            </Select>
                        </div>
                        <div className='select-nature-title'>Nature:</div>
                        <div className='nature-select'>
                            <Select value={data.nature} onChange={(value) => dispatch({ type: 'RANGE_ANALYTICS', loading: 'ticket_conversion', group: group, nature: value })}>
                                <Option value='complain'>Complain</Option>
                                <Option value='enquiry'>Enquiry</Option>
                            </Select>
                        </div>
                        <div className='select-priority-title'>Priority:</div>
                        <div className='priority-select'>
                            <Select value={data.priority} onChange={(value) => dispatch({ type: 'RANGE_ANALYTICS', loading: 'ticket_conversion', group: group, priority: value })}>
                                <Option value='important'>Important</Option>
                                <Option value='medium'>Medium</Option>
                                <Option value='normal'>Normal</Option>
                            </Select>
                        </div>
                        <div className='select-source-title'>Source:</div>
                        <div className='source-select'>
                            <Select value={data.source} onChange={(value) => dispatch({ type: 'RANGE_ANALYTICS', loading: 'ticket_conversion', group: group, source: value })}>
                                <Option value='email'>Email</Option>
                                <Option value='website'>Website</Option>
                                <Option value='phone_call'>Phone Call</Option>
                                <Option value='others'>Others</Option>
                            </Select>
                        </div>
                    </div>
                    <div className="customer-converted-bar">
                        <Bar
                            data={bar}
                            options={{
                                maintainAspectRatio: false,
                                responsive: true
                            }}
                        />
                    </div>
                </React.Fragment >
                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ height: '100%' }} />
        )
    }

    return (
        <React.Fragment>
            <p>Tickets Generated/Converted
                    <Button type="primary" style={{ float: 'right' }} size='small' shape='circle' onClick={() => setVisible(true)}>
                    <FullscreenOutlined />
                </Button>
            </p>
            {loading['ticket_conversion'] === false ? chart() : <div style={{ textAlign: 'center' }}><Spin /></div>}
            <Modal
                title="Tickets Generated/Converted"
                width={'85vw'}
                bodyStyle={{ height: '80vh' }}
                style={{ top: '1%' }}
                visible={visible}
                onOk={() => setVisible(false)}
                onCancel={() => setVisible(false)}
            >
                {loading['ticket_conversion'] === false && visible ? chart(true) : <div style={{ textAlign: 'center' }}><Spin /></div>}
            </Modal>
        </React.Fragment>
    )
}
