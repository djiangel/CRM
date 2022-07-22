import React, { useState, useEffect } from 'react'
import { Spin, Card, Result, Alert, Typography, Button, Empty, Tabs, Table, Descriptions, PageHeader, Timeline, Drawer, Avatar, Tag, Popover } from 'antd';
import { ShoppingCartOutlined, ShoppingOutlined, UserOutlined, ContactsOutlined, MobileOutlined, PhoneOutlined, FireOutlined, HomeOutlined, CarOutlined, MessageOutlined, FullscreenOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import { PermissionsChecker } from '../../api/PermissionsChecker';
import SwipeableViews from 'react-swipeable-views';
import TabsUI from '@material-ui/core/Tabs';
import TabUI from '@material-ui/core/Tab';
import QuotationItemList from '../../components/Quotations/QuotationItemList';
import QuotationDrawer from '../../components/Quotations/Forms/QuotationDrawer';
import MoonLoader from "react-spinners/MoonLoader";
import './quotation.css'
import WorkflowObjectComponent from '../Workflow/WorkflowObject/WorkflowObjectComponent';

const { Column } = Table;
const { TabPane } = Tabs;

export default function QuotationDetail(props) {

    const dateFormat = require('dateformat');

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch({ type: 'QUOTATION_DETAIL', id: props.match.params.id })

    }, [props.match.params.id])

    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(false);

    const quotation = useSelector(state => state.api.quotation);
    const loading = useSelector(state => state.loading.loading);
    const mediaquery = useSelector(state => state.mediaquery.size);
    let xs = mediaquery === 'xs'

    // dion same here the quotation detail page for project-based need add another level of checking if project is compelted

    const details = (quotation) => (
        <div className='details-col'>
            <PageHeader ghost={false} onBack={() => props.history.goBack()} title={`Quotation ID: ${quotation.quotation_id}`}
                extra={
                    quotation.permissions['sales.change_quotation']
                        && quotation.is_at_last_stage.last_stage === false ?
                        (quotation.salesProject === null ?
                            [<QuotationDrawer
                                data={quotation}
                                button_name='Edit Quotation'
                                title='Edit Quotation'
                                component='QuotationUpdateCustomer'
                                button_type='update'
                                button_style='default' />]
                            :
                            [<QuotationDrawer
                                data={quotation}
                                button_name='Edit Quotation'
                                title='Edit Quotation'
                                component='QuotationUpdateProject'
                                button_type='update'
                                button_style='default' />])
                        :
                        null
                }>
                <div className='quotation-detail-grid'>
                    <div className='quotation-status'><HomeOutlined />Status: {quotation.quotation_status.label}</div>
                    <div className='quotation-doc-date'><FireOutlined />Document Date: {quotation.document_date}</div>
                    <div className='quotation-tax-date'><MobileOutlined />Tax Date: {quotation.tax_date}</div>
                    <div className='quotation-due-date'><PhoneOutlined />Due Date: {quotation.due_date}</div>
                    <div className='quotation-customer'><CarOutlined />Customer: {quotation.customer.customer_name}</div>
                    <div className='quotation-project'><ShoppingCartOutlined />Sales Project: {quotation.salesProject ? quotation.salesProject.sales_project_name : '-'}</div>
                </div>
            </PageHeader>
        </div>
    )

    const historyDetails = (history) => {
        return (
            history.changes.map((change, number) => (
                <React.Fragment key={number + 'field'}>
                    {(change.field === 'status') ? ((change.new === 'active') ? `Restored` : 'Deleted')
                        :
                        `Changed field '${change.field}' from '${change.old}' to '${change.new}'`}
                    <br />
                </React.Fragment>

            ))
        )
    }

    const activities = (quotation) => (
        <Card title='Activities' className='activity-col'>
            {quotation.history.length ?
                <Timeline>
                    {quotation.history.map((history, index) => (
                        <Timeline.Item
                            dot={
                                history.profile_picture ?
                                    <Avatar src={history.profile_picture} />
                                    : <Avatar icon={<UserOutlined />} size='small' />}>
                            <div className='profile-picture-timeline'>
                                <p className='timeline-date'>{dateFormat(history.datetime, "mmmm dS, yyyy, h:MM:ss TT")}</p>
                                <p className='flex-horizontal-container'><div className='activity-text'><Tag color='magenta'>{history.user}</Tag>
                                    {`${history.changes.length ? 'edited' : 'created'} ${history.model === 'Sales Project' ? `this ${history.model}` : `${history.model} ID: ${history.id}`}`}
                                </div>
                                    {history.changes.length > 0 &&
                                        <React.Fragment>
                                            <Popover placement="topRight" content={() => historyDetails(history)} overlayStyle={xs ? { width: '75vw' } : null} key={`${index}h`}>
                                                <Button type='text' shape='circle' className='align-right' key={`${index}g`}><MessageOutlined /></Button>
                                            </Popover>
                                        </React.Fragment>
                                    }
                                </p>
                            </div>
                        </Timeline.Item>
                    ))}
                </Timeline>
                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
        </Card>
    )

    const items = (quotation) => (
        <Card className='items-col' title='Item List'>
            <QuotationItemList id={props.match.params.id} items={quotation.items} type={quotation.salesProject === null ? 'CUSTOMER' : 'PROJECT'} project_id={quotation.salesProject ? quotation.salesProject.sales_project_id : null} />
        </Card>
    )

    const workflow = (quotation) => {
        return (
            <Card key='workflow' className='workflow-col' title='Workflow'>
                <WorkflowObjectComponent
                    workflow_class={quotation.workflow_id}
                    {...props}
                />
            </Card>


        )
    }

    //extra={[<Button size='small' onClick={() => setVisible(true)}><FullscreenOutlined /></Button>]}

    return (
        loading['quotation'] === false ?
            (!quotation.error ?
                <React.Fragment>
                    {quotation.is_at_last_stage.last_stage === true ?
                        <Alert
                            message="This Quotation is closed"
                            description="This quotation is currently closed. All data has been locked."
                            type="error"
                            closable
                        /> : null}

                    <div className='quotation-grid'>
                        {mediaquery === 'xs' ?

                            <React.Fragment>

                                {details(quotation)}
                                <div className='quotation-tabs-col'>
                                    <Tabs onChange={(value) => setIndex(parseInt(value))}
                                        activeKey={index.toString()}>
                                        <TabPane tab="Activities" key={0} />
                                        <TabPane tab="Items" key={1} />
                                        <TabPane tab='Workflow' key={2} />
                                    </Tabs>

                                    <SwipeableViews enableMouseEvents index={index} onChangeIndex={(value) => setIndex(value)} animateHeight={true}>
                                        {activities(quotation)}
                                        {items(quotation)}
                                        {workflow(quotation)}
                                    </SwipeableViews>
                                </div>
                            </React.Fragment>
                            :
                            <React.Fragment>
                                {details(quotation)}
                                {activities(quotation)}
                                {items(quotation)}
                                {workflow(quotation)}
                            </React.Fragment>}
                    </div>
                </React.Fragment>
                :
                <Result
                    status={quotation.error.status}
                    title={quotation.error.status}
                    subTitle={quotation.error.message.detail}
                    extra={<Button type="primary">Back Home</Button>}
                />
            )
            :
            <div style={{ textAlign: "center", marginTop: '10%' }}>
                <Spin indicator={<MoonLoader
                    size={100}
                    color={"#1890ff"}
                    loading={true}
                />}
                    tip={`Pulling Quotation ID: ${props.match.params.id}...`} />
            </div>
    )
}


/*<WorkflowObjectComponent
    workflow_class={customer.workflow_id}
    {...this.props}
/>*/


/*

                <div className='projects-col'>
                    {customer.projects.length ?
                        <Table dataSource={customer.projects} bordered>
                            <Column title="Project ID" dataIndex="sales_project_id" key="sales_project_id"
                                render={id => (
                                    <Button type='primary' shape='circle'>
                                        <Link to={`/project/detail/${id}`}>
                                            {id}
                                        </Link>
                                    </Button>
                                )} />
                            <Column title="Project Name" dataIndex="sales_project_name" key="sales_project_name" />
                        </Table>
                        : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    }
                </div>

                */