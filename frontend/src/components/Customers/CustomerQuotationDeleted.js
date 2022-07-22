import React, { useState } from 'react'
import { Tag, Empty, Card, Timeline, Button, Popover, Menu, Dropdown, Tabs, Skeleton, Drawer } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, FileImageOutlined, MoreOutlined, DeleteOutlined } from '@ant-design/icons';
import CustomerDrawer from './Forms/CustomerDrawer';
import QuotationHistory from '../Opportunities/QuotationHistory';
import QuotationItemList from '../Opportunities/QuotationItemList';
import MUIDataTable from "mui-datatables";
import { useDispatch, useSelector } from 'react-redux'

const { TabPane } = Tabs;


export default function QuotationTimeline({ quotations, permissions }) {

    const dateFormat = require('dateformat');
    const [visible, setVisible] = useState(false);

    const loadingComponent = useSelector(state => state.loading.loadingComponent);
    const mediaquery = useSelector(state => state.mediaquery.size);
    const datatable = useSelector(state => state.mediaquery.datatable);

    // Jason , the soft deleted quotation not appearing inside here , help me check if perms working aft u done
    const actions = (quotation) => (
        <Menu>
            {permissions['sales.recover_quotations'] ?
                <Menu.Item><CustomerDrawer data={quotation.quotation_id}
                    button_name='Recover'
                    title='Recover Quotation'
                    component='QuotationRecover' /></Menu.Item>
                :
                null
            }
            {quotation.file ?
                <Menu.Item>
                    <Button type="text" shape="circle" size="small"><a href={quotation.file}><FileImageOutlined /></a></Button> File
                </Menu.Item>
                : null}
            <Menu.Item><QuotationHistory history={quotation.history} /> History</Menu.Item>
            {permissions['sales.change_quotation'] ?
                <Menu.Item><CustomerDrawer data={quotation.quotation_id}
                    button_name='Assign'
                    title='Assign Quotation'
                    component='QuotationAssign' /></Menu.Item>
                :
                null}
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
            name: "quotation",
            label: "Quotation",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "details",
            label: "Details",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "date_time",
            label: "Date Time",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value) => {
                    return dateFormat(value, "mmmm dS, yyyy, h:MM:ss TT")
                }
            }
        },
        {
            name: "decision",
            label: "Decision",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "item",
            label: "Items",
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    return <QuotationItemList items={quotations.find(quotation => quotation.quotation_id === tableMeta.rowData[0]).items} />
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
                <MUIDataTable
                    data={quotations.filter(quotation => quotation.direction === 'sq').filter(quotation => quotation.salesProject === null)}
                    columns={columns}
                    options={options}
                />
            </Drawer>
        </React.Fragment>

    )
}
