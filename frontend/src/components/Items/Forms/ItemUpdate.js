import React, { useState, useEffect } from 'react'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import { useDispatch, useSelector } from 'react-redux'

export default function ItemUpdate(props) {

    const dispatch = useDispatch()
    const [error, setError] = useState(null);

    const item = { ...props.item }

    const onSubmit = (data) => {
        axiosInstance.patch(`/item/${props.item.item_id}/`, data)
            .then(response => {
                props.onClose()
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'detail',
                    data: response.data,
                    fetch: 'item_update',
                    message: `Successfully updated item ${props.item.item_id}`
                })
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

                data={item}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </React.Fragment>
    )
}
