
import React, { useState, useEffect, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';
import { Typography, Form, Checkbox, Button, Steps, Card, Alert } from 'antd';
import DynamicForm from '../../Application/DynamicForm';
const { Text } = Typography;
const { Step } = Steps;
export default function TicketReassignProject(props) {
    const [error, setError] = useState([]);
    const [step, setStep] = useState(1);
    const [acknowledged, setAcknowledge] = useState(false);
    const [project, setProject] = useState([]);
    const ticket = useSelector(state => state.ticket.ticket)
    const dispatch = useDispatch()
    //this code is to filter out the current selected customer from the list
    const filteredProject = project.filter(proj =>
        proj.sales_project_id !== ticket.salesProject.sales_project_id)

    useEffect(() => {
        axiosInstance.get(`/ticket/getsalesproject/?customer_infomation=${ticket.customerInformation.customer_id}`)
            .then(response => {

                setProject(response.data)
            });
    }, [])

    const onFinishStepOne = values => {
        setStep(2)
    };

    const onFinishStepTwo = values => {
        values['ticket'] = ticket.id
        axiosInstance.post(`ticket/changeproject/`, values)
            .then(response => {
                setStep(1)
                setAcknowledge(false)
                setProject([])

                dispatch({
                    type: 'TICKET_COMPONENTS',
                    loading: 'ticket',
                    data: response.data,
                    fetch: 'UPDATE_TICKET_DETAILS',
                    message: `Successfully reassgined ticket`
                })
                props.onClose()
            })
    };

    const onChange = e => {
        setAcknowledge(
            e.target.checked
        );
    };


    return (
        <Fragment>
            <Steps current={step}>
                <Step title="Acknowledgement" description="Are you sure?" />
                <Step title="Selection" description="Which project shall the ticket be assigned to then?" />
            </Steps>
            {step === 1 ?
                <Fragment>
                    <Alert message='Warning' description={`Are you sure you wish to remove Ticket [ID: ${ticket.id}] from Project [ID: ${ticket.salesProject.sales_project_id}]? 
             To continue , please tick the confirmation checkbox`} type="warning" />
                    <Form
                        onFinish={onFinishStepOne}
                    >
                        <Form.Item name="acknowledgement" style={{ padding: 20 }}>
                            <Checkbox onChange={onChange}>Yes</Checkbox>
                        </Form.Item>
                        <Form.Item>

                            <Button type="primary" htmlType="submit" disabled={!acknowledged}>
                                Submit
                </Button>
                            <Button onClick={() => props.onClose()}>
                                Cancel
                </Button>

                        </Form.Item>
                    </Form>
                </Fragment>
                :
                <Fragment>
                    <Card>
                        <Alert
                            message="Warning"
                            description="Only Projects that have the same associated customer as this ticket will be shown here"
                            type="warning"
                            showIcon
                        />
                    Please select the Project you wish to transfer this ticket to. Leave blank if you don't wish to associate it with any project.
                </Card>
                    <DynamicForm className="form"
                        model={[
                            { key: "salesProject", label: "Projects", type: "fkey", options: filteredProject, id: "sales_project_id", name: "sales_project_name" },
                        ]}
                        addon={[]}
                        response={error}
                        onSubmit={(data) => { onFinishStepTwo(data) }}
                    />
                </Fragment>
            }
        </Fragment>
    )

}

