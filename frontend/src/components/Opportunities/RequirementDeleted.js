import React, { useState } from 'react'
import { Button, Modal, List, Avatar, Menu, Drawer, Dropdown, Empty } from 'antd';
import { DeleteOutlined, FileImageOutlined, MailOutlined, IdcardOutlined, MoreOutlined } from '@ant-design/icons';
import OpportunityDrawer from './Forms/OpportunityDrawer';
import RequirementHistory from '../../components/Opportunities/RequirementHistory';
import { useDispatch, useSelector } from 'react-redux'

export default function RequirementDeleted({ requirements }) {

    const dateFormat = require('dateformat');

    const [visible, setVisible] = useState(false);
    const mediaquery = useSelector(state => state.mediaquery.size);
    const project = useSelector(state => state.api.project);

    const actions = (requirement) => (
        <Menu>
            {project.permissions['sales.recover_customerrequirement'] && project.is_at_last_stage.last_stage === false ?
                <Menu.Item>
                    <OpportunityDrawer data={requirement.customer_requirement_id}
                        button_name='Recover Requirement'
                        title='Recover Requirement'
                        component='RequirementRecover'
                        button_type='recover' />
                </Menu.Item>
                :
                null}
            {requirement.file ?
                <Menu.Item>
                    <Button type="text" shape="circle" size="small"><a href={requirement.file}><FileImageOutlined /></a></Button> File
                </Menu.Item>
                : null}
            <Menu.Item><RequirementHistory history={requirement.history} /></Menu.Item>
        </Menu>
    )

    return (
        <React.Fragment>
            <Button onClick={() => setVisible(true)} type="text" size='small'>
                <DeleteOutlined /> Recently Deleted
            </Button>
            <Drawer
                title="Recently Deleted"
                width={mediaquery === 'xs' ? '100%' : 720}
                visible={visible}
                onClose={() => setVisible(false)}
            >
                {requirements.length ?
                    <List
                        size="large"
                        dataSource={requirements}
                        renderItem={item => (
                            <List.Item>
                                <div className='requirement-grid'>
                                    <p className='requirement-title'><MailOutlined />{item.requirements}</p>
                                    <p className='requirement-description'><IdcardOutlined /> ID: {item.customer_requirement_id}</p>
                                    <p><DeleteOutlined /> Date Deleted: {dateFormat(item.date_deleted, "mmmm dS, yyyy")}</p>
                                    <Dropdown placement="bottomRight" overlay={() => actions(item)}>
                                        <Button size='small' shape='circle' className='requirement-button'><MoreOutlined /></Button>
                                    </Dropdown>
                                </div>

                            </List.Item>)}
                    />
                    : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            </Drawer>
        </React.Fragment>
    )
}
