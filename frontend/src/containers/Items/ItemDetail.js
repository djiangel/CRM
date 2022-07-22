import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react'
import { Spin, Card, Result, Col, Typography, Button, Empty, Tabs, Table, Descriptions, PageHeader, Timeline, Skeleton } from 'antd';
import { ShoppingCartOutlined, ShoppingOutlined, UserOutlined, ContactsOutlined, MobileOutlined, PhoneOutlined, FireOutlined, HomeOutlined, CarOutlined } from '@ant-design/icons';
import { connect } from "react-redux";
import CompetitorItemList from '../../components/Items/CompetitorItemList';
import ItemDrawer from '../../components/Items/Forms/ItemDrawer';
import { useDispatch, useSelector } from 'react-redux'
import { PermissionsChecker } from '../../api/PermissionsChecker';
import SwipeableViews from 'react-swipeable-views';
import TabsUI from '@material-ui/core/Tabs';
import TabUI from '@material-ui/core/Tab';
import './item.css'
import MoonLoader from "react-spinners/MoonLoader";
const { Column } = Table;
const { TabPane } = Tabs;

export default function ItemDetail(props) {

    const dateFormat = require('dateformat');

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch({ type: 'ITEM_DETAIL', id: props.match.params.id })

    }, [props.match.params.id])

    const [index, setIndex] = useState(0);

    const item = useSelector(state => state.api.item)
    const loading = useSelector(state => state.loading.loading)
    const mediaquery = useSelector(state => state.mediaquery.size);
    const loadingComponent = useSelector(state => state.loading.loadingComponent);


    const details = (item) => (
        <div className='details-col'>
            <Skeleton loading={loadingComponent === 'detail'} active avatar paragraph={{ rows: 5 }}>
                <PageHeader ghost={false} onBack={() => props.history.goBack()} title={item.item_code}
                    extra={[
                        item.permissions['sales.delete_item'] ?
                            <ItemDrawer data={item.item_id}
                                button_name='Delete Item'
                                title='Delete Item'
                                component='ItemDelete'
                                button_type='delete'
                                button_style='default' /> : null,
                        item.permissions['sales.change_item'] ?
                            <ItemDrawer data={item}
                                button_name='Update Item'
                                title='Update Item'
                                component='ItemUpdate'
                                button_type='update'
                                button_style='default' /> :
                            null
                    ]} >
                    <div className='item-detail-grid'>
                        <div className='item-item-id'><FireOutlined />Item ID: {item.item_id}</div>
                        <div className='item-gross-weight'><MobileOutlined />Gross Weight: {item.gross_weight}</div>
                        <div className='item-net-weight'><PhoneOutlined />Net Weight: {item.net_weight}</div>
                        <div className='item-base-unit'><HomeOutlined />Base Unit: {item.base_unit}</div>
                        <div className='item-description'><CarOutlined />Description: {item.item_description}</div>
                        <div className='item-dimensions'><CarOutlined />Dimensions: {item.dimensions}</div>
                        <div className='item-base-price'><CarOutlined />Base Price: {item.base_price}</div>
                    </div>
                </PageHeader>
            </Skeleton>
        </div>
    )

    const competitor = (item) => (
        <Card className='competitor-item-col' title='Competitor Items' extra={[
            item.permissions['sales.add_competitoritem'] ?
                <ItemDrawer data={item.item_id}
                    button_name='Create Competitor Items'
                    title='Create Competitor Items'
                    component='CompetitorItemCreate'
                    button_type='create'
                    button_style='default'
                    ghost={true} />
                :
                null
        ]}>
            <Skeleton loading={loadingComponent === 'competitor'} active avatar paragraph={{ rows: 5 }}>
                <CompetitorItemList permissions={item.permissions} items={item.competitors} />
            </Skeleton>
        </Card>
    )

    return (
        loading['item'] === false ?
            (!item.error ?
                <React.Fragment>
                    <div className='item-grid'>
                        <React.Fragment>
                            {details(item)}
                            {competitor(item)}
                        </React.Fragment>
                    </div>
                </React.Fragment>
                :
                <Result
                    status={item.error.status}
                    title={item.error.status}
                    subTitle={item.error.message.detail}
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
                    tip={`Extracting Item ID: ${props.match.params.id}...`} />
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