import React, { useState } from 'react'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import { useDispatch, useSelector } from 'react-redux'

export default function CompetitorItemCreate(props) {

    const dispatch = useDispatch()
    const [error, setError] = useState(null);

    const onSubmit = (data) => {
        data['item'] = props.id
        axiosInstance.post(`/competitor-item/`, data)
            .then(response => {
                props.onClose()
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'competitor',
                    data: response.data,
                    fetch: 'item_update',
                    message: 'Successfully created a competitor item'
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
                    { key: "competitor_name", label: "Competitor Name" },
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