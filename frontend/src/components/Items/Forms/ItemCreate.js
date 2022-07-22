
import React, { useState, useEffect } from 'react'
import { Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import { useHistory } from 'react-router-dom';

export default function QuotationCreateDrawer(props) {
    const dispatch = useDispatch()
    const user_list = useSelector(state => state.api.project.userProfile)
    const [error, setError] = useState([]);
    const history = useHistory()

    const onSubmit = (data) => {
        axiosInstance.post(`/item/`, data)
            .then(response => {
                props.onClose()
                if (props.inlineCreate) {
                    props.inlineCreate()
                }
                else {
                    dispatch({
                        type: 'COMPONENTS',
                        loading: 'detail',
                        data: response.data,
                        fetch: 'item_update',
                        message: 'Successfully created an item'
                    })
                    history.push(`/item/detail/${response.data.item_id}`);
                }
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    return (
        <React.Fragment>
            <DynamicForm className="form"

                model={[
                    { key: "item_code", label: "Item Code" },
                    { key: "item_description", label: "Item Description", type: "text_area" },
                    { key: "base_unit", label: "Base Unit" },
                    { key: "gross_weight", label: "Gross Weight", type: "mass" },
                    { key: "net_weight", label: "Net Weight", type: "mass" },
                    { key: "dimensions", label: "Dimensions", type: "volume" },
                    { key: "base_price", label: "Base Price" },
                ]}

                addon={[]}

                data={[]}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </React.Fragment>

    )

}

