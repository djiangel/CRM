
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';
import DynamicForm from '../../Application/DynamicForm';
import { Avatar, List } from 'antd';

export default function SalesPorjectUserAddForm(props) {
    const [error, setError] = useState([]);
    const [personnel, setPersonnel] = useState([]);
    const user_list = useSelector(state => state.api.project.userProfile)
    const project_id = useSelector(state => state.api.project.sales_project_id)
    const dispatch = useDispatch()

    useEffect(() => {
        axiosInstance.get(`/sales-project/${project_id}/getexternalusers/`)
            .then(response => {
                setPersonnel(response.data)
            });
    }, [])


    const onSubmit = (data) => {
        data['type'] = 'ADD'
        axiosInstance.put(`/sales-project/${project_id}/changeuser/`, data)
            .then(response => {
                const user_ids = user_list.map(user => user.id)
                //Logic for creating notifications will be within backend as customization needed.//
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'personnel',
                    data: response.data,
                    fetch: 'project_update',
                    message: `Successfully added user(s)`
                })
                props.onClose()
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    for (var i = 0; i < personnel.length; i++) {
        personnel[i]['username'] = personnel[i].user.username;
    }

    return (
        <React.Fragment>
            <List
                header='Current Team'
                itemLayout="horizontal"
                bordered
                dataSource={user_list}
                renderItem={user => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar src={user.profile_picture} />}
                            title={user.user.username}
                        />
                    </List.Item>
                )}
            />
            {personnel ?
                <DynamicForm className="form"

                    model={[
                        { key: "added_users", label: "Sales Team", type: "m2m", options: personnel, id: "id", name: "username" },
                    ]}
                    addon={[]}
                    response={error}
                    onSubmit={(data) => { onSubmit(data) }}
                /> : null}
        </React.Fragment>
    )
}
