import React, { useState } from 'react'
import { Menu, Button, Dropdown, Skeleton } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import MUIDataTable from "mui-datatables";
import ItemDrawer from './Forms/ItemDrawer';
import CompetitorItemDeleted from './CompetitorItemDeleted';

export default function CompetitorItemList({ items, permissions }) {

    const loadingComponent = useSelector(state => state.loading.loadingComponent);

    const mediaquery = useSelector(state => state.mediaquery.size);
    const datatable = useSelector(state => state.mediaquery.datatable);

    const actions = (item) => (

        <Menu>
            {permissions['sales.change_competitoritem'] ?
                <Menu.Item><ItemDrawer data={item}
                    button_name='Edit Competitor Item'
                    title='Edit Competitor Item'
                    component='CompetitorItemUpdate'
                    button_type='update' />
                </Menu.Item>
                :
                null
            }
            {permissions['sales.delete_competitoritem'] ?
                <Menu.Item>
                    <ItemDrawer data={item.competitor_id}
                        button_name='Delete Competitor Item'
                        title='Delete Competitor Item'
                        component='CompetitorItemDelete'
                        button_type='delete' />
                </Menu.Item> :
                null}
        </Menu>
    )

    const columns = [
        {
            name: "competitor_name",
            label: "Competitor Name",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "item_code",
            label: "Item Code",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "item_description",
            label: "Item Description",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "base_unit",
            label: "Base Unit",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "gross_weight",
            label: "Gross Weight",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "net_weight",
            label: "Net Weight",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "base_price",
            label: "Base Price",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "competitor_id",
            label: "Options",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta) => {
                    return (
                        <Dropdown placement="bottomRight" overlay={() => actions(items.find(competitor => competitor.competitor_id === value))}>
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
        <Skeleton loading={loadingComponent === 'competitor_item'} active avatar paragraph={{ rows: 5 }}>
            <MUIDataTable
                title={
                    <CompetitorItemDeleted items={items.filter(item => item.status === 'inactive')} />
                }
                data={items.filter(item => item.status === 'active')}
                columns={columns}
                options={options}
            />
        </Skeleton>
    )
}
