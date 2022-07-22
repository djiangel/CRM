import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, Menu, Breadcrumb, Avatar, Button, Space, Typography, Drawer, Dropdown, Anchor } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

const { Link } = Anchor;

export default function QuickNavigation(props) {

    const history = useHistory()

    const menu = (
        <Anchor>
            <Link href="#card-col" title="Project Details" />
            <Link href="#analytics-col" title="Analytics/ Calendar/ Workflow" />
            <Link href="#activities-box" title="Activities" />
            <Link href="#requirements-box" title="Requirements" />
            <Link href="#items-box" title="Items" />
            <Link href="#quotations-box" title="Quotations" />
            <Link href="#notations-box" title="Notations" />
        </Anchor>
    );

    return (
        <React.Fragment>
            <Dropdown overlay={menu}>
                <Button type="primary" danger>
                    Quick <DownOutlined />
                </Button>
            </Dropdown>
        </React.Fragment>
    )
}
