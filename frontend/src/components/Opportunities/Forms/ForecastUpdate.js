import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../../api/axiosApi';
import DynamicForm from '../../Application/DynamicForm';

export default function ForecastCreate(props) {
    const user_list = useSelector(state => state.api.project.userProfile)

    const [currency, setCurrency] = useState([]);
    const [error, setError] = useState([]);
    const dispatch = useDispatch()

    const forecast = { ...props.forecast }

    useEffect(() => {
        axiosInstance.get('/sales-project/getcurrencies/')
            .then(response => {
                setCurrency(response.data);
            });
    }, [])


    const onSubmit = (data) => {
        axiosInstance.patch(`/revenue-forecast/${props.forecast.forecast_id}/`, data)
            .then(response => {
                props.onClose()
                const user_ids = user_list.map(user => user.id)
                dispatch({
                    type: 'UPDATE_NOTIFICATION',
                    id: response.data.forecast_id,
                    url_id: response.data.project.sales_project_id,
                    original: forecast,
                    final: data,
                    extra: 'Forecast',
                    targets: user_ids,
                    subject: `Project ID ${response.data.project.sales_project_id} / `
                })
                console.log('here3')
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'forecast',
                    data: response.data.project,
                    fetch: 'project_update',
                    message: `Successfully updated revenue forecast ${props.forecast.forecast_id}`
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
                    { key: "quantity", label: "Quantity" },
                    { key: "month", label: "Month", type: "month" },
                    { key: "buy_price", currency_key: 'buy_price_currency', label: "Buy Price", type: "money", options: currency },
                    { key: "sell_price", currency_key: 'sell_price_currency', label: "Sell Price", type: "money", options: currency },
                ]}

                addon={[]}

                data={forecast}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}

            />
        </React.Fragment>
    )
}
