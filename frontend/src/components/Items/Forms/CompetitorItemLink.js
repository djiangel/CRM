import React, { useState, useEffect } from 'react'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
import { connect } from "react-redux";
import ItemDrawer from './ItemDrawer';
import { useDispatch, useSelector } from 'react-redux'

export default function CompetitorItemLink(props) {

    const [error, setError] = useState(null);

    const [competitor, setCompetitor] = useState([]);

    const [inlineCreate, setinlineCreate] = useState(false);

    const dispatch = useDispatch()

    useEffect(() => {
        axiosInstance.get(`/competitor-item/`)
            .then(response => {
                setCompetitor(response.data);
            });
    }, [inlineCreate])

    const item = { ...props.item, 'competitors': props.item.competitors.map(competitor => competitor.competitor_id) }

    const onSubmit = (data) => {
        axiosInstance.patch(`/item/${props.item.item_id}/`, data)
            .then(response => {
                dispatch({
                    type: 'COMPONENTS',
                    loading: 'items',
                    data: response.data,
                    fetch: 'item_update',
                    message: 'Successfully linked a competitor item'
                })
                props.onClose()
            })
            .catch(error => {
                if (error.response) setError(error.response.data)
            })
    };

    const addCompetitor = <ItemDrawer data={props.item.item_id}
        inlineCreate={() => setinlineCreate(!inlineCreate)}
        button_name='Create Competitor Item'
        title='Create Competitor Item'
        component='CompetitorItemCreate'
        button_type='create_only' />

    return (
        <React.Fragment>
            <DynamicForm className="form"

                model={[
                    { key: "competitors", label: "Competitors", type: "m2m", options: competitor, id: "competitor_id", name: "item_code", add: addCompetitor },
                ]}

                addon={[]}

                data={item}

                response={error}

                onSubmit={(data) => { onSubmit(data) }}
            />
        </React.Fragment>
    )
}

