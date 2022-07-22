import React, { useState, Fragment, useEffect } from 'react'
import { Layout, Menu, Avatar, Space, Typography, Drawer, Badge, Button, Dropdown, Alert } from 'antd';
import Icon from '@ant-design/icons';
import {
    UserOutlined,
    CarOutlined,
    UploadOutlined,
    HomeOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    TableOutlined,
    ApartmentOutlined,
    SettingOutlined,
    ProjectOutlined,
    GithubOutlined,
    CoffeeOutlined,
} from '@ant-design/icons';
import "./../../App.css"
import { Link } from 'react-router-dom';
import NotificationMenu from "../../components/Application/NotificationMenu";
import { useDispatch, useSelector } from 'react-redux'
import QuickNavigation from '../../components/Application/QuickNavigation';
import Breadcrumbs from '../../components/Application/Breadcrumbs';
import { useHistory } from 'react-router-dom';

const { Header, Sider } = Layout;
const { Text } = Typography;
const { SubMenu } = Menu;
const baseURL = process.env.REACT_APP_BACK_URL

export default function LayoutHeader(props) {

    const mediaquery = useSelector(state => state.mediaquery.size);
    const auth = useSelector(state => state.auth);
    const profile_picture = useSelector(state => state.auth.profile_picture);
    const workflow_counter = useSelector(state => state.notifications.workflow_counter);
    const project = useSelector(state => state.layout.project);
    const customer = useSelector(state => state.layout.customer);
    const vendor = useSelector(state => state.layout.vendor);
    let desktop = mediaquery === 'sm' || mediaquery === 'md' || mediaquery === 'lg';
    const [collapsed, setCollapsed] = useState(true);
    const [visible, setVisible] = useState(false);
    const [toolbox, setToolbox] = useState(false);
    const dispatch = useDispatch()
    const history = useHistory()

    const toggle = () => {
        desktop ? setCollapsed(!collapsed) : setVisible(!visible)
    }

    const menu = () => {
        let theme = desktop ? "dark" : "light"
        return (
            <Menu theme={theme} mode="inline" defaultSelectedKeys={['1']}>
                <Menu.Item key="1">
                    <HomeOutlined />
                    <span>Home</span>
                    <Link to='/' />
                </Menu.Item>

                <Menu.Item key="2">
                    {
                        collapsed ?
                            <Badge dot={workflow_counter.customer_counter !== 0} offset={collapsed ? [14.5, 25] : []}>
                                <Icon component={() => (<img src="/customer.svg" style={{ margin: -3.3 }} />)} />
                                <span>Customers</span>
                            </Badge>
                            :
                            <Fragment>
                                <Icon component={() => (<img src="/customer.svg" style={{ margin: -3.3 }} />)} />
                                <span>Customers</span>
                                <Badge offset={[5, -5]} count={workflow_counter.customer_counter} />
                            </Fragment>
                    }
                    <Link to='/customer/all' style={{ textDecoration: 'none' }} />
                </Menu.Item>

                <Menu.Item key="3">
                    {
                        collapsed ?
                            <Badge dot={workflow_counter.vendor_counter !== 0} offset={collapsed ? [14.5, 22] : []}>
                                <Icon component={() => (<img src="/vendor.svg" style={{ margin: -3.3, marginTop: -10 }} />)} />
                                <span>Vendors</span>
                            </Badge>
                            :
                            <Fragment>
                                <Icon component={() => (<img src="/vendor.svg" style={{ margin: -3.3, marginTop: -10 }} />)} />
                                <span>Vendors</span>
                                <Badge offset={[5, -5]} count={workflow_counter.vendor_counter} />
                            </Fragment>
                    }
                    <Link to='/vendor/all' style={{ textDecoration: 'none' }} />
                </Menu.Item>


                <Menu.Item key="4" >
                    {
                        collapsed ?
                            <Badge dot={workflow_counter.project_counter !== 0} offset={collapsed ? [16, 20] : []}>
                                <ProjectOutlined />
                                <span>
                                    Sales Projects
                            </span>
                            </Badge>
                            :
                            <Fragment>
                                <ProjectOutlined />
                                <span>
                                    Sales Projects
                            </span>
                                <Badge offset={[5, -5]} count={workflow_counter.project_counter} />
                            </Fragment>
                    }
                    <Link to='/project/all' style={{ textDecoration: 'none' }} />
                </Menu.Item>

                <Menu.Item key="5">
                    <div>
                        {
                            collapsed ?
                                <Badge dot={workflow_counter.ticket_counter !== 0} offset={collapsed ? [8.5, 20] : []}>
                                    <Icon component={() => (<img src="/ticket.svg" style={{ margin: 0 }} />)} />
                                    <span>Ticket</span>
                                </Badge>
                                :
                                <Fragment>
                                    <Icon component={() => (<img src="/ticket.svg" style={{ margin: 0 }} />)} />
                                    <span>Ticket</span>
                                    <Badge offset={[5, -5]} count={workflow_counter.ticket_counter} />
                                </Fragment>
                        }
                    </div>
                    <Link to='/ticket/all' style={{ textDecoration: 'none' }} />
                </Menu.Item>

                <Menu.Item key="6">
                    <TableOutlined />
                    <span>Items</span>
                    <Link to='/item/all' style={{ textDecoration: 'none' }} />
                </Menu.Item>

                <Menu.Item key="7">
                    <CoffeeOutlined />
                    <span>Budget Block</span>
                    <Link to='/block/all' style={{ textDecoration: 'none' }} />
                </Menu.Item>

                <Menu.Item key="8">
                    <div>
                        {
                            collapsed ?
                                <Badge dot={workflow_counter.quotation_counter !== 0} offset={collapsed ? [16, 20] : []}>
                                    <CarOutlined />
                                    <span>Quotations</span>
                                </Badge>
                                :
                                <Fragment>
                                    <CarOutlined />
                                    <span>Quotations</span>
                                    <Badge offset={[5, -5]} count={workflow_counter.quotation_counter} />
                                </Fragment>
                        }
                    </div>
                    <Link to='/quotation/all' style={{ textDecoration: 'none' }} />
                </Menu.Item>

                {desktop && <SubMenu key="sub1" title={<span><ApartmentOutlined /><span>Workflow Panel</span></span>}>

                    <Menu.Item key="9">
                        <span>Workflow settings</span>
                        <Link to='/workflows' style={{ textDecoration: 'none' }} />
                    </Menu.Item>

                    <Menu.Item key="10">
                        <span>Automation settings</span>
                        <Link to='/workflow/automations' style={{ textDecoration: 'none' }} />
                    </Menu.Item>

                    <Menu.Item key="11">
                        <span>State Settings</span>
                        <Link to='/workflow/states' style={{ textDecoration: 'none' }} />
                    </Menu.Item>

                </SubMenu>
                }
                <SubMenu key="sub2" title={<span><UploadOutlined /><span>Email</span></span>}>
                    <Menu.Item key="12" onClick={() => dispatch({ type: 'SET_EMAILVIEW', emailview: 'CONVERSATION_VIEW' })}>
                        <span>Conversations</span>
                        <Link to='/email' style={{ textDecoration: 'none' }} />
                    </Menu.Item>
                    <Menu.Item key="13" onClick={() => dispatch({ type: 'SET_EMAILVIEW', emailview: 'SHOW_MESSAGES_LIST' })}>
                        <span>Inbox</span>
                        <Link to='/email' style={{ textDecoration: 'none' }} />
                    </Menu.Item>
                    <Menu.Item key="14" onClick={() => dispatch({ type: 'SET_EMAILVIEW', emailview: 'SENT_VIEW' })}>
                        <span>Sent Mails</span>
                        <Link to='/email' style={{ textDecoration: 'none' }} />
                    </Menu.Item>
                    <Menu.Item key="15" onClick={() => dispatch({ type: 'SET_EMAILVIEW', emailview: 'COMPOSE_MESSAGE' })}>
                        <span>Compose</span>
                        <Link to='/email' style={{ textDecoration: 'none' }} />
                    </Menu.Item>
                </SubMenu>
                <Menu.Item key="16">
                    <GithubOutlined />
                    <span>Profile</span>
                    <Link to={`/profile/${auth.userprofile}`} style={{ textDecoration: 'none' }} />
                </Menu.Item>
                <SubMenu key="sub3" title={<span><SettingOutlined /><span>Settings</span></span>}>
                    <Menu.Item key="17">
                        <Link to='/adminsettings' style={{ textDecoration: 'none' }} />
                        <span>Admin Settings</span>
                    </Menu.Item>
                    <Menu.Item key="18">
                        <Link to='/signup' style={{ textDecoration: 'none' }} />
                        <span>Create User</span>
                    </Menu.Item>
                    <Menu.Item key="19" onClick={() => dispatch({ type: 'LOGOUT' })}>
                        <span>Logout</span>
                    </Menu.Item>
                </SubMenu>
            </Menu>
        )
    }

    const layoutMenu = (type) => (
        <Menu>
            <Menu.Item>
                <Button type='text' size='small' onClick={() => setToolbox(true)}>View Toolbox</Button>
            </Menu.Item>
            <Menu.Item>
                <Button type='text' size='small' onClick={() => dispatch({ type: 'SAVE_LAYOUT', page: type })}>Save Layout</Button>
            </Menu.Item>
            <Menu.Item>
                <Button type='text' size='small' onClick={() => dispatch({ type: 'EXIT_LAYOUT', page: type })}>Exit without Saving</Button>
            </Menu.Item>
        </Menu>
    )

    return (
        <Layout className="layout" id='crm-layout'>
            {desktop ?
                <Sider trigger={null} collapsible collapsed={collapsed} collapsedWidth={80} id='crm-sider-layout'>
                    {menu()}
                </Sider>
                :
                <Drawer
                    title="Nobo CRM"
                    placement='left'
                    closable={false}
                    onClose={() => setVisible(false)}
                    visible={visible}
                >
                    {menu()}
                </Drawer>
            }
            <Layout className="site-layout" id='crm-header-layout'>
                <Header id='crm-header'>
                    {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                        {
                            className: 'trigger',
                            onClick: toggle,
                            style: {
                                padding: '1%',
                                fontSize: '18px'
                            }
                        })}
                    <div className='crm-header-items'>
                        <Space>
                            {localStorage.getItem('client')}
                            <Badge status={auth.active ? 'success' : 'default'} text={auth.username} />
                            {profile_picture.profile_picture ?
                                <Avatar src={profile_picture.profile_picture[0] === '/' ? baseURL + profile_picture.profile_picture : profile_picture.profile_picture} />
                                : <Avatar icon={<UserOutlined />} />}
                            <NotificationMenu />
                        </Space>
                    </div>
                </Header>
                <div
                    className={project.visible || customer.visible || vendor.visible ? "site-layout-background content-layout-change" : "site-layout-background"} id="crm-content"
                >
                    <div className={project.visible || customer.visible || vendor.visible ? "content-layout-top" : null} id='crm-top'>
                        {desktop ? <React.Fragment>
                            {history.location.pathname.includes('project/detail') ?
                                project.visible ?
                                    <React.Fragment>
                                        <span id='crm-layout-disclaimer'>Disclaimer: You are in 'Change Layout' Mode</span>
                                        <Dropdown overlay={layoutMenu('project')}>
                                            <Button size='small' type="default" id='crm-change-layout'>Layout Options</Button>
                                        </Dropdown>
                                    </React.Fragment>
                                    :
                                    <React.Fragment>
                                        <Breadcrumbs />
                                        <Button size='small' id='crm-change-layout' type='primary' onClick={() => dispatch({ type: 'CHANGE_LAYOUT', page: 'project', visible: true })}>Change Layout</Button>
                                    </React.Fragment>
                                : history.location.pathname.includes('customer/detail') ?
                                    customer.visible ?
                                        <React.Fragment>
                                            <span id='crm-layout-disclaimer'>Disclaimer: You are in 'Change Layout' Mode</span>
                                            <Dropdown overlay={layoutMenu('customer')}>
                                                <Button size='small' type="default" id='crm-change-layout'>Layout Options</Button>
                                            </Dropdown>
                                        </React.Fragment>
                                        :
                                        <React.Fragment>
                                            <Breadcrumbs />
                                            <Button size='small' id='crm-change-layout' type='primary' onClick={() => dispatch({ type: 'CHANGE_LAYOUT', page: 'customer', visible: true })}>Change Layout</Button>
                                        </React.Fragment>
                                    : history.location.pathname.includes('vendor/detail') ?
                                        vendor.visible ?
                                            <React.Fragment>
                                                <span id='crm-layout-disclaimer'>Disclaimer: You are in 'Change Layout' Mode</span>
                                                <Dropdown overlay={layoutMenu('vendor')}>
                                                    <Button size='small' type="default" id='crm-change-layout'>Layout Options</Button>
                                                </Dropdown>
                                            </React.Fragment>
                                            :
                                            <React.Fragment>
                                                <Breadcrumbs />
                                                <Button size='small' id='crm-change-layout' type='primary' onClick={() => dispatch({ type: 'CHANGE_LAYOUT', page: 'vendor', visible: true })}>Change Layout</Button>
                                            </React.Fragment>
                                        :
                                        <Breadcrumbs />}
                        </React.Fragment> : null}
                    </div>
                    {props.children}
                    <Drawer
                        title="Toolbox"
                        placement="right"
                        onClose={() => setToolbox(false)}
                        visible={toolbox}
                    >
                        {project.visible ? project.pre_toolbox[project.breakpoint].map(tool =>
                            (<Button size='small' key='project-toolbox' onClick={() => dispatch({ type: "ITEM_ONCHANGE", item: tool, page: 'project', action: 'add' })}>{tool.i}</Button>
                            ))
                            : customer.visible ? customer.pre_toolbox[customer.breakpoint].map(tool =>
                                (<Button size='small' key='cusotmer-toolbox' onClick={() => dispatch({ type: "ITEM_ONCHANGE", item: tool, page: 'customer', action: 'add' })}>{tool.i}</Button>
                                )) : null
                        }
                    </Drawer>
                </div>
            </Layout>
        </Layout>
    )
}






