import React, { useState } from 'react'
import { Drawer, Button } from 'antd';
import { useSelector } from 'react-redux'
import QuotationCreateCustomer from './QuotationCreateCustomer';
import QuotationCreateProject from './QuotationCreateProject';
import QuotationUpdateCustomer from './QuotationUpdateCustomer';
import QuotationUpdateProject from './QuotationUpdateProject';
import QuotationItemCreate from './QuotationItemCreate';
import QuotationItemUpdate from './QuotationItemUpdate';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function QuotationDrawer({ button_name, title, component, data, type, project_id, button_type, button_style }) {
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
                    component === 'QuotationCustomer' && visible ?
                        <QuotationCreateCustomer onClose={() => setVisible(false)} />
                        :
                        component === 'QuotationProject' && visible ?
                            <QuotationCreateProject onClose={() => setVisible(false)} />
                            :
                            component === 'QuotationUpdateCustomer' && visible ?
                                <QuotationUpdateCustomer quotation={data} onClose={() => setVisible(false)} />
                                :
                                component === 'QuotationUpdateProject' && visible ?
                                    <QuotationUpdateProject quotation={data} onClose={() => setVisible(false)} />
                                    :
                                    component === 'QuotationItemCreate' && visible ?
                                        <QuotationItemCreate type={type} id={data} project_id={project_id} onClose={() => setVisible(false)} />
                                        :
                                        component === 'QuotationItemUpdate' && visible ?
                                            <QuotationItemUpdate type={type} quotation_item={data} project_id={project_id} onClose={() => setVisible(false)} />
                                            : null
                }
            </Drawer>
        </React.Fragment>
    )
}
