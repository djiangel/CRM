import React, { useState } from 'react'
import { Drawer, Button } from 'antd';
import { useSelector } from 'react-redux'
import CreateReminderForm from './CreateReminderForm'
import CreateTaskForm from './CreateTaskForm';
import { PlusOutlined, EditOutlined, DeleteOutlined, HeartOutlined } from '@ant-design/icons';

export default function CalendarDrawer({ button_name, title, component, content, task_title, data, button_type, button_style, button_shape }) {
    const [visible, setVisible] = useState(false);
    const mediaquery = useSelector(state => state.mediaquery.size);
    let desktop = mediaquery === 'md' || mediaquery === 'lg';

    return (
        <React.Fragment>
            <Button type={button_style ? button_style : 'text'} size='small' button_shape={button_shape} onClick={() => setVisible(true)}>
                {button_type === 'create_only' ? <PlusOutlined /> : button_type === 'update_only' ? <EditOutlined />
                    : button_type === 'delete_only' ? <DeleteOutlined />
                        : button_type === 'create' ?
                            <React.Fragment>
                                <span style={{ marginRight: '5px' }}><PlusOutlined /></span>
                                {button_name}
                            </React.Fragment>
                            : button_type === 'update' ?
                                <React.Fragment>
                                    <span style={{ marginRight: '5px' }}><EditOutlined /></span>
                                    {button_name}
                                </React.Fragment>
                                : button_type === 'delete' ?
                                    <React.Fragment>
                                        <span style={{ marginRight: '5px' }}><DeleteOutlined /></span>
                                        {button_name}
                                    </React.Fragment>
                                    : button_type === 'recover' ?
                                        <React.Fragment>
                                            <span style={{ marginRight: '5px' }}><HeartOutlined /></span>
                                            {button_name}
                                        </React.Fragment>
                                        : button_type !== null ?
                                            <React.Fragment>
                                                <span style={{ marginRight: '5px' }}>{button_type}</span>
                                                {button_name}
                                            </React.Fragment>
                                            : button_name}
            </Button>
            <Drawer
                title={title}
                width={desktop ? 720 : '100%'}
                onClose={() => setVisible(false)}
                visible={visible}
                bodyStyle={{ paddingBottom: 80 }}
            >
                {
                    component === 'CreateReminder' && visible ?
                        <CreateReminderForm content={content} title={task_title} onClose={() => setVisible(false)} />
                        :
                        component === 'CreateTask' && visible ?
                            <CreateTaskForm autoadd={data} onClose={() => setVisible(false)} />
                            :
                            null
                }
            </Drawer>
        </React.Fragment>
    )
}
