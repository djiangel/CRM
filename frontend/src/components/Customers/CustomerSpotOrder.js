import React, { useState } from 'react'
import { Tag, Empty, Card, Timeline, Button, Popover, Menu, Dropdown, Tabs, Skeleton } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, FileImageOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import CustomerDrawer from './Forms/CustomerDrawer';
import QuotationHistory from '../Opportunities/QuotationHistory';
import QuotationItemList from './QuotationItemList';
import MUIDataTable from "mui-datatables";
import { useDispatch, useSelector } from 'react-redux'

const { TabPane } = Tabs;


export default function CustomerSpotOrder({ quotations, permissions }) {

    const dateFormat = require('dateformat');

    const loadingComponent = useSelector(state => state.loading.loadingComponent);
    const datatable = useSelector(state => state.mediaquery.datatable);

    const actions = (quotation) => (
        <Menu>
            {permissions['sales.change_quotation'] && quotation.is_at_last_stage.last_stage === false ?
                <Menu.Item><CustomerDrawer data={quotation}
                    button_name='Edit'
                    title='Edit Quotation'
                    component='QuotationUpdate'
                    button_type='update' /></Menu.Item>
                :
                null
            }
            {permissions['sales.delete_quotation'] && quotation.is_at_last_stage.last_stage === false ?
                <Menu.Item><CustomerDrawer data={quotation.quotation_id}
                    button_name='Delete'
                    title='Delete Quotation'
                    component='QuotationDelete'
                    button_type='delete' /></Menu.Item>
                :
                null
            }
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
                    return <QuotationItemList permissions={permissions} quotation={quotations.find(quotation => quotation.quotation_id === value)} spot={true} />
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
        <MUIDataTable
            data={quotations}
            columns={columns}
            options={options}
        />
    )
}

/*
jason assignment
            <Menu.Item><CustomerDrawer data={quotation.quotation_id}
                button_name='Assign'
                title='Assign Quotation'
                component='QuotationAssign' /></Menu.Item>

                */