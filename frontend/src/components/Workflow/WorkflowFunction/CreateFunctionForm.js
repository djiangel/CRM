


import React, { Component, Fragment } from 'react'
import { Typography , Row , Modal , Button } from 'antd';
import WorkflowCodeEditor from '../WorkflowCodeEditor';
import {PlusOutlined} from '@ant-design/icons';
import { connect } from 'react-redux';
const { Text } = Typography;

export class CreateAutomationForm extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
          new_code: null,
          str: "Name your automation here",
          loading: false,
          visible: false,
          body:null,
      }
      this.codeChanges = this.codeChanges.bind(this)
    }
    
    onChange = str => {
        this.setState({ str });
    };

    codeChanges(code){
        this.setState({new_code:{body:code}})
    }

    showModal = () => {
        this.setState({
          visible: true,
        });
      };

    handleCancel = () => {
    this.setState({ visible: false });
    };



    onSubmit = (data) => {
        data.name = this.state.str
        data.body = this.state.new_code.body
        this.props.create(data)
        this.setState({ visible: false })
    };

    render() {
      return(
          <Fragment>
        <Button type="success" shape="round" onClick={this.showModal}>
        <PlusOutlined /> Add an automation
    </Button>

        <Modal
        visible={this.state.visible}
        title="Title"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        footer={[
          <Button key="back" onClick={this.handleCancel}>
            Return
          </Button>,
          <Button key="submit" type="primary" onClick={this.onSubmit}>
            Submit
          </Button>,
        ]}
      >
        <Row justify="center" align="middle">
        <Text editable={{ onChange: this.onChange }}>{this.state.str}</Text>
         </Row>
        <WorkflowCodeEditor
        codeChangesHandler = {this.codeChanges}
        read_only= {false}
        callback_function = {{ body : null}}
      />
      </Modal>
      </Fragment>
      )
    }
}

const mapDispatchToProps = dispatch => {
  return {
    create: (Data) => dispatch({ type: 'CREATE_AUTOMATION' , data:Data })
  }
}



export default connect(null, mapDispatchToProps)(CreateAutomationForm);