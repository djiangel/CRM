import React from 'react'
import MUIDataTable from "mui-datatables";
import { Row, Col, Card, Spin, Collapse, Tabs, Statistic, Menu, Dropdown, Button, Skeleton } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import BudgetBlockHistory from './BudgetBlockHistory';
import ProjectItemDetailDrawer from '../Opportunities/ProjectItemDetailDrawer';

const _ = require("lodash");

export default function VendorBudgetBlock({ blocks }) {

    const datatable = useSelector(state => state.mediaquery.datatable);

    const columns = [
        {
            name: "item",
            label: "Item Code",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta) => {
                    return (
                        <ProjectItemDetailDrawer item={value} />
                    )
                }
            }
        },
        {
            name: "start_date",
            label: "Start Date",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "end_date",
            label: "End Date",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "buy_price",
            label: "Buy Price",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "sell_price",
            label: "Sell Price",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "block_id",
            label: "History",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta) => {
                    return (
                        <BudgetBlockHistory history={blocks.find(block => block.block_id === value).history} />
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
            data={blocks.filter(block => block.status === 'active')}
            columns={columns}
            options={options}
        />
    )
}