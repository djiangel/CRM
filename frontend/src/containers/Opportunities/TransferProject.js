import React, { Component, Fragment } from 'react';
import TransferProjectSelectDepartment from '../../components/Opportunities/Forms/TransferProjectSelectDepartment';
import TransferProjectSelectTeam from '../../components/Opportunities/Forms/TransferProjectSelectTeam';
import TransferProjectJustification from '../../components/Opportunities/Forms/TransferProjectJustification';
import TransferProjectConfirmation from '../../components/Opportunities/Forms/TransferProjectConfirmation';
import { Steps, Drawer, Button } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { connect } from "react-redux";
import axiosInstance from '../../api/axiosApi';

const { Step } = Steps;

class TransferProject extends Component {
    state = {
        step: 1,
        department: {},
        team: [],
        justification: {},
        visible: false
    }

    formOpen = () => {
        this.setState({ visible: true })
    }

    formClose = () => {
        this.setState({ visible: false })
    }


    handleNextButton = () => {
        const { step } = this.state;
        this.setState({ step: step + 1 });
    }

    handleBackButton = () => {
        const { step } = this.state;
        this.setState({ step: step - 1 })
    }

    handleConfirmButton = () => {
        axiosInstance.put(`/sales-project/${this.props.project_id}/transferproject/`,
            {
                team: this.state.team,
                department: this.state.department
            }
        )
            .then(response => {
                this.setState({ data: response.data })
                this.setState({ done: true })
            });
    }

    getDepartment = (values) => {
        this.setState({ department: values })
    }
    getTeam = (values) => {
        this.setState({ team: values })
    }
    getJustification = (values) => {
        this.setState({ justification: values })
    }

    render() {
        const { step } = this.state;
        return (
            <Fragment>
                <Button icon={<SwapOutlined />} shape='circle' size='small' style={{ marginLeft: '5px' }} onClick={() => this.formOpen()}>
                </Button>
                <Drawer
                    title="Transfer Project"
                    width={900}
                    onClose={() => this.formClose()}
                    visible={this.state.visible}
                    bodyStyle={{ paddingBottom: 80 }}
                >
                    <Steps current={this.state.step}>
                        <Step title="Deparment" description="Which Department to transfer to?" />
                        <Step title="Team" description="Which users can access this?" />
                        <Step title="Justifications" description="Let us know why you wish to transfer the project" />
                        <Step title="Confirmation" description="Confirm the transfer" />
                    </Steps>
                    {
                        step === 1 ?
                            <div>
                                <TransferProjectSelectDepartment current_department={this.props.current_department} handleNextButton={this.handleNextButton} submittedValues={this.getDepartment} />
                            </div>
                            :
                            step === 2 ?
                                <div>
                                    <TransferProjectSelectTeam next_department={this.state.department} handleNextButton={this.handleNextButton} handleBackButton={this.handleBackButton} submittedValues={this.getTeam} />
                                </div>
                                :
                                step === 3 ?
                                    <div>
                                        <TransferProjectJustification handleNextButton={this.handleNextButton} handleBackButton={this.handleBackButton} submittedValues={this.getJustification} />
                                    </div>
                                    :
                                    <div>
                                        <TransferProjectConfirmation department={this.state.department} handleConfirmButton={this.handleConfirmButton} handleBackButton={this.handleBackButton} />
                                    </div>
                    }
                </Drawer>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        project_id: state.api.project.sales_project_id,
        current_department: state.api.project.sales_department.department_id,
        customer: state.api.project.customerInformation
    }
};


export default connect(mapStateToProps, null)(TransferProject); 