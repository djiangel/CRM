import React from 'react'
import { Button, Menu, Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import OpportunityDrawer from '../../components/Opportunities/Forms/OpportunityDrawer';

export default function UserManagement({ requirements }) {

    const actions = () => (
        <Menu>
            <Menu.Item>
                <OpportunityDrawer
                    button_name='Add Users'
                    title='User Management (Addition)'
                    component='UserAdd' /></Menu.Item>
            <Menu.Item>
                <OpportunityDrawer
                    button_name='Remove Users'
                    title='User Management (Removal)'
                    component='UserRemove' /></Menu.Item>
        </Menu>
    )

    return (

        <Dropdown placement="bottomRight" overlay={() => actions()}>
            <Button size='small' shape='circle' className='requirement-button'><MoreOutlined /></Button>
        </Dropdown>
    )
}

