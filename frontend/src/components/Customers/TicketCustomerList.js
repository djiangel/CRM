import React, { useState } from 'react'
import { Drawer, Button, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import MUIDataTable from "mui-datatables";
import { Link, withRouter } from 'react-router-dom';

export default function TicketCustomerList({ tickets }) {

    const [visible, setVisible] = useState(false)

    const mediaquery = useSelector(state => state.mediaquery.size);
    const datatable = useSelector(state => state.mediaquery.datatable);

    const columns = [
        {
            name: "id",
            label: "ID",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value) => (
                    <Link to={`/ticket/detail/${value}`}>
                        {value}
                    </Link>
                )
            },
        },
        {
            name: "name",
            label: "Name",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "source",
            label: "Source",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "nature",
            label: "Nature",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "priority",
            label: "Priority",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "ticket_status.label",
            label: "Status",
            options: {
                filter: false,
                sort: false,
            }
        },
    ];

    const options = {
        filterType: 'checkbox',
        selectableRowsHeader: false,
        selectableRows: "none",
        pagination: false,
        download: false,
        print: false,
        rowsPerPage: datatable ? 5 : 10,
        rowsPerPageOptions: datatable ? [5] : [10],
        enableNestedDataAccess: "."
    }

    return (
        <React.Fragment>
            <MUIDataTable
                title=''
                data={tickets}
                columns={columns}
                options={options}
            />
        </React.Fragment>
    )
}
