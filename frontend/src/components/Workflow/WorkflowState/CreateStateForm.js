


import React, { Component, Fragment } from 'react'
import { Typography , Row , Modal , Button } from 'antd';
import DynamicForm from '../../Application/DynamicForm';
import {PlusOutlined} from '@ant-design/icons';
import { connect } from 'react-redux';

const { Text } = Typography;
export class CreateStateForm extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
          visible: false,
      }
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
      this.props.create(data)
      this.setState({visible:false})
    };

    render() {
      return(
          <Fragment>
        <Button type="success" shape="round" onClick={this.showModal}>
        <PlusOutlined /> Add States
    </Button>

        <Modal
        visible={this.state.visible}
        title="Title"
        onOk={this.onSubmit}
        onCancel={this.handleCancel}
        footer={null}
      >
        <Row justify="center" align="middle">
        <DynamicForm className="form"
                    model={[
                        { key: "label", label: "Label" },
                        { key: "description", label: "Description" }
                    ]}
 
                    addon={[]}

                    addonData={[]}

                    onSubmit={(data) => { this.onSubmit(data) }}
                />
        </Row>
      </Modal>
      </Fragment>
      )
    }
  }


const mapDispatchToProps = dispatch => {
  return {
    create: (Data) => dispatch({ type: 'CREATE_STATE' , data: Data  }) 
  }
}


export default connect(null, mapDispatchToProps)(CreateStateForm);

