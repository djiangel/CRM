import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import axiosInstance from '../../../api/axiosApi';
import DynamicForm from '../../Application/DynamicForm';

export default function NotationCreateDrawer(props) {

    const user_list = useSelector(state => state.api.project.userProfile)
    const [error, setError] = useState([]);
    const dispatch = useDispatch()

    const onSubmit = (data) => {
        data['sales_project'] = props.id
        data['userProfile'] = 1
        axiosInstance.post('/sales-notation/', data)
            .then(response => {
                dispatch({
                    type: 'CREATE_NOTIFICATION',
                    id: props.id,
                    targets: user_list.map(user => user.id),
                    extra: 'Notations',
                    action: 'created'
                })
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'notation',
                    data: response.data,
                    fetch: 'project_update',
                    message: 'Successfully created a notation'
                })
                props.onClose()
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    return (
        <React.Fragment>
            <DynamicForm className="form"
                model={[
                    { key: "sales_notes", type: "text_area" },
                ]}

                addon={[]}

                data={[]}

                response={error}

                submitButton='Add Notation'

                onSubmit={(data) => { onSubmit(data) }}

            />
        </React.Fragment>
    )
}
