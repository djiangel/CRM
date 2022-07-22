import React, { useState, useEffect, Fragment } from 'react'
import { Spin, Tabs, Card } from 'antd';
import { useDispatch, useSelector } from 'react-redux'
import MUIDataTable from "mui-datatables";
import { useHistory } from 'react-router-dom';
import QuotationDrawer from '../../components/Quotations/Forms/QuotationDrawer';
import MoonLoader from "react-spinners/MoonLoader";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import axiosInstance from '../../api/axiosApi';

const { TabPane } = Tabs;

export default function QuotationList(props) {

    const history = useHistory()
    const dispatch = useDispatch()
    const quotations = useSelector(state => state.api.quotations.active)
    const permissions = useSelector(state => state.api.quotations.permissions)
    const closed_quotations = useSelector(state => state.api.quotations.inactive)
    const approvals = useSelector(state => state.api.quotations.approval)
    const loading = useSelector(state => state.loading.loading)
    const datatable = useSelector(state => state.mediaquery.datatable);

    useEffect(() => {
        dispatch({ type: 'QUOTATION_LIST' })
    }, [])

    const columns1 = [
        {
            name: "quotation_id",
            label: "Quotation ID",
            options: {
                filter: false,
                sort: true,
            }
        },
        {
            name: "due_date",
            label: "Due Date",
            options: {
                filter: false,
                sort: true,
            }
        },
        {
            name: "quotation_status.label",
            label: "Status",
            options: {
                filter: true,
                sort: false,
            }
        },
        {
            name: "customer.customer_name",
            label: "Customer",
            options: {
                filter: true,
                sort: false,
            }
        },
    ];

    const columns2 = [
        {
            name: "quotation_id",
            label: "Quotation ID",
            options: {
                filter: false,
                sort: true,
            }
        },
        {
            name: "due_date",
            label: "Due Date",
            options: {
                filter: false,
                sort: true,
            }
        },
        {
            name: "quotation_status.label",
            label: "Status",
            options: {
                filter: true,
                sort: false,
            }
        },
        {
            name: "customer.customer_name",
            label: "Customer",
            options: {
                filter: true,
                sort: false,
            }
        },
        {
            name: "salesProject.sales_project_name",
            label: "Sales Project",
            options: {
                filter: false,
                sort: false,
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

    const options1 = {
        filterType: 'checkbox',
        filterType: 'checkbox',
        selectableRowsHeader: false,
        selectableRows: "none",
        onRowClick: (rowIndex) => history.push(`/quotation/detail/${rowIndex[0]}`),
        download: false,
        print: false,
        pagination: false,
        enableNestedDataAccess: "."
    };

    const options2 = {
        filterType: 'checkbox',
        selectableRowsHeader: false,
        selectableRows: "none",
        onRowClick: (rowIndex) => history.push(`/quotation/detail/${rowIndex[0]}`),
        download: false,
        print: false,
        pagination: false,
        enableNestedDataAccess: "."
    };


    // dion same here need add extra check of if project is compelted before allowing project-based to be added

    return (
        loading['quotationall'] === false ?
            <Card title='Quotation List' extra={permissions['sales.add_quotation'] ?
                [<QuotationDrawer
                    button_name='Create Project Based Quotation'
                    title='Create Project Based Quotation'
                    component='QuotationProject'
                    button_type='create'
                    button_style='default' />,
                <QuotationDrawer
                    button_name='Create Spot Order'
                    title='Create Spot Order'
                    component='QuotationCustomer'
                    button_type='create'
                    button_style='default' />


                ] : null
            }>
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Awaiting Approval" key="1">
                        <MuiThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable
                                title={"Awaiting Approval"}
                                data={approvals}
                                columns={columns1}
                                options={options1}
                            />
                        </MuiThemeProvider>
                    </TabPane>
                    <TabPane tab="Spot Orders" key="2">
                        <MuiThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable
                                title={"Spot Orders"}
                                data={quotations.filter(quotation => quotation.salesProject === null)}
                                columns={columns1}
                                options={options1}
                            />
                        </MuiThemeProvider>
                    </TabPane>
                    <TabPane tab="Project Based" key="3">
                        <MuiThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable
                                title={"Project Based"}
                                data={quotations.filter(quotation => quotation.salesProject !== null)}
                                columns={columns2}
                                options={options2}
                            />
                        </MuiThemeProvider>
                    </TabPane>
                    <TabPane tab="Closed Quotations" key="4">
                        <MuiThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable
                                title={"Closed Quotations"}
                                data={closed_quotations}
                                columns={columns2}
                                options={options2}
                            />
                        </MuiThemeProvider>
                    </TabPane>

                </Tabs>
            </Card >
            :
            <div style={{ textAlign: "center", marginTop: '10%' }}>
                <Spin indicator={<MoonLoader
                    size={100}
                    color={"#1890ff"}
                    loading={true}
                />}
                    tip="Extracting your Quotations..." />
            </div>

    )
}

