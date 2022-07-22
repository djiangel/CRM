import { HashRouter as Router, Route, Switch, Link, withRouter, useHistory } from 'react-router-dom';
import { Breadcrumb, Alert } from 'antd';
import React from 'react'

/*
function Breadcrumbs(pathname) {

    const routesAll = {

        '/customer/all': [
            { path: null, name: 'Customer List' },
        ],
        '/customer/detail/': [
            { path: "/customer/all", name: 'Customer List' },
            { path: null, name: 'Customer Detail' },
        ],
        '/vendor/all': [
            { path: null, name: 'Vendor List' },
        ],
        '/vendor/detail/': [
            { path: "/vendor/all", name: 'Vendor List' },
            { path: null, name: 'Vendor Detail' },
        ],
        '/project/all': [
            { path: null, name: 'Project List' },
        ],
        '/project/detail/': [
            { path: "/project/all", name: 'Project List' },
            { path: null, name: 'Project Detail' },
        ]
    }

    let regex = pathname.match(/\d+$/)
    let param = regex ? regex[0] : null
    let routes = param ? routesAll[pathname.slice(0, pathname.indexOf(param))] : routesAll[pathname]

    let output = [{ path: '/', breadcrumbName: 'Home' }]
    let last = routes.length - 1

    for (let i = 0; i < routes.length; i++) {
        if (i === last && param) {
            output.push({ path: routes[i].path, breadcrumbName: `${routes[i].name} ${param}` });
        }
        else {
            output.push({ path: routes[i].path, breadcrumbName: routes[i].name });
        }
    }

    console.log(output)

    return output
};

export default Breadcrumbs;
*/

export default function Breadcrumbs() {

    const history = useHistory()

    let pathname = history.location.pathname

    const routesAll = {

        '/customer/all': [
            { path: null, name: 'Customer List' },
        ],
        '/customer/detail/': [
            { path: "/customer/all", name: 'Customer List' },
            { path: null, name: 'Customer Detail' },
        ],
        '/vendor/all': [
            { path: null, name: 'Vendor List' },
        ],
        '/vendor/detail/': [
            { path: "/vendor/all", name: 'Vendor List' },
            { path: null, name: 'Vendor Detail' },
        ],
        '/project/all': [
            { path: null, name: 'Project List' },
        ],
        '/project/detail/': [
            { path: "/project/all", name: 'Project List' },
            { path: null, name: 'Project Detail' },
        ],
        '/quotation/all': [
            { path: null, name: 'Quotation List' },
        ],
        '/quotation/detail/': [
            { path: "/quotation/all", name: 'Quotation List' },
            { path: null, name: 'Quotation Detail' },
        ],
        '/item/all': [
            { path: null, name: 'Item List' },
        ],
        '/item/detail/': [
            { path: "/item/all", name: 'Item List' },
            { path: null, name: 'Item Detail' },
        ],
        '/ticket/all': [
            { path: null, name: 'Ticket List' },
        ],
        '/ticket/detail/': [
            { path: "/ticket/all", name: 'Ticket List' },
            { path: null, name: 'Ticket Detail' },
        ],
        '/block/all': [
            { path: null, name: 'Block List' },
        ],
        '/block/detail/': [
            { path: "/block/all", name: 'Block List' },
            { path: null, name: 'Block Detail' },
        ]
    }

    let regex = pathname.match(/\d+$/)
    let param = regex ? regex[0] : null
    let routes = param ? routesAll[pathname.slice(0, pathname.indexOf(param))] : routesAll[pathname]

    return (
        <Breadcrumb id='crm-breadcrumb'>
            <Breadcrumb.Item>
                <Link to="/">Home</Link>
            </Breadcrumb.Item>
            {routes && routes.map((route, index) => {
                let isLast = index === routes.length - 1
                return isLast ? (<Breadcrumb.Item key='last'>{param ? `${route.name} ${param}` : route.name}</Breadcrumb.Item>)
                    : (
                        <Breadcrumb.Item key={index}>
                            <Link to={route.path}>{route.name}</Link>
                        </Breadcrumb.Item>)
            })}
        </Breadcrumb>
    )
}
