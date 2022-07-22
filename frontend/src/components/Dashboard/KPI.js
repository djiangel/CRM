import React, { useRef, useEffect, useState } from "react";
import axiosInstance from '../../api/axiosApi';
import { Tabs, InputNumber, Button, Spin, Card, Statistic, Row, Col, Progress, Divider, Modal, Drawer } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import SwipeableViews from 'react-swipeable-views';
import TabsUI from '@material-ui/core/Tabs';
import TabUI from '@material-ui/core/Tab';

const { TabPane } = Tabs;

export default function CustomerConversionRate({ group }) {

    const [rateKPI, setRateKPI] = useState(null)
    const [leadKPI, setLeadKPI] = useState(null)
    const [revKPI, setRevKPI] = useState(null)
    const [visible, setVisible] = useState(false)
    const [modal, setModal] = useState({})
    const [index, setIndex] = useState(0);

    const dispatch = useDispatch()
    const data = useSelector(state => state.api.analytics.KPI)
    const loading = useSelector(state => state.loading.loading)
    const mediaquery = useSelector(state => state.mediaquery.size);

    const submitKPI = (metric, measurement, requestType) => {

        setVisible(false)

        const formData = measurement === 'rate' ? { 'rate_kpi': rateKPI } : measurement === 'lead' ? { 'lead_kpi': leadKPI } : { 'rev_kpi': revKPI }

        if (requestType === 'post') {
            axiosInstance.post(`/kpi/?group=${group}&metric=${metric}`, formData)
                .then(response => {
                    dispatch({ type: 'BASIC_ANALYTICS', loading: 'KPI', group: group })
                })
                .catch(error => {
                    console.log(error);
                })
        }
        else if (requestType === 'put') {
            axiosInstance.put(`/kpi/?pk=${data[metric].kpi_id}`, formData)
                .then(response => {
                    dispatch({ type: 'BASIC_ANALYTICS', loading: 'KPI', group: group })
                })
                .catch(error => {
                    console.log(error);
                })
        }
    }

    const showInput = (measurement, metric, requestType) => {

        let KPI = measurement === 'lead' ? leadKPI : measurement === 'rate' ? rateKPI : revKPI

        return (
            <React.Fragment>
                <InputNumber min={0} style={{ width: '50%' }}
                    value={KPI} placeholder={requestType === 'post' ? "Set a KPI here" : "Edit KPI here"}
                    onChange={measurement === 'lead' ? (value) => setLeadKPI(value) : measurement === 'rate' ? (value) => setRateKPI(value) : (value) => setRevKPI(value)} />
            </React.Fragment>
        )
    }

    const handleClick = (measurement, metric, requestType) => {
        setModal({ 'measurement': measurement, 'metric': metric, 'request': requestType })
        setVisible(true)
    }

    const renderKPI = (metric) => {
        return (
            <div className='stats-grid'>
                <Card className='stats-lead-count'>
                    <Statistic
                        title="Leads"
                        value={data[metric].lead_count}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </Card>
                <Card className='stats-lead-kpi'>
                    Lead KPI
                        {data[metric].lead_kpi || data[metric].rate_kpi || data[metric].rev_kpi ?
                        <Button shape='circle' size='small' onClick={() => handleClick('lead', metric, 'put')} style={{ marginLeft: '5%' }}><EditOutlined /></Button>
                        :
                        <Button shape='circle' size='small' onClick={() => handleClick('lead', metric, 'post')} style={{ marginLeft: '5%' }}><PlusOutlined /></Button>
                    }
                    <Statistic
                        value={data[metric].lead_kpi}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </Card>
                <Card className='stats-conversion-rate'>
                    <Statistic
                        title="Conversion"
                        value={data[metric].conversion_rate}
                        valueStyle={{ color: '#3f8600' }}
                        suffix="%"
                    />
                </Card>
                <Card className='stats-conversion-kpi'>
                    Rate KPI
                        {data[metric].lead_kpi || data[metric].rate_kpi || data[metric].rev_kpi ?
                        <Button shape='circle' size='small' onClick={() => handleClick('rate', metric, 'put')} style={{ marginLeft: '5%' }}><EditOutlined /></Button>
                        :
                        <Button shape='circle' size='small' onClick={() => handleClick('rate', metric, 'post')} style={{ marginLeft: '5%' }}><PlusOutlined /></Button>
                    }
                    <Statistic
                        value={data[metric].rate_kpi}
                        valueStyle={{ color: '#3f8600' }}
                        suffix="%"
                    />
                </Card>
                <Card className='stats-client-count'>
                    <Statistic
                        title="Clients"
                        value={data[metric].client_count}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </Card>
                <Card className='stats-lead-progress'>
                    <p>Lead Progress</p>
                    <Progress
                        strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                        }}
                        percent={data[metric].lead_progress}
                    />
                </Card>
                <Card className='stats-revenue-count'>
                    <Statistic
                        title="Revenue"
                        value={data[metric].revenue}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </Card>
                <Card className='stats-revenue-kpi'>
                    Revenue KPI
                        {data[metric].lead_kpi || data[metric].rate_kpi || data[metric].rev_kpi ?
                        <Button shape='circle' size='small' onClick={() => handleClick('rev', metric, 'put')} style={{ marginLeft: '5%' }}><EditOutlined /></Button>
                        :
                        <Button shape='circle' size='small' onClick={() => handleClick('rev', metric, 'post')} style={{ marginLeft: '5%' }}><PlusOutlined /></Button>
                    }
                    <Statistic
                        value={data[metric].rev_kpi}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </Card>
                <Card className='stats-revenue-progress'>
                    <p>Revenue Progress</p>
                    <Progress
                        strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                        }}
                        percent={data[metric].rev_progress}
                    />
                </Card>
            </div>
        )
    }


    return (
        loading['KPI'] === false ?
            <React.Fragment>
                {mediaquery === 'xs' ?
                    <React.Fragment>
                        <TabsUI value={index} fullWidth onChange={(event, value) => setIndex(value)}>
                            <TabUI label="Monthly" />
                            <TabUI label="Quarterly" />
                            <TabUI label="Yearly" />
                        </TabsUI>

                        <SwipeableViews enableMouseEvents index={index} onChangeIndex={(value) => setIndex(value)}>
                            {renderKPI('month')}
                            {renderKPI('quarter')}
                            {renderKPI('year')}
                        </SwipeableViews>

                        <Drawer
                            title="KPI"
                            visible={visible}
                            onClose={() => setVisible(false)}
                        >
                            {showInput(modal.measurement, modal.metric, modal.request)}
                        </Drawer>
                    </React.Fragment>

                    :
                    <React.Fragment>
                        <Tabs defaultActiveKey="1" tabPosition='left'>
                            <TabPane tab="Monthly" key="1">
                                {renderKPI('month')}
                            </TabPane>
                            <TabPane tab="Quarterly" key="2">
                                {renderKPI('quarter')}
                            </TabPane>
                            <TabPane tab="Annually" key="3">
                                {renderKPI('year')}
                            </TabPane>
                        </Tabs>
                        <Modal
                            title="KPI"
                            visible={visible}
                            onOk={() => submitKPI(modal.metric, modal.measurement, modal.request)}
                            onCancel={() => setVisible(false)}
                        >
                            {showInput(modal.measurement, modal.metric, modal.request)}
                        </Modal>
                    </React.Fragment>
                }
            </React.Fragment>
            : <div style={{ textAlign: 'center' }}><Spin /></div>

    )
}

