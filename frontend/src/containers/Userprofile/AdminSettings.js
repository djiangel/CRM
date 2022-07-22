
import React, { useState, useEffect } from 'react'
import MUIDataTable from "mui-datatables";
import { Row, Col, Card, Spin, Collapse, Tabs, Statistic, Menu, Dropdown, Button, Skeleton } from 'antd';
import { useDispatch, useSelector } from 'react-redux'
import MoonLoader from "react-spinners/MoonLoader";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import axiosInstance from '../../api/axiosApi';
import SettingsDrawer from './Forms/SettingsDrawer';


const { TabPane } = Tabs;

export default function AdminSettings() {


    const states = useSelector(state => state.api.actual_state);
    const loading = useSelector(state => state.loading.loading);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch({ type: 'ADMIN_SETTINGS' })
    }, [])


    const columns = [
        {
            name: "state_type",
            label: "Type",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "state.label",
            label: "State",
            options: {
                filter: true,
                sort: true,
            }
        },
    ];

    /*

            {
            name: "id",
            label: "Edit",
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta) => {
                    return (
                        <SettingsDrawer
                            data={states.find(state => state.id === value)}
                            button_name='Update Actual State'
                            title='Update Actual State'
                            component='ActualStateUpdate'
                            button_type='update_only'
                            button_style='default' />
                    )
                }
            }
        },

        */

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
        download: false,
        print: false,
        enableNestedDataAccess: "."
    }

    return (
        loading['adminsettings'] === false ?
            <Card title='Workflow State Settings'
                extra={[
                    <SettingsDrawer
                        button_name='Create Actual State'
                        title='Create Actual State'
                        component='ActualStateCreate'
                        button_type='create'
                        button_style='default' />
                ]} >
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Project" key="1">
                        <MuiThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable
                                data={states.filter(state => state.workflow_type === 'Project')}
                                columns={columns}
                                options={options}
                            />
                        </MuiThemeProvider>
                    </TabPane>
                    <TabPane
                        tab='Customer'
                        key="2"
                    >
                        <MuiThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable
                                data={states.filter(state => state.workflow_type === 'Customer')}
                                columns={columns}
                                options={options}
                            />
                        </MuiThemeProvider>
                    </TabPane>
                    <TabPane
                        tab='Vendor'
                        key="3"
                    >
                        <MuiThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable
                                data={states.filter(state => state.workflow_type === 'Vendor')}
                                columns={columns}
                                options={options}
                            />
                        </MuiThemeProvider>
                    </TabPane>
                    <TabPane
                        tab='Block'
                        key="4"
                    >
                        <MuiThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable
                                data={states.filter(state => state.workflow_type === 'Block')}
                                columns={columns}
                                options={options}
                            />
                        </MuiThemeProvider>
                    </TabPane>
                    <TabPane
                        tab='Quotation'
                        key="5"
                    >
                        <MuiThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable
                                data={states.filter(state => state.workflow_type === 'Quotation')}
                                columns={columns}
                                options={options}
                            />
                        </MuiThemeProvider>
                    </TabPane>
                    <TabPane
                        tab='Ticket'
                        key="6"
                    >
                        <MuiThemeProvider theme={getMuiTheme()}>
                            <MUIDataTable
                                data={states.filter(state => state.workflow_type === 'Ticket')}
                                columns={columns}
                                options={options}
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
                    tip="Loading States" />
            </div>
    )
}
