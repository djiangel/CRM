import React, { Component } from 'react';
import MUIDataTable from "mui-datatables";
import { Card, Spin, Tabs } from 'antd';
import { connect } from 'react-redux';
import CustomerDrawer from '../../components/Customers/Forms/CustomerDrawer';
import MoonLoader from "react-spinners/MoonLoader";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import axiosInstance from '../../api/axiosApi';
import { AppleOutlined, AndroidOutlined } from '@ant-design/icons';
const { TabPane } = Tabs;
const columns = [
    {
        name: "customer_id",
        label: "Company ID",
        options: {
            filter: false,
            sort: true,
        }
    },
    {
        name: "customer_name",
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
        name: "customer_status.label",
        label: "Status",
        options: {
            filter: false,
            sort: false,
        }
    }


];




class CustomerList extends Component {
    state = {
        awaiting_customers: [],
        done: false
    }


    componentDidMount() {
        this.props.initial()
        axiosInstance
            .get(`/customer-information/getapprovals/`)
            .then((res) => {
                this.setState({ awaiting_customers: res.data })
                this.setState({ done: true })
            })
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
        const customers = this.props.customers
        const options = {
            filterType: 'checkbox',
            selectableRowsHeader: false,
            selectableRows: "none",
            onRowClick: (rowIndex) => this.props.history.push(`/customer/detail/${rowIndex[0]}`),
            customToolbar: () => (
                this.props.permissions['sales.add_customerinformation'] ?
                    <CustomerDrawer data={true}
                        button_name='Create Customer'
                        title='Create Customer'
                        component='CustomerCreate'
                        button_type='create'
                        button_style='default'
                    /> :
                    null
            ),
            download: false,
            print: false,
            rowsPerPage: this.props.datatable ? 5 : 10,
            rowsPerPageOptions: this.props.datatable ? [5] : [10],
            enableNestedDataAccess: "."
        };
        return (
            this.props.loading['customerall'] === false && this.state.done ?
                <Card>
                    <Tabs defaultActiveKey="1">
                        <TabPane
                            tab='Awaiting Approval'
                            key="1"
                        >
                            <MuiThemeProvider theme={this.getMuiTheme()}>
                                <MUIDataTable
                                    title={"Customers awaiting your approval."}
                                    data={customers.approval}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </TabPane>
                        <TabPane
                            tab='Prospective Customers'
                            key="2"
                        >
                            <MuiThemeProvider theme={this.getMuiTheme()}>
                                <MUIDataTable
                                    title={"Active , Prospective Customers."}
                                    data={customers.active}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </TabPane>
                        <TabPane
                            tab='Registered Customers'
                            key="3"
                        >
                            <MuiThemeProvider theme={this.getMuiTheme()}>
                                <MUIDataTable
                                    title={"Customers that has been registered in your ERP software"}
                                    data={customers.registered}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </TabPane>
                        <TabPane
                            tab='Closed Customers'
                            key="4"
                        >
                            <MuiThemeProvider theme={this.getMuiTheme()}>
                                <MUIDataTable
                                    title={"Customers that are either pending registration or dropped."}
                                    data={customers.inactive}
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
                        tip='Pulling your Customer data...' />
                </div>
        )
    }
}

const mapStateToProps = state => ({
    customers: state.api.customers,
    permissions: state.api.customers.permissions,
    loading: state.loading.loading,
    person: state.auth,
    datatable: state.mediaquery.datatable
})

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        initial: () => dispatch({ type: 'CUSTOMER_LIST' })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomerList);

