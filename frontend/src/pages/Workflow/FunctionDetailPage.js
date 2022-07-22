import React, { Component, Fragment } from 'react'
import { DeleteFilled } from '@ant-design/icons';
import { Typography, Row, Spin, Button, Card, Result } from 'antd';
import axiosInstance from '../../api/axiosApi';
import WorkflowCodeEditor from '../../components/Workflow/WorkflowCodeEditor';
import { connect } from 'react-redux';
import { PermissionsChecker } from '../../api/PermissionsChecker';
const { Title } = Typography;

export class FunctionDetailPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      function: null,
      new_code: null,
      str: null,
      done: false,
      error: null,
    }
    this.codeChanges = this.codeChanges.bind(this)
    this.deleteFunction = this.deleteFunction.bind(this)
  }


  onChange = str => {
    this.setState({ str });
  };

  apiGet() {
    axiosInstance
      .get(`/function/get/${this.props.match.params.id}/`)
      .then(
        response => {
          this.setState({ function: response.data });
          this.setState({ str: response.data.name });
          this.setState({ done: true })
        }
      ).catch(error => {
        const errordata = {
          status: [404, 403, 500].includes(error.response.status) ? error.response.status : 'warning',
          message: error.response.data
        }
        this.setState({ error: errordata })
        this.setState({ done: true })
      })
  }

  deleteFunction() {
    axiosInstance
      .delete(`/function/delete/${this.state.function.id}/`)
      .then(
        response => {
          window.location.href = "/workflow/automations/"
        }
      )
  }

  codeChanges(code) {
    this.setState({ new_code: { body: code } })
  }

  publish(data) {
    if (data) {
      axiosInstance.put(
        `/function/update/${this.state.function.id}/`,
        {
          name: this.state.str,
          body: data.body
        }).then(
          response => {
            window.location.href = "/workflow/automations/"
          }
        )

    } else {
      console.log("No changes registered!")
    }
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

  componentDidMount() {
    this.apiGet()
  }

  render() {
    if (this.state.done) {
      return (
        !this.state.error ?
          <Card className="hoveritem">
            <Row justify="center" align="middle">
              {this.passPermTest(['change_function']) ?
                <Title editable={{ onChange: this.onChange }}>{this.state.str}</Title>
                :
                <Title>{this.state.str}</Title>}
            </Row>
            {PermissionsChecker(this.props.person.group, ['delete_function']) ?
              <Button type="danger" style={{ float: "right" }} shape="circle" onClick={this.deleteFunction} icon={<DeleteFilled />} />
              :
              null}

            <WorkflowCodeEditor
              callback_function={{ body: this.state.function.body }}
              codeChangesHandler={this.codeChanges}
              read_only={false}
            />
            {PermissionsChecker(this.props.person.group, ['delete_function']) ?
              <Row justify="center">
                <Button type="primary" onClick={() => this.publish(this.state.new_code)} >
                  Save changes
                </Button>
              </Row>
              :
              null}
          </Card>
          :
          <Result
            status={this.state.error.status}
            title={this.state.error.status}
            subTitle={this.state.error.message.detail}
            extra={<Button type="primary">Back Home</Button>}
          />
      )
    } else {
      return (
        <div style={{ textAlign: 'center' }}><Spin size='large' /></div>)
    }
  }
}

const mapStateToProps = state => {
  return {
    person: state.auth
  };
};




export default connect(mapStateToProps, null)(FunctionDetailPage);