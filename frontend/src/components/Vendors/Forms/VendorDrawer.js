import React, { useState } from 'react'
import { Drawer, Button } from 'antd';
import { useSelector } from 'react-redux'
import VendorCreate from './VendorCreate';
import VendorUpdate from './VendorUpdate';
import POCCreate from './POCCreate';
import POCUpdate from './POCUpdate';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function VendorDrawer({ button_name, title, component, data, button_type, button_style, ghost, inlineCreate, button_shape }) {
    const [visible, setVisible] = useState(false);
    const mediaquery = useSelector(state => state.mediaquery.size);
    let desktop = mediaquery === 'md' || mediaquery === 'lg';
    return (
        <React.Fragment>
            <Button type={button_style ? button_style : 'text'} ghost={ghost ? true : false} shape={button_shape} size='small' onClick={() => setVisible(true)}>
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
                    component === 'VendorCreate' && visible ?
                        <VendorCreate redirect={data} onClose={() => setVisible(false)} inlineCreate={inlineCreate ? inlineCreate : null} />
                        :
                        component === 'VendorUpdate' && visible ?
                            <VendorUpdate vendor={data} onClose={() => setVisible(false)} />
                            :
                            component === 'POCCreate' && visible ?
                                <POCCreate id={data} onClose={() => setVisible(false)} />
                                :
                                component === 'POCUpdate' && visible ?
                                    <POCUpdate poc={data} onClose={() => setVisible(false)} />
                                    : null
                }
            </Drawer>
        </React.Fragment>
    )
}
