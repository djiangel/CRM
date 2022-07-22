import React, { useState } from 'react'
import { Drawer, Button } from 'antd';
import { useSelector } from 'react-redux'
import ItemCreate from './ItemCreate';
import ItemUpdate from './ItemUpdate';
import CompetitorItemCreate from './CompetitorItemCreate';
import CompetitorItemUpdate from './CompetitorItemUpdate';
import ItemDelete from './ItemDelete';
import ItemRecover from './ItemRecover';
import CompetitorItemDelete from './CompetitorItemDelete';
import CompetitorItemRecover from './CompetitorItemRecover';
import { PlusOutlined, EditOutlined, DeleteOutlined, HeartOutlined } from '@ant-design/icons';

export default function ItemDrawer({ button_name, title, component, data, inlineCreate, button_type, button_style, ghost, button_shape }) {
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
                    component === 'ItemCreate' && visible ?
                        <ItemCreate onClose={() => setVisible(false)} inlineCreate={inlineCreate ? inlineCreate : null} />
                        :
                        component === 'ItemUpdate' && visible ?
                            <ItemUpdate item={data} onClose={() => setVisible(false)} />
                            :
                            component === 'CompetitorItemCreate' && visible ?
                                <CompetitorItemCreate id={data} onClose={() => setVisible(false)} />
                                :
                                component === 'CompetitorItemUpdate' && visible ?
                                    <CompetitorItemUpdate competitor={data} onClose={() => setVisible(false)} />
                                    :
                                    component === 'ItemDelete' && visible ?
                                        <ItemDelete id={data} onClose={() => setVisible(false)} />
                                        :
                                        component === 'ItemRecover' && visible ?
                                            <ItemRecover id={data} onClose={() => setVisible(false)} />
                                            :
                                            component === 'CompetitorItemDelete' && visible ?
                                                <CompetitorItemDelete id={data} onClose={() => setVisible(false)} />
                                                :
                                                component === 'CompetitorItemRecover' && visible ?
                                                    <CompetitorItemRecover id={data} onClose={() => setVisible(false)} />
                                                    :
                                                    null
                }
            </Drawer>
        </React.Fragment>
    )
}
