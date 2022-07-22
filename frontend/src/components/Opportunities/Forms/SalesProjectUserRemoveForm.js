
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';
import { Checkbox, Button, Avatar, Form, Steps, Space, Row, Input, Spin } from 'antd';
const { Step } = Steps;

export default function SalesPorjectUserAddForm(props) {
    const [step, setStep] = useState(1);
    const [removed_users, setRemovedUsers] = useState([]);
    const user_list = useSelector(state => state.api.project.userProfile)
    const project_id = useSelector(state => state.api.project.sales_project_id)
    const dispatch = useDispatch()


    const onFinishStepOne = values => {
        setStep(2)
        setRemovedUsers(values.removed_users)
    };


    const onFinishStepTwo = values => {
        values['removed_users'] = removed_users
        values['type'] = 'REMOVE'
        axiosInstance.put(`/sales-project/${project_id}/changeuser/`, values)
            .then(response => {
                setStep(1)
                setRemovedUsers([])
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'personnel',
                    data: response.data,
                    fetch: 'project_update',
                    message: `Successfully removed user(s)`
                })
                props.onClose()
            })
    };

    return (
        <React.Fragment>
            <Steps current={step}>
                <Step title="Select Users" description="Select the users you wish to remove" />
                <Step title="Justifications" description="Let us know why you wish to remove the user(s)" />
            </Steps>
            {step === 1 ?
                <Form
                    onFinish={onFinishStepOne}
                >
                    <Form.Item name="removed_users" style={{ padding: 20 }}>
                        <Checkbox.Group>
                            {user_list.map(user =>
                                <Row style={{ padding: 10 }}>
                                    <Checkbox value={user.id}><Space><Avatar src={user.profile_picture} />{user.user.username} </Space> </Checkbox>
                                </Row>
                            )}
                        </Checkbox.Group>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Remove
                </Button>
                    </Form.Item>
                </Form>
                :
                (removed_users ?
                    <Form
                        onFinish={onFinishStepTwo}
                    >
                        <Form.Item name={'Justifications'} label="Justifications">
                            <Input.TextArea rows={4} />
                        </Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit
            </Button>
                    </Form>
                    :
                    <Spin></Spin>
                )
            }
        </React.Fragment>
    )
}

