import React, { useRef } from 'react'
import MUIDataTable from "mui-datatables";
import { Row, Col, Card, Spin, Collapse, Tabs, Statistic, Menu, Dropdown, Button, Skeleton } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
//import ItemCompetitorList from './ItemCompetitorList';
import OpportunityDrawer from './Forms/OpportunityDrawer';
import ProjectItemDetailDrawer from './ProjectItemDetailDrawer';
import { useDispatch, useSelector } from 'react-redux'
import BudgetBlockHistory from './BudgetBlockHistory';
import CalendarDrawer from './../Calendar/Form/CalendarDrawer';

const _ = require("lodash");

function BudgetBlockList({ blocks }) {

    const datatable = useSelector(state => state.mediaquery.datatable);
    const last_stage = useSelector(state => state.api.project.is_at_last_stage.last_stage);
    const permissions = useSelector(state => state.api.project.permissions, (prevProps, nextProps) => _.isEqual(prevProps, nextProps));

    const actions = (block) => (
        <Menu>
            {permissions['sales.change_budgetblock'] && last_stage === false ?
                <Menu.Item><OpportunityDrawer data={block}
                    button_name='Update Budget Block'
                    title='Update Budget Block'
                    component='BudgetBlockUpdate'
                    button_type='update'
                /></Menu.Item>
                : null}
            {permissions['sales.delete_budgetblock'] ?
                <Menu.Item><OpportunityDrawer data={block.block_id}
                    button_name='Delete Budget Block'
                    title='Delete Budget Block'
                    component='BudgetBlockDelete'
                    button_type='delete'
                /></Menu.Item>
                : null}
            <Menu.Item><BudgetBlockHistory history={block.history} /></Menu.Item>
            {permissions['sales.add_tasks'] ?
                <Menu.Item>
                    <CalendarDrawer
                        button_name='Create Reminder'
                        title='When Shall we remind you?'
                        component='CreateReminder'
                        task_title={`Reminder [Budget ID: ${block.block_id}]`}
                        content={`Please remember to follow up on Budget Block [${block.block_id}]`}
                    />
                </Menu.Item>
                : null
            }
        </Menu>
    )

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
            label: "Options",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta) => {
                    return (
                        <Dropdown placement="bottomRight" overlay={() => actions(blocks.find(block => block.block_id === value))}>
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
        rowsPerPageOptions: datatable ? [5] : [10],

    }

    return (
        <MUIDataTable
            data={blocks.filter(block => block.status === 'active')}
            columns={columns}
            options={options}
        />
    )
}

export default React.memo(BudgetBlockList,
    (prevProps, nextProps) => {
        return _.isEqual(prevProps, nextProps);
    })