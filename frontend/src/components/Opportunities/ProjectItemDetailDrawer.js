import React, { useState } from 'react'
import MUIDataTable from "mui-datatables";
import { Row, Col, Card, Spin, Collapse, Tabs, Statistic, Menu, Dropdown, Button, Skeleton, Drawer } from 'antd';
//import ItemCompetitorList from './ItemCompetitorList';
import OpportunityDrawer from './Forms/OpportunityDrawer';
import { useDispatch, useSelector } from 'react-redux'
import { Link, withRouter } from 'react-router-dom';
import { CarOutlined, SmileOutlined, FireOutlined, HomeOutlined, KeyOutlined, RocketOutlined, BulbOutlined } from '@ant-design/icons';

export default function ProjectItemList({ item, item_code }) {

    const [visible, setVisible] = useState(false);
    const mediaquery = useSelector(state => state.mediaquery.size);
    const datatable = useSelector(state => state.mediaquery.datatable);

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
            name: "base_price",
            label: "Base Price",
            options: {
                filter: true,
                sort: true,
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
            <Button size='small' onClick={() => setVisible(true)}>
                {item.item_code}
            </Button>
            <Drawer
                title={<React.Fragment>Item Details
                    <Link style={{ float: 'right', marginRight: '30px' }} to={`/item/detail/${item.item_id}`}>
                        View Item Detail Page
                        </Link>
                </React.Fragment>}
                width={mediaquery === 'xs' || mediaquery === 'sm' ? '100%' : 720}
                onClose={() => setVisible(false)}
                visible={visible}
                bodyStyle={{ paddingBottom: 80 }}
            >
                <div className='item-drawer-grid'>
                    <div><CarOutlined />Item Code: {item.item_code}</div>
                    <div><SmileOutlined />Description: {item.item_description}</div>
                    <div><FireOutlined />Dimensions: {item.dimensions}</div>
                    <div><HomeOutlined />Gross Weight: {item.gross_weight}</div>
                    <div><BulbOutlined />Net Weight: {item.net_weight}</div>
                    <div><KeyOutlined />Base Unit: {item.base_unit}</div>
                    <div><RocketOutlined />Base Price: {item.base_price}</div>
                </div>
                <MUIDataTable
                    title='Competitors'
                    data={item.competitors}
                    columns={columns}
                    options={options}
                />
            </Drawer>
        </React.Fragment>
    )
}