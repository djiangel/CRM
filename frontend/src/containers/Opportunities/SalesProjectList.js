import React, { Component } from 'react'
import { Card, Spin, Tabs } from 'antd';
import { connect } from 'react-redux';
import OpportunityDrawer from '../../components/Opportunities/Forms/OpportunityDrawer';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { AppleOutlined, AndroidOutlined } from '@ant-design/icons';
import MUIDataTable from "mui-datatables";
import MoonLoader from "react-spinners/MoonLoader";

const { TabPane } = Tabs;

class SalesProjectList extends Component {

    state = {
        projects: null,
        done: false,
        rows: 5,
    }

    componentDidMount() {
        this.props.initial();
    }

    componentDidUpdate(prevProps) {
        if (document.getElementsByClassName("MuiTableRow-root").length !== 0 && prevProps !== this.props) {
            let all_rows = document.getElementsByClassName("MuiTableRow-root");
            all_rows = Array.from(all_rows);
            let tr_height = Math.max(...all_rows.map(each => each.offsetHeight));
            let height = document.getElementsByClassName("ant-card-head")[0].offsetHeight;
            height += document.getElementsByClassName("ant-tabs-nav")[0].offsetHeight;
            height += document.getElementsByClassName("MuiToolbar-root")[0].offsetHeight;
            height += document.getElementsByClassName("MuiTableHead-root")[0].offsetHeight;
            height += document.getElementsByClassName("MuiTableFooter-root")[0].offsetHeight;
            let total_height = window.innerHeight - parseInt('150px', 10) - height;
            let rows = total_height / tr_height;
            this.setState({ rows: Math.floor(rows) })
        }
    }

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
        const columns = [
            {
                name: "sales_project_id",
                label: "Project No.",
                options: {
                    filter: false,
                    sort: true,
                }
            },
            {
                name: "sales_project_name",
                label: "Project Name",
                options: {
                    filter: true,
                    sort: false,
                }
            },
            {
                name: "sales_project_est_rev",
                label: "Estimated Revenue",
                options: {
                    filter: true,
                    sort: false,
                }
            },
            {
                name: "project_status.label",
                label: "status",
                options: {
                    filter: false,
                    sort: false,
                }
            },
        ];

        const options = {
            filterType: 'checkbox',
            selectableRowsHeader: false,
            selectableRows: "none",
            onRowClick: (rowIndex) => this.props.history.push(`/project/detail/${rowIndex[0]}`),
            download: false,
            print: false,
            rowsPerPage: this.state.rows,
            rowsPerPageOptions: this.props.datatable ? [5] : [10],
            enableNestedDataAccess: "."
        };
        return (
            this.props.loading['salesprojectall'] === false ?
                <Card title='Sales Project List' className="hoveritem"
                    extra={this.props.projects.permissions['sales.add_salesproject'] ? [
                        <OpportunityDrawer
                            key='create-project'
                            button_name='Create Project'
                            title='Create Project'
                            component='SalesProjectCreate'
                            button_type='create'
                            button_style='default' />
                    ] : null}
                >
                    <Tabs defaultActiveKey="2">
                        <TabPane
                            tab='Awaiting Approval'
                            key="1"
                        >
                            <MuiThemeProvider theme={this.getMuiTheme()}>
                                <MUIDataTable
                                    title={"Projects awaiting for your approval."}
                                    data={this.props.projects.approval}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </TabPane>
                        <TabPane
                            tab='Active Projects'
                            key="2"
                        >
                            <MuiThemeProvider theme={this.getMuiTheme()}>
                                <MUIDataTable
                                    title={"Your ongoing projects."}
                                    data={this.props.projects.active}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </TabPane>
                        <TabPane
                            tab='Closed Projects'
                            key="3"
                        >
                            <MuiThemeProvider theme={this.getMuiTheme()}>
                                <MUIDataTable
                                    title={"Projects that were closed."}
                                    data={this.props.projects.inactive}
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
                        tip={`Grabbing your projects`} />
                </div>
        )
    }



}

const mapStateToProps = state => ({
    loading: state.loading.loading,
    projects: state.api.projects,
    datatable: state.mediaquery.datatable
})

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        initial: () => dispatch({ type: 'SALES_PROJECT_LIST' })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SalesProjectList);