import React, { useState } from 'react'
import { PageHeader, Tag, Button, Tooltip, Popover } from 'antd';
import OpportunityDrawer from './Forms/OpportunityDrawer';
import { useSelector, useDispatch } from 'react-redux'
import { CarOutlined, SmileOutlined, FireOutlined, HomeOutlined, CloseOutlined, MoreOutlined } from '@ant-design/icons';
import { useLocation } from "react-router-dom";
import UserManagement from '../../containers/Opportunities/UserManagement';
import TransferProject from '../../containers/Opportunities/TransferProject';

const ProjectCard = React.memo(({ project }) => {

    let location = useLocation()

    const mediaquery = useSelector(state => state.mediaquery.size);
    let desktop = mediaquery === 'md' || mediaquery === 'lg' || mediaquery === 'sm';

    const loadingComponent = useSelector(state => state.loading.loadingComponent);
    const project_layout = useSelector(state => state.layout.project.visible);
    const breakpoint = useSelector(state => state.layout.project.breakpoint);
    const card_layout = useSelector(state => state.layout.project.pre_layout[breakpoint]).find(item => item.i === 'card');

    const dispatch = useDispatch()

    const more = (content, index, color) => {
        let output = [];
        for (let i = index; i < content.length; i++) {
            output.push(<Tag color={color} className='flex-popover-tag-child'>{content[i].user.username}</Tag>)
        }
        return <div className='flex-popover-tag-parent'>{output}</div>
    }

    const tagItems = (change, index, entire, title, color) => {
        return (
            index === 2 ?
                <Popover content={more(entire, index, color)} title={title}>
                    <Button className='align-right' size='small' style={{ alignSelf: 'center', marginRight: '5px' }}>More</Button>
                </Popover>
                :
                index > 2 ?
                    null
                    :
                    <Tooltip title={change}>
                        <Tag color={color} key={index} className='project-m2m-items'>{change}</Tag>
                    </Tooltip>
        )
    }


    return (
        <React.Fragment>
            <PageHeader ghost={false} onBack={desktop ? () => null : null} title={project.sales_project_name}
                extra={
                    project_layout ?
                        [<Button size='small' key='layout-button' type='text' onClick={() => dispatch({ type: "ITEM_ONCHANGE", item: card_layout, page: 'project', action: 'remove' })}><CloseOutlined /></Button>]
                        :
                        project.permissions['sales.change_salesproject']
                            && project.is_at_last_stage.last_stage === false ?
                            [<OpportunityDrawer button_name='Update Project'
                                key='project-update'
                                data={project}
                                title='Update Project'
                                component='SalesProjectUpdate'
                                button_type='update'
                                button_style='default' />] :
                            null
                }>
                <div className='project-detail-grid'>
                    <div className='details-project-id'><FireOutlined />Project ID: {project.sales_project_id}</div>
                    <div className='details-customer'>
                        <span className='details-customer-title'>
                            <CarOutlined />Customer:
                        </span>
                        <Tooltip title={project.customerInformation.customer_name}>
                            <Tag color='red' key={project.customerInformation.customer_id} className='details-customer-item'>{project.customerInformation.customer_name}</Tag>
                        </Tooltip>
                        {
                            project.permissions['sales.can_change_project_customer']
                                && project.quotations.length === 0
                                && project.requirements.length === 0
                                && project.is_at_last_stage.last_stage === false ?
                                <OpportunityDrawer button_name='Change Customer'
                                    data={project}
                                    title='Change Customer'
                                    component='CustomerChange'
                                    button_type='update_only'
                                    button_style='default' /> : null
                        }
                    </div>
                    <div className='details-department'><HomeOutlined />Department: {project.sales_department.department_name}<TransferProject /></div>
                    <div className='details-user'>
                        <span className='details-user-title'>
                            <SmileOutlined />Sales Team:
                        </span>
                        {project.userProfile.map((u, index) => {
                            return tagItems(u.user.username, index, project.userProfile, 'Sales Team', 'blue')
                        })}
                        {project.permissions['sales.can_change_project_user']
                            && project.is_at_last_stage.last_stage === false ?
                            <UserManagement /> : null}
                    </div>
                </div>
            </PageHeader>
        </React.Fragment>
    )
}
)

export default ProjectCard

/*

        desktop ?
            <Card
                title=
                {
                    <div className='project-card'>
                        <Text className='project-title'>
                            {project.sales_project_name}
                        </Text>
                        <span className='project-button'>
                            <ProjectUpdateDrawer id={project.sales_project_id} />
                            <ProjectHistory history={project.history} m2m={project.m2m} />
                        </span>
                    </div>
                }>
                <p>Estimated Revenue</p>
                <h6>{project.sales_project_est_rev_currency} {project.sales_project_est_rev}</h6>
                <hr />
                <p>Status</p>
                <h6>{project.project_status.label}</h6>
                <hr />
                <p>Customer</p>
                <div className="display: inline-block">
                    {project.customer_information.map(c => (<h6 key={c.customer_id}>{c.customer_name}</h6>))}
                </div>
                <hr />
                <p>Sales Department</p>
                <h6>{project.sales_department.department_name}</h6>
                <hr />
                <p>Sales Team</p>
                <div className="display: inline-block">
                    {project.userProfile.map(p => (<h6 key={p.user.id}>{p.user.username}</h6>))}
                </div>
            </Card>
            :

            */


/*<React.Fragment>
<SwipeableViews enableMouseEvents index={index} onChangeIndex={(value) => setIndex(value)}>
<Card className='project-name'>
<h6 className='project-card-title'>{project.sales_project_name}</h6>
<small className='project-card-subtitle'>Project Name</small>
</Card>
<Card className='project-est-rev'>
<h6 className='project-card-title'>{project.sales_project_est_rev_currency} {project.sales_project_est_rev}</h6>
<small className='project-card-subtitle'>Estimated Revenue</small>
</Card>
<Card className='project-customer'>
<span>{project.customer_information.map((c, index) => {
    let last = project.customer_information.length - 1
    let output = <h6 key={c.customer_id} className='project-card-title'>{c.customer_name}</h6>
    if (last !== index) {
        output += ', '
    }
    return output
})}
</span>
<small className='project-card-subtitle'>Customer</small>
</Card>
<Card className='project-status'>
<h6 className='project-card-title'>{project.project_status.label}</h6>
<small className='project-card-subtitle'>Status</small>
</Card>
</SwipeableViews>
<Pagination simple defaultCurrent={1} total={40} current={index + 1} onChange={(value) => setIndex(value - 1)} style={{ textAlign: 'center' }} />
</React.Fragment>*/