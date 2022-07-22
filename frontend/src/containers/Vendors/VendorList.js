import React, { Component } from 'react';
import MUIDataTable from "mui-datatables";
import { Card, Spin, Tabs } from 'antd';
import { connect } from 'react-redux';
import VendorDrawer from '../../components/Vendors/Forms/VendorDrawer';
import MoonLoader from "react-spinners/MoonLoader";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import axiosInstance from '../../api/axiosApi';
import { AppleOutlined, AndroidOutlined } from '@ant-design/icons';
const { TabPane } = Tabs;
const columns = [
    {
        name: "vendor_id",
        label: "Company ID",
        options: {
            filter: false,
            sort: true,
        }
    },
    {
        name: "vendor_name",
        label: "Company Name",
        options: {
            filter: false,
            sort: true,
        }
    },
    {
        name: "telephone_number",
        label: "Telephone No.",
        options: {
            filter: true,
            sort: false,
        }
    },
    {
        name: "country.name",
        label: "Country",
        options: {
            filter: true,
            sort: false,
        }
    },
    {
        name: "address",
        label: "Address",
        options: {
            filter: false,
            sort: false,
        }
    },
    {
        name: "vendor_status.label",
        label: "Status",
        options: {
            filter: false,
            sort: false,
        }
    }


];

class VendorList extends Component {
    state = {
        awaiting_vendors: [],
        done: false
    }


    componentDidMount() {
        this.props.initial()
    };
    getMuiTheme = () => createMuiTheme({
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

    render() {
        const vendors = this.props.vendors
        const options = {
            filterType: 'checkbox',
            selectableRowsHeader: false,
            selectableRows: "none",
            onRowClick: (rowIndex) => this.props.history.push(`/vendor/detail/${rowIndex[0]}`),
            customToolbar: () => (
                vendors.permissions['sales.add_vendorinformation'] ?
                    <VendorDrawer data={true}
                        button_name='Create Vendor'
                        title='Create Vendor'
                        component='VendorCreate'
                        button_type='create'
                        button_style='default'
                    />
                    :
                    null
            ),
            download: false,
            print: false,
            rowsPerPage: this.props.datatable ? 5 : 10,
            rowsPerPageOptions: this.props.datatable ? [5] : [10],
            enableNestedDataAccess: "."
        };

        return (
            this.props.loading['vendorall'] === false ?
                <Card title='Vendor List'>
                    <Tabs defaultActiveKey="1">
                        <TabPane
                            tab={
                                <span>
                                    <AppleOutlined />
                            Awaiting Approval
                            </span>
                            }
                            key="1"
                        >
                            <MuiThemeProvider theme={this.getMuiTheme()}>
                                <MUIDataTable
                                    title={"Vendors awaiting your approval."}
                                    data={vendors.approval}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </TabPane>
                        <TabPane
                            tab={
                                <span>
                                    <AppleOutlined />
                            Prospective
                            </span>
                            }
                            key="2"
                        >
                            <MuiThemeProvider theme={this.getMuiTheme()}>
                                <MUIDataTable
                                    title={"Active , Prospective Vendors."}
                                    data={vendors.active}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </TabPane>
                        <TabPane
                            tab={
                                <span>
                                    <AppleOutlined />
                            Registered Vendors
                            </span>
                            }
                            key="3"
                        >
                            <MuiThemeProvider theme={this.getMuiTheme()}>
                                <MUIDataTable
                                    title={"Vendors that has been registered in your ERP software"}
                                    data={vendors.registered}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </TabPane>
                        <TabPane
                            tab={
                                <span>
                                    <AppleOutlined />
                            Closed Vendors
                            </span>
                            }
                            key="4"
                        >
                            <MuiThemeProvider theme={this.getMuiTheme()}>
                                <MUIDataTable
                                    title={"Vendors that are either pending registration or dropped."}
                                    data={vendors.inactive}
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
                        tip='Pulling your Vendor data...' />
                </div>
        )
    }
}

const mapStateToProps = state => ({
    vendors: state.api.vendors,
    permissions: state.api.vendors.permissions,
    loading: state.loading.loading,
    datatable: state.mediaquery.datatable
})

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        initial: () => dispatch({ type: 'VENDOR_LIST' })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(VendorList);

