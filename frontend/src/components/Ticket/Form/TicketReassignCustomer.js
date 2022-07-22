
import React, { useState, useEffect, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';
import { Typography, Form, Checkbox, Button, Steps, Input, Alert } from 'antd';
import DynamicForm from '../../Application/DynamicForm';
const { Text } = Typography;
const { Step } = Steps;
export default function TicketReassignCustomer(props) {
    const [error, setError] = useState([]);
    const [step, setStep] = useState(1);
    const [acknowledged, setAcknowledge] = useState(false);
    const [customer, setCustomer] = useState([]);
    const ticket = useSelector(state => state.ticket.ticket)
    const dispatch = useDispatch()
    //this code is to filter out the current selected customer from the list
    const filteredCustomer = customer.filter(cust =>
        cust.customer_id !== ticket.customerInformation.customer_id)

    useEffect(() => {
        axiosInstance.get('/customer-information/')
            .then(response => {
                setCustomer(response.data);
            });
    }, [])

    const onFinishStepOne = values => {
        setStep(2)
    };
    const onFinishStepTwo = values => {
        values['ticket'] = ticket.id
        axiosInstance.post(`ticket/changecustomer/`, values)
            .then(response => {
                setStep(1)
                setAcknowledge(false)
                setCustomer([])
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
                <Step title="Selection" description="Which customer should be assigned to the ticket then?" />
            </Steps>
            {step === 1 ?
                <Fragment>
                    <Alert message='Warning' description={`Are you sure you wish to remove Ticket [ID: ${ticket.id}] from Customer [ID: ${ticket.customerInformation.customer_id}]? 
             To continue , please tick the confirmation checkbox`} type="warning" />
                    <Form
                        onFinish={onFinishStepOne}
                    >
                        <Form.Item name="removed_users" style={{ padding: 20 }}>
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
                <DynamicForm className="form"
                    model={[
                        { key: "customerInformation", label: "Company", type: "fkey", options: filteredCustomer, id: "customer_id", name: "customer_name" },
                    ]}
                    addon={[]}
                    response={error}
                    onSubmit={(data) => { onFinishStepTwo(data) }}
                />
            }
        </Fragment>
    )

}

