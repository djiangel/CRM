import React, { useState } from 'react'
import { Tag, Empty, Card, Timeline, Button, Popover, Menu, Dropdown, Tabs, Skeleton, Drawer } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, FileImageOutlined, MoreOutlined, DeleteOutlined } from '@ant-design/icons';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import './timeline.css'
import QuotationUpdateDrawer from './Forms/QuotationUpdateDrawer';
import OpportunityDrawer from './Forms/OpportunityDrawer';
import QuotationHistory from './QuotationHistory';
import QuotationItemList from './QuotationItemList';
import MUIDataTable from "mui-datatables";
import { useDispatch, useSelector } from 'react-redux'

const { TabPane } = Tabs;


export default function QuotationTimeline({ quotations }) {

    const dateFormat = require('dateformat');
    const [tabIndex, setIndex] = useState(0);
    const [visible, setVisible] = useState(false);

    const loadingComponent = useSelector(state => state.loading.loadingComponent);
    const mediaquery = useSelector(state => state.mediaquery.size);
    const datatable = useSelector(state => state.mediaquery.datatable);


    const actions = (quotation) => (
        <Menu>
            {quotation.file ?
                <Menu.Item>
                    <Button type="text" shape="circle" size="small"><a href={quotation.file}><FileImageOutlined /></a></Button> File
                </Menu.Item>
                : null}
            <Menu.Item><QuotationHistory history={quotation.history} /></Menu.Item>
        </Menu>
    )

    const columns = [
        {
            name: "quotation_id",
            label: "ID",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "due_date",
            label: "Due Date",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "remarks",
            label: "Remarks",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "quotation_id",
            label: "Items",
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    return <QuotationItemList quotation={quotations.find(quotation => quotation.quotation_id === value)} />
                }
            }
        },
        {
            name: "quotation_id",
            label: "Options",
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    return (
                        <Dropdown placement="bottomRight" overlay={() => actions(quotations.find(quotation => quotation.quotation_id === value))}>
                            <Button size='small' type='text'><MoreOutlined /></Button>
                        </Dropdown>
                    )
                }
            }
        },
    ];


    const options = {
        filterType: 'checkbox',
        selectableRowsHeader: false,
        selectableRows: "none",
        download: false,
        print: false,
        rowsPerPage: datatable ? 5 : 10,
        rowsPerPageOptions: datatable ? [5] : [10]
    }

    return (
        <React.Fragment>
            <Button onClick={() => setVisible(true)} type="text" size='small'>
                <DeleteOutlined /> Recently Deleted
        </Button>
            <Drawer
                title="Recently Deleted"
                width={mediaquery === 'xs' ? '100%' : 720}
                visible={visible}
                onClose={() => setVisible(false)}
            >
                <Skeleton loading={loadingComponent === 'quotation'} active avatar paragraph={{ rows: 5 }}>
                    <MUIDataTable
                        data={quotations}
                        columns={columns}
                        options={options}
                    />
                </Skeleton>
            </Drawer>
        </React.Fragment>
    )
}
