


import React, { Component , Fragment } from 'react'
import { Typography , Select , Spin , Button , Modal} from 'antd';
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import {PlusOutlined} from '@ant-design/icons';
import { connect } from 'react-redux';

const { Option } = Select;
const { Text } = Typography;

export class AutomationHookForm extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
          loading: false,
          visible: false,
          function_list: [],
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


    apiGet(){
        var  get_functions =  
        axiosInstance.get('/function/list/')
            .then(response => {
                this.setState({ function_list: response.data })
            });

        Promise.all([get_functions ]).then(() => {
              this.setState({ done : true });
              }
        )
    }

    onSubmit = (data) => {
        data.transition_meta = this.props.workflow.selected_transition.id
        data.workflow = this.props.workflow.workflow.id
        data.object_id = null
        data.content_type = null
        data.transition = null 
        data.hook_type = "BEFORE"
        this.props.createHook(data)
        this.handleCancel()
    };


    componentDidMount(){
        this.apiGet()
    }

    render() {
        if (this.state.done === true){
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
                null
              ]}
            >
              <DynamicForm className="form"
                    model={[
                        { key: "callback_function", label: "Automation" ,  type: "fkey" , options: this.state.function_list , id : "id" , name: "name"  },
                    ]}
                    addon={[]}
                    addonData={[]}
                    onSubmit={(data) => { this.onSubmit(data) }} />
            </Modal>
            </Fragment>
            )

        } else {
            return (
                <div style={{ textAlign: 'center' }}><Spin size='large' /></div>
            )

        }
    }
}



  const mapStateToProps = (state) => {
    return {
        workflow: state.workflow.workflowclass,
    }
  }
  const mapDispatchToProps = dispatch => {
    return {
        createHook: (hook) => dispatch({ type: 'CREATE_TRANSITION_APPROVAL_HOOK' , data : hook }),
    }
  }
  
  
  export default connect(mapStateToProps, mapDispatchToProps)(AutomationHookForm);
  

