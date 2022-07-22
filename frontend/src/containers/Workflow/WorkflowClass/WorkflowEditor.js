


import React, { Component, Fragment } from 'react'
import { ApartmentOutlined, UserOutlined, AndroidOutlined, DeleteFilled } from '@ant-design/icons';
import { Typography, Tabs, Row, Col, Card, Button, Space } from 'antd';
import WorkflowApproval from '../../../components/Workflow/WorkflowClass/WorkflowApproval';
import WorkflowAutomation from '../../../components/Workflow/WorkflowClass/WorkflowAutomation';
import WorkflowStates from './WorkflowStates';
import axiosInstance from '../../../api/axiosApi';
import { connect } from 'react-redux';

const { TabPane } = Tabs;

const { Text } = Typography;

export class WorkflowEditor extends Component {
    constructor(props) {
        super(props)

        this.state = {
            done: false,
        }
        this.get_state_by = this.get_state_by.bind(this)
    }

    get_state_by(id) {
        return this.props.workflow.states.find(state => state.id == id).label;
    }

    deleteTransition(transition) {
        axiosInstance.delete(`/transition-meta/delete/${transition}/`)
            .then(response => {
                console.log(response)
            });
    }

    render() {
        if (!this.props.workflow.selected_transition && !this.props.workflow.selected_state) {
            return (
                <Fragment>
                    <Row justify="center" align="middle">
                        <Col>
                            <ApartmentOutlined style={{ fontSize: '94px', paddingBottom: '60px', paddingTop: '100px' }} />
                        </Col>
                    </Row>
                    <Row justify="center" align="middle">
                        <Text type="secondary" style={{ fontSize: '20px' }}>Hey there! Click onto an arrow or box to begin.</Text>
                    </Row>
                </Fragment>
            )
        }
        if (this.props.workflow.selected_transition && !this.props.workflow.selected_state) {
            return (
                <Card className="hoveritem">
                    <Row justify="center" align="middle" >
                        <Space>
                            <Text style={{ fontSize: '20px' }} >Transition steps from </Text>
                            <Button shape="round" type="primary">{this.get_state_by(this.props.workflow.selected_transition.source_state)}</Button>
                            <Text style={{ fontSize: '20px' }} > To </Text>
                            <Button shape="round" type="primary">{this.get_state_by(this.props.workflow.selected_transition.destination_state)}</Button>
                        </Space>
                    </Row>

                    {this.props.workflow.workflow.permissions['river.delete_transitionmeta'] ?
                        <Button type="danger" shape="round" onClick={() => this.deleteTransition(this.props.workflow.selected_transition.id)} icon={<DeleteFilled />} style={{ float: "right" }}></Button>
                        :
                        null}

                    <Tabs defaultActiveKey="1">
                        <TabPane
                            tab={
                                <span>
                                    <UserOutlined />
                        Approvals
                        </span>
                            }
                            key="1"
                        >
                            <WorkflowApproval />
                        </TabPane>
                        <TabPane
                            tab={
                                <span>
                                    <AndroidOutlined />
                        Automations
                        </span>
                            }
                            key="2"
                        >
                            <WorkflowAutomation />
                        </TabPane>
                    </Tabs>
                </Card>
            )
        } else {
            return (
                <Card className="hoveritem">
                    <WorkflowStates />
                </Card>
            )

        }
    }
}

const mapStateToProps = (state) => {
    return {
        workflow: state.workflow.workflowclass,
    }
}



export default connect(mapStateToProps, null)(WorkflowEditor);
