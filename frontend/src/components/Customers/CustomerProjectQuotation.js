import React, { useState } from 'react'
import { Tag, Empty, Card, Timeline, Button, Popover, Menu, Dropdown, Tabs, Skeleton } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, FileImageOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import CustomerDrawer from './Forms/CustomerDrawer';
import QuotationHistory from '../Opportunities/QuotationHistory';
import QuotationItemList from './QuotationItemList';
import MUIDataTable from "mui-datatables";
import { useDispatch, useSelector } from 'react-redux'

const { TabPane } = Tabs;


export default function CustomerProjectQuotation({ quotations, permissions }) {

    const loadingComponent = useSelector(state => state.loading.loadingComponent);
    const datatable = useSelector(state => state.mediaquery.datatable);
    const project_columns = [
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
                    return <QuotationItemList permissions={permissions} quotation={quotations.find(quotation => quotation.quotation_id === value)} />
                }
            }
        },
    ]

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
            columns={project_columns}
            options={options}
        />
    )
}
