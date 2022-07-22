import React, { useState } from 'react'
import { Tag, Empty, Card, Timeline, Button, Popover, Menu, Dropdown, Tabs, Skeleton, Drawer } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, FileImageOutlined, MoreOutlined, DeleteOutlined } from '@ant-design/icons';
import ItemDrawer from './Forms/ItemDrawer';
import MUIDataTable from "mui-datatables";
import { useDispatch, useSelector } from 'react-redux'

const { TabPane } = Tabs;


export default function CompetitorItemDeleted({ items }) {

    const [visible, setVisible] = useState(false);

    const loadingComponent = useSelector(state => state.loading.loadingComponent);
    const mediaquery = useSelector(state => state.mediaquery.size);
    const datatable = useSelector(state => state.mediaquery.datatable);
    const permissions = useSelector(state => state.api.item.permissions);
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
                        permissions['sales.recover_competitoritem'] ?
                            <ItemDrawer data={value}
                                button_name='Recover Competitor Item'
                                title='Recover Competitor Item'
                                component='CompetitorItemRecover'
                                button_type='recover'
                                button_style='default' />
                            :
                            null
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
            <Button onClick={() => setVisible(true)} size='small'>
                <DeleteOutlined /> Recently Deleted
    </Button>
            <Drawer
                title="Recently Deleted"
                width={mediaquery === 'xs' ? '100%' : 720}
                visible={visible}
                onClose={() => setVisible(false)}
            >
                <Skeleton loading={loadingComponent === 'competitor_item'} active avatar paragraph={{ rows: 5 }}>
                    <MUIDataTable
                        data={items}
                        columns={columns}
                        options={options}
                    />
                </Skeleton>
            </Drawer>
        </React.Fragment>
    )
}
