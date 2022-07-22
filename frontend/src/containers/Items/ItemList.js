import React, { useEffect, useState } from 'react'
import MUIDataTable from "mui-datatables";
import { Row, Col, Card, Spin, Collapse, Tabs, Statistic, Menu, Dropdown, Button, Skeleton } from 'antd';
import { useDispatch, useSelector } from 'react-redux'
import ItemDrawer from '../../components/Items/Forms/ItemDrawer';
import MoonLoader from "react-spinners/MoonLoader";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

const { TabPane } = Tabs

export default function ItemList(props) {

    const loading = useSelector(state => state.loading.loading);
    const items = useSelector(state => state.api.items);
    const datatable = useSelector(state => state.mediaquery.datatable);
    const permissions = useSelector(state => state.api.items.permissions);
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch({ type: 'ITEM_LIST' })
    }, [])

    const columns = [
        {
            name: "item_id",
            label: "Item ID",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "item_code",
            label: "Item Number",
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
    ];

    const columns_inactive = [
        {
            name: "item_id",
            label: "Item ID",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "item_code",
            label: "Item Number",
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
            name: "item_id",
            label: "Recover",
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value) => (
                    permissions['sales.recover_item'] ?
                        <ItemDrawer data={value}
                            button_name='Recover Item'
                            title='Recover Item'
                            component='ItemRecover'
                            button_type='recover'
                            button_style='default' />
                        :
                        null

                )
            }
        }
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
        onRowClick: (rowIndex) => props.history.push(`/item/detail/${rowIndex[0]}`),
        download: false,
        print: false,
        rowsPerPage: datatable ? 5 : 10,
        rowsPerPageOptions: datatable ? [5] : [10]
    }

    const options_inactive = {
        filterType: 'checkbox',
        selectableRowsHeader: false,
        selectableRows: "none",
        download: false,
        print: false,
        rowsPerPage: datatable ? 5 : 10,
        rowsPerPageOptions: datatable ? [5] : [10]
    }

    return (
        loading['itemall'] === false ?
            <Card title='Item List' extra={items.permissions['sales.add_item'] ? [
                <ItemDrawer
                    button_name='Create Item'
                    title='Create Item'
                    component='ItemCreate'
                    button_type='create'
                    button_style='default' />
            ] : null}>
                <Tabs defaultActiveKey="1">
                    <TabPane
                        tab={
                            <span>
                                Active Items
                            </span>
                        }
                        key="1"
                    >
                        <MuiThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable
                                data={items.items.filter(item => item.status === 'active')}
                                columns={columns}
                                options={options}
                            />
                        </MuiThemeProvider>
                    </TabPane>
                    <TabPane
                        tab={
                            <span>
                                Deleted Items
                            </span>
                        }
                        key="2"
                    >
                        <MuiThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable
                                data={items.items.filter(item => item.status === 'inactive')}
                                columns={columns_inactive}
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
                    tip="Loading Item Data Bank..." />
            </div>
    )
}
