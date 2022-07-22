import React , {Component,Fragment} from 'react'
import {  Button , Typography , Tag } from 'antd';
import ButtonGroup from 'antd/lib/button/button-group';

const { Text } = Typography;

class TransferProjectJustification extends Component {
    render(){
    return (
        <Fragment>
        <Text>By pressing confirm , you will be transfering access to this project to 
            <Tag>Department : {this.props.department}</Tag>
        </Text>
            <ButtonGroup>
                <Button type="primary" onClick={()=>this.props.handleConfirmButton()}>
                    Confirm
                </Button>
                <Button type="default" onClick={()=>this.props.handleBackButton()} >
                    Back
                </Button>
            </ButtonGroup>
            </Fragment>
    );
}
}

export default TransferProjectJustification;