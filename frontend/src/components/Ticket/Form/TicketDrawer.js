import React, { useState } from 'react'
import { Drawer, Button } from 'antd';
import { useSelector } from 'react-redux'
import CustomTicketCreate from './CustomTicketCreate';
import TicketAssignExistingCustomer from './TicketAssignExistingCustomer';
import TicketAssignNewCustomer from './TicketAssignNewCustomer';
import TicketAssignExistingProject from './TicketAssignExistingProject';
import TicketAssignNewProject from './TicketAssignNewProject';
import TicketReassignCustomer from './TicketReassignCustomer';
import TicketReassignProject from './TicketReassignProject';
import TicketUpdate from './TicketUpdate';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function TicketDrawer({ button_name, title, component, data, button_type, button_style }) {
    const [visible, setVisible] = useState(false);
    const mediaquery = useSelector(state => state.mediaquery.size);
    let desktop = mediaquery === 'md' || mediaquery === 'lg';
    return (
        <React.Fragment>
            <Button type={button_style ? button_style : 'text'} size='small' onClick={() => setVisible(true)}>
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
                    component === 'CustomTicket' && visible ?
                        <CustomTicketCreate onClose={() => setVisible(false)} />
                        :
                        component === 'UpdateTicket' && visible ?
                            <TicketUpdate onClose={() => setVisible(false)} />
                            :
                            component === 'AssignExistingCustomer' && visible ?
                                <TicketAssignExistingCustomer onClose={() => setVisible(false)} />
                                :
                                component === 'AssignNewCustomer' && visible ?
                                    <TicketAssignNewCustomer onClose={() => setVisible(false)} />
                                    :
                                    component === 'AssignExistingProject' && visible ?
                                        <TicketAssignExistingProject onClose={() => setVisible(false)} />
                                        :
                                        component === 'AssignNewProject' && visible ?
                                            <TicketAssignNewProject onClose={() => setVisible(false)} />
                                            :
                                            component === 'ReassignCustomer' && visible ?
                                                <TicketReassignCustomer onClose={() => setVisible(false)} />
                                                :
                                                component === 'ReassignProject' && visible ?
                                                    <TicketReassignProject onClose={() => setVisible(false)} />
                                                    :
                                                    null
                }
            </Drawer>
        </React.Fragment>
    )
}
