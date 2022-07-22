import React, { useState } from 'react'
import { Button, Empty, List, Spin, Menu, Dropdown, Skeleton } from 'antd';
import OpportunityDrawer from './Forms/OpportunityDrawer';
import { FileImageOutlined, MoreOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux'
import 'react-vertical-timeline-component/style.min.css';
import RequirementHistory from './RequirementHistory';
import CalendarDrawer from '../../components/Calendar/Form/CalendarDrawer'
import MoonLoader from "react-spinners/MoonLoader";

const _ = require("lodash");

function RequirementTimeline({ requirements }) {

    const project = useSelector(state => state.api.project.is_at_last_stage.last_stage);
    const permissions = useSelector(state => state.api.project.permissions);

    const actions = (requirement) => (
        <Menu>
            {permissions['sales.change_customerrequirement'] && project === false ?
                <Menu.Item>
                    <OpportunityDrawer data={requirement}
                        button_name='Edit Requirement'
                        title='Edit Requirement'
                        component='RequirementUpdate'
                        button_type='update' />
                </Menu.Item>
                : null}
            {permissions['sales.delete_customerrequirement'] && project === false ?
                <Menu.Item>
                    <OpportunityDrawer data={requirement.customer_requirement_id}
                        button_name='Delete Requirement'
                        title='Delete Requirement'
                        component='RequirementDelete'
                        button_type='delete' />
                </Menu.Item>
                : null}
            {requirement.file ?
                <Menu.Item>
                    <Button type="text" shape="circle" size="small"><a href={requirement.file}><FileImageOutlined /></a></Button> File
                </Menu.Item>
                : null}
            <Menu.Item><RequirementHistory history={requirement.history} /></Menu.Item>
            {permissions['sales.add_tasks'] && project === false ?
                <Menu.Item>
                    <CalendarDrawer
                        button_name='Create Reminder'
                        title='When Shall we remind you?'
                        component='CreateReminder'
                        task_title={`Reminder [Requirements ID: ${requirement.customer_requirement_id}]`}
                        content={`Please remember to follow up on Requirement [${requirement.customer_requirement_id}]`}
                    />
                </Menu.Item>
                : null
            }
        </Menu>
    )

    return (
        requirements.length ?
            <List
                size="large"
                dataSource={requirements}
                renderItem={item => (
                    <List.Item>
                        <div className='requirement-grid'>
                            <p className='requirement-title'><MailOutlined />{item.requirements}</p>
                            <p className='requirement-description'><IdcardOutlined /> ID: {item.customer_requirement_id}</p>
                            <Dropdown placement="bottomRight" overlay={() => actions(item)}>
                                <Button size='small' shape='circle' className='requirement-button'><MoreOutlined /></Button>
                            </Dropdown>
                        </div>
                    </List.Item>
                )}
            />
            : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    )
}

export default React.memo(RequirementTimeline,
    (prevProps, nextProps) => {
        return _.isEqual(prevProps, nextProps);
    })

/*

                {desktop ?
                    <VerticalTimeline layout='1-column' animate={false} >
                        {requirements.map(requirement => (
                            <React.Fragment key={requirement.customer_requirement_id + 'fragment'}>
                                <VerticalTimelineElement
                                    className="vertical-timeline-element--work"
                                    contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
                                    contentArrowStyle={{ borderRight: '7px solid rgb(33, 150, 243)' }}
                                    iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
                                    key={requirement.customer_requirement_id}
                                >
                                    <p key={requirement.customer_requirement_id + 'id'}>{`Requirement ID: ${requirement.customer_requirement_id}`}
                                        <span style={{ float: 'right' }} key={requirement.customer_requirement_id + 'actions'}>
                                            <RequirementDelete data={requirement} />
                                            {requirement.file ? <Button ghost size='small' shape="circle"><a href={requirement.file}><FileImageOutlined /></a></Button>
                                                : <Button shape="circle" size="small" disabled><FileImageOutlined /></Button>}
                                            <RequirementUpdateDrawer id={requirement.customer_requirement_id} />
                                            <RequirementHistory history={requirement.history} type="ghost" />
                                        </span>
                                    </p>
                                    <hr />
                                    <p key={requirement.customer_requirement_id + 'requirement'}>{requirement.requirements}</p>
                                </VerticalTimelineElement>
                            </React.Fragment>
                        ))
                        }
                    </VerticalTimeline >
                    :

                    */