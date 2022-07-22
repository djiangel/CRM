import { updateObject } from "../utility";

const initialState = {
    projects: {
        active: [],
        approval: [],
        inactive: [],
        permissions: [],
    },
    project: {},
    customers: {
        permissions: [],
        active: [],
        inactive: [],
        registered: [],
        approval: [],
    },
    customer: {},
    vendors: {
        permissions: [],
        active: [],
        inactive: [],
        registered: [],
        approval: [],
    },
    vendor: {},
    sources: [],
    department: [],
    items: {
        items: [],
        permissions: [],
    },
    item: {},
    quotations: {
        active: [],
        approval: [],
        inactive: [],
        permissions: [],
    },
    quotation: {},
    competitor_items: [],
    blocks: {
        active: [],
        approval: [],
        inactive: [],
        permissions: [],
    },
    block: {},
    analytics: {
        client: [],
        KPI: [],
        country: [],
        estimated_revenue: [],
        conversion: {},
        source: {},
        actual_revenue: {},
        loading: 0,
        department: [],
        project_conversion: {},
        ticket_conversion: {},
    },
    actual_state: []
};



const storeData = (state, action) => {
    switch (action.fetch) {
        case 'projects': return (updateObject(state, {
            projects: {
                ...state.projects,
                [action.label]: action.payload
            }
        }));
        case 'project': return (updateObject(state, { project: action.payload }));
        case 'customers': return (updateObject(state, {
            customers: {
                ...state.customers,
                [action.label]: action.payload
            }
        }));
        case 'customer': return (updateObject(state, { customer: action.payload }));
        case 'vendors': return (updateObject(state, {
            vendors: {
                ...state.vendors,
                [action.label]: action.payload
            }
        }));
        case 'vendor': return (updateObject(state, { vendor: action.payload }));
        case 'sources': return (updateObject(state, { sources: action.payload }));
        case 'blocks': return (updateObject(state, {
            blocks: {
                ...state.blocks,
                [action.label]: action.payload
            }
        }));
        case 'block': return (updateObject(state, { block: action.payload }));
        case 'department': return (updateObject(state, { department: action.payload }));
        case 'items': return (updateObject(state, {
            items: {
                ...state.items,
                [action.label]: action.payload
            }
        }));
        case 'item': return (updateObject(state, { item: action.payload }));
        case 'competitor_items': return (updateObject(state, { competitor_items: action.payload }));
        case 'quotations': return (updateObject(state, {
            quotations: {
                ...state.quotations,
                [action.label]: action.payload
            }
        }));
        case 'quotation': return (updateObject(state, { quotation: action.payload }));

        case 'client': return (updateObject(state, { analytics: { ...state.analytics, client: action.payload } }));
        case 'KPI': return (updateObject(state, { analytics: { ...state.analytics, KPI: action.payload } }));
        case 'country': return (updateObject(state, { analytics: { ...state.analytics, country: action.payload } }));
        case 'estimated_revenue': return (updateObject(state, { analytics: { ...state.analytics, estimated_revenue: action.payload } }));

        case 'conversion': return (updateObject(state, { analytics: { ...state.analytics, conversion: { ...state.analytics.conversion, [action.inner]: action.payload } } }));
        case 'actual_revenue': return (updateObject(state, { analytics: { ...state.analytics, actual_revenue: { ...state.analytics.actual_revenue, [action.inner]: action.payload } } }));
        case 'source': return (updateObject(state, { analytics: { ...state.analytics, source: { ...state.analytics.source, [action.inner]: action.payload } } }));
        case 'project_conversion': return (updateObject(state, { analytics: { ...state.analytics, project_conversion: { ...state.analytics.project_conversion, [action.inner]: action.payload } } }));
        case 'ticket_conversion': return (updateObject(state, { analytics: { ...state.analytics, ticket_conversion: { ...state.analytics.ticket_conversion, [action.inner]: action.payload } } }));

        case 'department_analytics': return (updateObject(state, { analytics: { ...state.analytics, department: action.payload } }))

        case 'actual_state': return (updateObject(state, { actual_state: action.payload }))

    }
}

const storeUpdates = (state, action) => {
    switch (action.fetch) {
        case 'project': return (updateObject(state, { projects: [...state.projects, action.payload] }))
        case 'project_update': return (updateObject(state, { project: action.payload }))
        case 'customer_update': return (updateObject(state, { customer: action.payload }))
        case 'vendor_update': return (updateObject(state, { vendor: action.payload }))
        case 'item_update': return (updateObject(state, { item: action.payload }))
        case 'quotation_update': return (updateObject(state, { quotation: action.payload }))
        case 'block_update': return (updateObject(state, { block: action.payload }))
        /*case 'user_remove': return (updateObject(state, {
            project: {
                ...state.project, ['userProfile']: state.project['userProfile'].filter(function (user) {
                    return !action.payload.find(function (removed) {
                        return removed === user.user.id
                    })
                })
            }
        }))
        case 'user_add': return (updateObject(state, {
            project: { ...state.project, ['userProfile']: state.project['userProfile'].concat(action.payload) }
        }))
        case 'customer_change': return (updateObject(state, {
            project: { ...state.project, ['customerInformation']: action.payload }
        }))
        case 'quotations': return (updateObject(state, { project: { ...state.project, quotations: [...state.project.quotations, action.payload] } }))
        case 'quotations_update': return (updateObject(state, {
            project: {
                ...state.project, quotations: state.project.quotations.map(quotation =>
                    quotation.quotation_id === action.payload.quotation_id ? action.payload : quotation)
            }
        }))

        case 'requirements': return (updateObject(state, { project: { ...state.project, requirements: [...state.project.requirements, action.payload] } }))
        case 'requirements_update': return (updateObject(state, {
            project: {
                ...state.project, requirements: state.project.requirements.map(requirement =>
                    requirement.customer_requirement_id === action.payload.customer_requirement_id ? action.payload : requirement)
            }
        }))
        case 'project_items': return (updateObject(state, { project: { ...state.project, items: state.project.items.concat(action.payload) } }))
        case 'project_items_update': return (updateObject(state, {
            project: {
                ...state.project, items: state.project.items.map(item =>
                    item.project_item_id === action.payload.project_item_id ? action.payload : item)
            }
        }))*/
    }

}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'STORE_DATA': return storeData(state, action);
        case 'STORE_UPDATES': return storeUpdates(state, action);
        default:
            return state;
    }
}

export default reducer;
