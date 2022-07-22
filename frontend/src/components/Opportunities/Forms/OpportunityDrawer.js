import React, { useState, useEffect } from 'react'
import { Drawer, Button, Skeleton } from 'antd';
import QuotationUpdateDrawer from './QuotationUpdateDrawer';
import { useSelector } from 'react-redux'
import RequirementCreateDrawer from './RequirementCreateDrawer';
import RequirementUpdateDrawer from './RequirementUpdateDrawer';
import QuotationCreateDrawer from './QuotationCreateDrawer';
import NotationCreateDrawer from './NotationCreateDrawer';
import SalesProjectCreate from './SalesProjectCreate';
import SalesProjectUpdateDrawer from './SalesProjectUpdateDrawer';
import SalesPorjectUserAddForm from './SalesProjectUserAddForm';
import SalesProjectUserRemoveForm from './SalesProjectUserRemoveForm';
import BudgetBlockCreateDrawer from './BudgetBlockCreateDrawer';
import BudgetBlockUpdateDrawer from './BudgetBlockUpdateDrawer';
import BudgetBlockDeleteDrawer from './BudgetBlockDeleteDrawer';
import QuotationAssign from './QuotationAssign';
import QuotationUnassign from './QuotationUnassign';
import QuotationDelete from './QuotationDelete';
import RequirementDelete from './RequirementDelete';
import NotationDelete from './NotationDelete';
import RequirementRecover from './RequirementRecover';
import QuotationRecover from './QuotationRecover';
import QuotationItemCreate from './QuotationItemCreate';
import QuotationItemUpdate from './QuotationItemUpdate';
import ForecastCreate from './ForecastCreate';
import ForecastUpdate from './ForecastUpdate';
import ForecastDelete from './ForecastDelete';
import TransferProject from '../../../containers/Opportunities/TransferProject';
import SalesProjectCustomerChangeForm from './SalesProjectCustomerChangeForm';
import { PlusOutlined, EditOutlined, DeleteOutlined, HeartOutlined } from '@ant-design/icons';
import MoonLoader from "react-spinners/MoonLoader";

export default function OpportunityDrawer({ button_name, title, component, data, button_type, button_style, button_shape }) {
    const [visible, setVisible] = useState(false);
    const mediaquery = useSelector(state => state.mediaquery.size);
    const layout = useSelector(state => state.layout.project.visible);
    let desktop = mediaquery === 'md' || mediaquery === 'lg';
    const loadingComponent = useSelector(state => state.loading.loadingComponent);

    return (
        <React.Fragment>
            <Button type={button_style ? button_style : 'text'} size='small' button_shape={button_shape} onClick={() => setVisible(true)} disabled={layout}>
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
                    <Skeleton loading={loadingComponent !== null}>
                        {component === 'NotationCreate' && visible ?
                            <NotationCreateDrawer id={data} onClose={() => setVisible(false)} />
                            :
                            component === 'QuotationCreate' && visible ?
                                <QuotationCreateDrawer id={data} onClose={() => setVisible(false)} />
                                :
                                component === 'QuotationUpdate' && visible ?
                                    <QuotationUpdateDrawer quotation={data} onClose={() => setVisible(false)} />
                                    :
                                    component === 'RequirementCreate' && visible ?
                                        <RequirementCreateDrawer onClose={() => setVisible(false)} />
                                        :
                                        component === 'RequirementUpdate' && visible ?
                                            <RequirementUpdateDrawer requirement={data} onClose={() => setVisible(false)} />
                                            :
                                            component === 'SalesProjectCreate' && visible ?
                                                <SalesProjectCreate onClose={() => setVisible(false)} />
                                                :
                                                component === 'SalesProjectUpdate' && visible ?
                                                    <SalesProjectUpdateDrawer project={data} onClose={() => setVisible(false)} />
                                                    :
                                                    component === 'CustomerChange' && visible ?
                                                        <SalesProjectCustomerChangeForm onClose={() => setVisible(false)} />
                                                        :
                                                        component === 'UserAdd' && visible ?
                                                            <SalesPorjectUserAddForm onClose={() => setVisible(false)} />
                                                            :
                                                            component === 'UserRemove' && visible ?
                                                                <SalesProjectUserRemoveForm quotation={data} onClose={() => setVisible(false)} />
                                                                :
                                                                component === 'TransferProject' && visible ?
                                                                    <TransferProject quotation={data} onClose={() => setVisible(false)} />
                                                                    :
                                                                    component === 'BudgetBlockCreate' && visible ?
                                                                        <BudgetBlockCreateDrawer onClose={() => setVisible(false)} />
                                                                        :
                                                                        component === 'BudgetBlockUpdate' && visible ?
                                                                            <BudgetBlockUpdateDrawer budget_block={data} onClose={() => setVisible(false)} />
                                                                            :
                                                                            component === 'QuotationAssign' && visible ?
                                                                                <QuotationAssign onClose={() => setVisible(false)} />
                                                                                :
                                                                                component === 'QuotationUnassign' && visible ?
                                                                                    <QuotationUnassign id={data} onClose={() => setVisible(false)} />
                                                                                    :
                                                                                    component === 'BudgetBlockDelete' && visible ?
                                                                                        <BudgetBlockDeleteDrawer id={data} onClose={() => setVisible(false)} />
                                                                                        :
                                                                                        component === 'QuotationDelete' && visible ?
                                                                                            <QuotationDelete id={data} onClose={() => setVisible(false)} />
                                                                                            :
                                                                                            component === 'RequirementDelete' && visible ?
                                                                                                <RequirementDelete id={data} onClose={() => setVisible(false)} />
                                                                                                :
                                                                                                component === 'NotationDelete' && visible ?
                                                                                                    <NotationDelete id={data} onClose={() => setVisible(false)} />
                                                                                                    :
                                                                                                    component === 'RequirementRecover' && visible ?
                                                                                                        <RequirementRecover id={data} onClose={() => setVisible(false)} />
                                                                                                        :
                                                                                                        component === 'QuotationRecover' && visible ?
                                                                                                            <QuotationRecover id={data} onClose={() => setVisible(false)} />
                                                                                                            :
                                                                                                            component === 'QuotationItemCreate' && visible ?
                                                                                                                <QuotationItemCreate quotation={data} onClose={() => setVisible(false)} />
                                                                                                                :
                                                                                                                component === 'QuotationItemUpdate' && visible ?
                                                                                                                    <QuotationItemUpdate data={data} onClose={() => setVisible(false)} />
                                                                                                                    :
                                                                                                                    component === 'ForecastCreate' && visible ?
                                                                                                                        <ForecastCreate onClose={() => setVisible(false)} />
                                                                                                                        :
                                                                                                                        component === 'ForecastUpdate' && visible ?
                                                                                                                            <ForecastUpdate forecast={data} onClose={() => setVisible(false)} />
                                                                                                                            :
                                                                                                                            component === 'ForecastDelete' && visible ?
                                                                                                                                <ForecastDelete id={data} onClose={() => setVisible(false)} />
                                                                                                                                : null}
                    </Skeleton>
                }
            </Drawer>
        </React.Fragment>
    )
}
