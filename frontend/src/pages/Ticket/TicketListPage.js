import React, { Component } from 'react';
import { connect } from 'react-redux';
import MUIDataTable from "mui-datatables";
import { Layout, Spin, Tabs, Badge, Space } from 'antd';
import { Row, Card } from 'antd';
import TicketDrawer from '../../components/Ticket/Form/TicketDrawer';
import MoonLoader from "react-spinners/MoonLoader";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { AppleOutlined, AndroidOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const columns = [
    {
        name: "id",
        label: "Ticket No.",
        options: {
            filter: false,
            sort: true,
        }
    },
    {
        name: "priority",
        label: "Priority",
        options: {
            filter: true,
            sort: false,
        }
    },
    {
        name: "source",
        label: "Source",
        options: {
            filter: true,
            sort: false,
        }
    },
    {
        name: "title",
        label: "Title",
        options: {
            filter: false,
            sort: false,
        }
    },
];


class TicketListPage extends Component {

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
        const options = {
            filterType: 'checkbox',
            selectableRowsHeader: false,
            selectableRows: "none",
            onRowClick: (rowIndex) => this.props.history.push(`/ticket/detail/${rowIndex[0]}`),
            download: false,
            print: false,
            rowsPerPage: this.props.datatable ? 5 : 10,
            rowsPerPageOptions: this.props.datatable ? [5] : [10]
        };
        return (
            this.props.loading['ticketall'] === false ?
                <Card title='Ticket List' extra={this.props.tickets.permissions['sales.add_ticket'] ? [
                    <TicketDrawer
                        button_name='Create Ticket'
                        title='Create Custom Ticket'
                        component='CustomTicket'
                        button_type='create'
                        button_style='default'
                    />]
                    :
                    null}>
                    <Tabs defaultActiveKey="1">
                        <TabPane
                            tab='Awaiting Approval'
                            key="1"
                        >
                            <MuiThemeProvider theme={this.getMuiTheme()}>
                                <MUIDataTable
                                    title={"Tickets Awaiting your approval."}
                                    data={this.props.tickets.approval}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </TabPane>
                        <TabPane
                            tab='Unassigned Tickets'
                            key="2"
                        ><MuiThemeProvider theme={this.getMuiTheme()}>
                                <MUIDataTable
                                    title={"Tickets that need some attention."}
                                    data={[]}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </TabPane>
                        <TabPane
                            tab='Active Tickets'
                            key="3"
                        >
                            <MuiThemeProvider theme={this.getMuiTheme()}>
                                <MUIDataTable
                                    title={"Your list of Ongoing Tickets."}
                                    data={this.props.tickets.active}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </TabPane>
                        <TabPane
                            tab='Closed Tickets'
                            key="4"
                        >
                            <MuiThemeProvider theme={this.getMuiTheme()}>
                                <MUIDataTable
                                    title={"Closed Tickets."}
                                    data={this.props.tickets.inactive}
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
                        tip={`Grabbing your tickets...`} />
                </div>
        )

    }
}

const mapDispatchToProps = dispatch => {
    return {
        initial: () => dispatch({ type: 'TICKET_LIST' })
    }
}


const mapStateToProps = state => {
    return {
        loading: state.loading.loading,
        tickets: state.ticket.tickets,
        datatable: state.mediaquery.datatable
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TicketListPage);
