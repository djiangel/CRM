import React from 'react'
import { Button , Menu, Dropdown , Space } from 'antd';
import OpportunityDrawer from './../../components/Opportunities/Forms/OpportunityDrawer'
import { MoreOutlined } from '@ant-design/icons';

export default function CustomerManagement({ requirements }) {

    const actions = () => (
        <Menu>
            <Menu.Item>     <OpportunityDrawer 
                            button_name='Add Customers'
                            title='Customer Management (Addition)'
                            component='CustomerAdd'/>
            </Menu.Item>
            <Menu.Item>           <OpportunityDrawer 
                                        button_name='Remove Customers'
                                        title='Customer Management (Removal)'
                                        component='CustomerRemove'/></Menu.Item>
        </Menu>
    )

    return (
        
            <Dropdown placement="bottomRight" overlay={() => actions()}>
                <Button size='small' shape='circle' className='requirement-button'><MoreOutlined /></Button>
            </Dropdown>
    )
}

