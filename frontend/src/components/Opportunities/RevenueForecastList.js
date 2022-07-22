import React, { useState, useEffect } from 'react'
import OpportunityDrawer from './Forms/OpportunityDrawer';
import { Button, Empty, List, Drawer, Menu, Dropdown, Skeleton } from 'antd';
import { ThunderboltOutlined, MoreOutlined, MailOutlined, IdcardOutlined, TrophyOutlined, CarOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux'

export default function RevenueForecastList({ forecasts }) {

    const [visible, setVisible] = useState(false);
    const mediaquery = useSelector(state => state.mediaquery.size);
    const loadingComponent = useSelector(state => state.loading.loadingComponent);
    let desktop = mediaquery === 'md' || mediaquery === 'lg';
    const project = useSelector(state => state.api.project);

    const actions = (forecast) => (
        <Menu>
            {project.permissions['sales.change_revenueforecast'] && project.is_at_last_stage.last_stage === false ?
                <Menu.Item>
                    <OpportunityDrawer data={forecast}
                        button_name='Update Forecast'
                        title='Update Forecast'
                        component='ForecastUpdate'
                        button_type='update' />
                </Menu.Item>
                :
                null
            }
            {project.permissions['sales.delete_revenueforecast'] && project.is_at_last_stage.last_stage === false ?
                <Menu.Item>
                    <OpportunityDrawer data={forecast.forecast_id}
                        button_name='Delete Forecast'
                        title='Delete Forecast'
                        component='ForecastDelete'
                        button_type='delete' />
                </Menu.Item>
                :
                null
            }
        </Menu>
    )

    return (
        <div className='revenue-forecast-grid'>
            <Button type='text' size='small' onClick={() => setVisible(true)}>
                View Revenue Forecasts
            </Button>
            <Drawer
                title='Revenue Forecast List'
                width={desktop ? 720 : '100%'}
                onClose={() => setVisible(false)}
                visible={visible}
                bodyStyle={{ paddingBottom: 80 }}
            >
                <List
                    size="large"
                    dataSource={forecasts}
                    renderItem={item => (
                        <Skeleton loading={loadingComponent === 'forecast'} active avatar>
                            <List.Item>
                                <div className='forecast-view-grid'>
                                    <p className='forecast-forecast'><MailOutlined />Quantity: {item.quantity}</p>
                                    <p className='forecast-period'><IdcardOutlined />Month: {item.month}</p>
                                    <p className='forecast-buy-price'><CarOutlined />Buy Price: {item.buy_price}</p>
                                    <p className='forecast-sell-price'><ThunderboltOutlined />Sell Price: {item.sell_price}</p>
                                    <p className='forecast-block'><TrophyOutlined />Budget Block: {item.block}</p>
                                    <Dropdown placement="bottomRight" overlay={() => actions(item)}>
                                        <Button size='small' shape='circle' className='forecast-button'><MoreOutlined /></Button>
                                    </Dropdown>
                                </div>
                            </List.Item>
                        </Skeleton>)}
                />
            </Drawer>
        </div>
    )
}
