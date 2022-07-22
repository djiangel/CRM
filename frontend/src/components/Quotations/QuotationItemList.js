import React, { useState } from 'react'
import { Drawer, Button, Typography, Skeleton } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import MUIDataTable from "mui-datatables";
import QuotationDrawer from './Forms/QuotationDrawer';

export default function QuotationItemList({ items, id, type, project_id }) {

    const loadingComponent = useSelector(state => state.loading.loadingComponent);
    const quotation = useSelector(state => state.api.quotation);

    const columns = [
        {
            name: "block.block_id",
            label: "Budget Block",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "block.item.item_code",
            label: "Item Code",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "quantity",
            label: "Quantity",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "unit_price",
            label: "Unit Price",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "moq",
            label: "MOQ",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "mdq",
            label: "MDQ",
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
            name: "quotation_item_id",
            label: "Edit",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value) => {
                    return (
                        quotation.permissions['sales.change_quotationitem']
                            && quotation.is_at_last_stage.last_stage == false ?
                            <QuotationDrawer data={items.find(item => item.quotation_item_id === value)}
                                button_name='Edit'
                                title='Edit Quotation Item'
                                component='QuotationItemUpdate'
                                type={type}
                                project_id={project_id}
                                button_type='update'
                                button_style='default' />
                            : null)
                }
            },
        },
    ];

    // dion i think here might have some issue with project-based vs spot order for perms bc of issues like if the project is at last stage, it should not have any editting capabilities here
    // so i think need to have a ? : based on whether is a project-based or spot order then need additional perms for the project-based ones
    // btw this is quotation detail page in case u confused
    // need change perms for both create and edit quotation item in quotation detail page

    const options = {
        filterType: 'checkbox',
        selectableRowsHeader: false,
        selectableRows: "none",
        customToolbar: () => (
            quotation.permissions['sales.add_quotationitem']
                && quotation.is_at_last_stage.last_stage === false ?
                <QuotationDrawer data={id}
                    button_name='Create'
                    title='Create Quotation Item'
                    component='QuotationItemCreate'
                    type={type}
                    project_id={project_id}
                    button_type='create'
                    button_style='default' />
                :
                null
        ),
        download: false,
        print: false,
        pagination: false,
        enableNestedDataAccess: ".",
    }

    return (

        <Skeleton loading={loadingComponent === 'quotation_item'} active avatar paragraph={{ rows: 5 }}>
            <MUIDataTable
                data={items}
                columns={columns}
                options={options}
            />
        </Skeleton>
    )
}
