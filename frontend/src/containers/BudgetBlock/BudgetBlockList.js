import React, { useEffect, useState } from 'react'
import MUIDataTable from "mui-datatables";
import { Row, Col, Card, Spin, Collapse, Tabs, Statistic, Menu, Dropdown, Button, Skeleton } from 'antd';
import { useDispatch, useSelector } from 'react-redux'
import ItemDrawer from '../../components/Items/Forms/ItemDrawer';
import MoonLoader from "react-spinners/MoonLoader";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment'
import BudgetBlockDrawer from '../../components/BudgetBlock/Forms/BudgetBlockDrawer';

const { TabPane } = Tabs

export default function BudgetBlockList(props) {

    const loading = useSelector(state => state.loading.loading);
    const blocks = useSelector(state => state.api.blocks.active);
    const datatable = useSelector(state => state.mediaquery.datatable);
    const permissions = useSelector(state => state.api.blocks.permissions)
    const closed_blocks = useSelector(state => state.api.blocks.inactive)
    const approvals = useSelector(state => state.api.blocks.approval)

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch({ type: 'BLOCK_LIST' })
    }, [])

    const columns = [
        {
            name: "block_id",
            label: "Block ID",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "item.item_code",
            label: "Item Code",
            options: {
                filter: true,
                sort: true,
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
    ];

    const getMuiTheme = () => createMuiTheme({
        overrides: {
            MuiTableRow: {
                root:
                {
                    '&$hover:hover':
                    {
                        backgroundColor: '#e6f7ff',
                    }
                }
            }
        }
    })

    const options = {
        filterType: 'checkbox',
        selectableRowsHeader: false,
        selectableRows: "none",
        onRowClick: (rowIndex) => props.history.push(`/block/detail/${rowIndex[0]}`),
        download: false,
        print: false,
        rowsPerPage: datatable ? 5 : 10,
        rowsPerPageOptions: datatable ? [5] : [10],
        enableNestedDataAccess: "."
    }

    const options_inactive = {
        filterType: 'checkbox',
        selectableRowsHeader: false,
        selectableRows: "none",
        download: false,
        print: false,
        rowsPerPage: datatable ? 5 : 10,
        rowsPerPageOptions: datatable ? [5] : [10],
        enableNestedDataAccess: "."
    }

    return (
        loading['blockall'] === false ?
            <Card title='Budget Block List'
                extra={[
                    permissions['sales.add_budgetblock'] ?
                        <BudgetBlockDrawer
                            button_name='Create Budget Block'
                            title='Create BudgetBlock'
                            component='BudgetBlockCreate'
                            button_type='create'
                            button_style='default' />
                        :
                        null
                ]} >
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Awaiting Approval" key="1">
                        <MuiThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable
                                title={"Awaiting Approval"}
                                data={approvals}
                                columns={columns}
                                options={options}
                            />
                        </MuiThemeProvider>
                    </TabPane>
                    <TabPane
                        tab='Spot Order Budget Block'
                        key="2"
                    >
                        <MuiThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable
                                data={blocks.filter(block => block.project === null && block.status === 'active' && moment(block.start_date).isBefore(moment()) && moment(block.end_date).isAfter(moment()))}
                                columns={columns}
                                options={options}
                            />
                        </MuiThemeProvider>
                    </TabPane>
                    <TabPane
                        tab='Project-Based Budget Block'
                        key="3"
                    >
                        <MuiThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable
                                data={blocks.filter(block => block.project !== null && block.status === 'active' && moment(block.start_date).isBefore(moment()) && moment(block.end_date).isAfter(moment()))}
                                columns={columns}
                                options={options}
                            />
                        </MuiThemeProvider>
                    </TabPane>
                    <TabPane
                        tab='Closed/Expired Budget Block'
                        key="4"
                    >
                        <MuiThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable
                                data={closed_blocks.concat(blocks.filter(block => block.status === 'inactive' || !moment(block.start_date).isBefore(moment()) || !moment(block.end_date).isAfter(moment())))}
                                columns={columns}
                                options={options_inactive}
                            />
                        </MuiThemeProvider>
                    </TabPane>
                </Tabs>
            </Card>
            :
            <div style={{ textAlign: "center", marginTop: '10%' }}>
                <Spin indicator={<MoonLoader
                    size={100}
                    color={"#1890ff"}
                    loading={true}
                />}
                    tip="Loading Budget Blocks..." />
            </div>
    )
}
