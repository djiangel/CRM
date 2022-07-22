import React, { Component, Fragment } from 'react'
import { Typography, Row, Spin } from 'antd';
import { connect } from 'react-redux';
import CreateStateForm from '../../components/Workflow/WorkflowState/CreateStateForm.js';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
const { Text } = Typography;

const columns = [
  {
    name: "id",
    label: "State ID.",
    options: {
      filter: false,
      sort: true,
    }
  },
  {
    name: "label",
    label: "Label",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "slug",
    label: "Alternative",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "description",
    label: "Description",
    options: {
      filter: false,
      sort: false,
    }
  },
];



export class ListFunctionPage extends Component {

  componentDidMount() {
    this.props.initial()
  }

  passPermTest(codeNames) {
    return codeNames.every(
      codeName => !!this.props.person.group.find(
        group => group.permissions.find(
          permission => permission.codename === codeName
        )
      )
    )
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
    const options = {
      filterType: 'checkbox',
      selectableRowsHeader: false,
      selectableRows: "none",
      onRowsDelete: (rowIndex) => this.props.delete(this.props.statelist[rowIndex.data[0].dataIndex].id),
      download: false,
      print: false,
      rowsPerPage: this.props.datatable ? 5 : 10,
      rowsPerPageOptions: this.props.datatable ? [5] : [10]
    };
    return (
      this.props.loading['statelist'] === false ?
        <Fragment>
          {this.passPermTest(['add_state']) ?
            <Row justify="end" style={{ paddingBottom: 10 }}>
              <CreateStateForm />
            </Row>
            :
            null
          }
          <MuiThemeProvider theme={this.getMuiTheme()}>
            <MUIDataTable
              title={"State List"}
              data={this.props.statelist}
              columns={columns}
              options={options}
            />
          </MuiThemeProvider>
        </Fragment>
        :
        <div style={{ textAlign: 'center' }}><Spin size='large' /></div>
    )
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    initial: () => dispatch({ type: 'STATE_lIST', id: ownProps.match.params.id }),
    delete: (state_id) => dispatch({ type: 'DELETE_STATE', id: state_id })
  }
}


const mapStateToProps = state => ({
  loading: state.loading.loading,
  loadingComponent: state.loading.loadingComponent,
  statelist: state.workflow.statelist,
  person: state.auth,
  datatable: state.mediaquery.datatable
});

export default connect(mapStateToProps, mapDispatchToProps)(ListFunctionPage);



