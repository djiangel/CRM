import React, { useState, useEffect, Fragment } from 'react'
import { Drawer, Button, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux'
import DynamicForm from '../../Application/DynamicForm';
import axiosInstance from '../../../api/axiosApi';
const uniq = array => {
    const map = {};
    const result = [];
    for (let i = 0; i < array.length; i++) {
        // since elements can be objects, need to do a deep comparison.
        const element = JSON.stringify(array[i]);
        if (map[element] === undefined) {
            map[element] = true;
            result.push(array[i]);
        }
    }
    return result;
}

export default function CreateTaskForm(props) {
    const dispatch = useDispatch()
    const form = useSelector(state => state.calendar.form)
    const loading = useSelector(state => state.loading.loading)
    const [error, setError] = useState([]);

    useEffect(() => {
        dispatch({ type: 'CALENDAR_LIST_FORM_DATA' })
    }, [])

    const parser = (markup) => {
        return [...markup.matchAll(/@\[(.*?)]\((.*?):(\d+)\)/g)]
            .reduce((a, v) => {
                a[v[2]] = (a[v[2]] || []).concat({ id: +v[3] })
                return a
            }, {})
    }
    const rx = /(@\[[^\][]*])\([^()]*?:\d+\)/g;
    const remove_parens = (string, regex) => string.replace(regex, '$1');

    const onSubmit = (data) => {
        // Checks if prop => autoadd is defined. If it is , it will then check if the data exists in the array newData
        // If the object does not exists , it will create a new object , if it is not , it will push the object in
        // User will be automatically added in from the backend
        const content = data['content']
        const newData = { ...data, ...parser(content) }
        newData['content'] = remove_parens(data['content'], rx)
        if (props.autoadd) {
            if (!newData[props.autoadd['type']]) {
                newData[props.autoadd['type']] = []
            }
            newData[props.autoadd['type']].push(props.autoadd['value'])
            //this is to remove dups
            for (const key in newData) {
                if (Array.isArray(newData[key])) {
                    newData[key] = uniq(newData[key])
                }
            }
        }
        //due to complexity , logic for notification is in backend, views
        axiosInstance.post(`/tasks/`, newData)
            .then(response => {
                dispatch({
                    type: 'CALENDAR_COMPONENTS',
                    loading: 'calendar',
                    data: response.data,
                    fetch: 'UPDATE_PROJECT_TASKS',
                    message: `Successfully set task to your Project calendar.`
                })
                props.onClose()
            }).catch(error => {
                if (error.response) setError(error.response.data)
            })

        dispatch({ type: 'CREATE_CALENDAR_TASK', data: newData })
    };

    return (
        loading['personal_calendar_form_data'] === false ?
            <React.Fragment>
                <DynamicForm className="form"
                    model={[
                        { key: "priority", label: "Priority", type: "select", options: ['low', 'medium', 'urgent'] },
                        { key: "start", label: "Start Date", type: 'datetime' },
                        { key: "end", label: "End Date", type: 'datetime' },
                        { key: "title", label: "Title" },
                        { key: "content", label: "Content", type: "text_autocomplete", autocomplete: form },
                    ]}
                    addon={[]}
                    response={error}
                    onSubmit={(data) => { onSubmit(data) }}
                />
            </React.Fragment>
            :
            <Spin></Spin>
    )
}