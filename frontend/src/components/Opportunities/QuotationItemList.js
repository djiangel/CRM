import React, { useState } from 'react'
import { Drawer, Button, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import MUIDataTable from "mui-datatables";
import OpportunityDrawer from './Forms/OpportunityDrawer';

export default function QuotationItemList({ quotation }) {

    const [visible, setVisible] = useState(false)

    const mediaquery = useSelector(state => state.mediaquery.size);
    const datatable = useSelector(state => state.mediaquery.datatable);
    const permissions = useSelector(state => state.api.project.permissions);
    // jason quotation item list not inside the project page

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
            name: "quantity",
            label: "Quantity",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "unit_price",
            label: "Unit Pirce",
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
                        permissions['sales.change_quotationitem'] && quotation.is_at_last_stage.last_stage === false ?
                            <OpportunityDrawer
                                data={{
                                    quotation_item: quotation.items.find(item => item.quotation_item_id === value),
                                    due_date: quotation.due_date
                                }}
                                button_name='Edit'
                                title='Edit Quotation Item'
                                component='QuotationItemUpdate'
                                button_type='update_only'
                                button_style='default' />
                            :
                            null)
                }
            },
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
            <Button size='small' onClick={() => setVisible(true)}>
                View
            </Button>
            <Drawer
                title="Quotation Item Details"
                width={mediaquery === 'xs' ? '100%' : 720}
                onClose={() => setVisible(false)}
                visible={visible}
                bodyStyle={{ paddingBottom: 80 }}
                footer={
                    <div
                        style={{
                            textAlign: 'right',
                        }}
                    >
                        <Button
                            onClick={() => setVisible(false)}
                            style={{ marginRight: 8 }}
                        >
                            Cancel
                    </Button>
                    </div>
                }
            >
                <MUIDataTable
                    title={
                        permissions['sales.add_quotationitem'] && quotation.is_at_last_stage.last_stage === false ?
                            <OpportunityDrawer data={quotation}
                                button_name='Create Quotation Item'
                                title='Create Quotation Item'
                                component='QuotationItemCreate'
                                button_type='create'
                                button_style='default' />
                            :
                            null}
                    data={quotation.items}
                    columns={columns}
                    options={options}
                />


            </Drawer>
        </React.Fragment>
    )
}
