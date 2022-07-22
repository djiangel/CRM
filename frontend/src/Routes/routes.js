import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import CustomerList from './../containers/Customers/CustomerList';
import CustomerDetail from './../containers/Customers/CustomerDetail';
import VendorList from './../containers/Vendors/VendorList';
import VendorDetail from './../containers/Vendors/VendorDetail';
import SalesProjectList from './../containers/Opportunities/SalesProjectList';
import SalesProjectDetail from './../containers/Opportunities/SalesProjectDetail';
import ChangePassword from './../containers/Authentication/ChangePassword';
import ListWorkflowObjectsPage from '../pages/Workflow/ListWorkflowPage';
import WorkFlowDetailPage from '../pages/Workflow/WorkFlowDetailPage';
import ListFunctionPage from '../pages/Workflow/ListFunctionPage';
import FunctionDetailPage from '../pages/Workflow/FunctionDetailPage';
import ListStatesPage from '../pages/Workflow/ListStatesPage';
import TicketListPage from './../pages/Ticket/TicketListPage';
import TicketDetailPage from './../pages/Ticket/TicketDetailPage';
import Home from './../containers/Dashboard/Home';
import UserProfile from '../pages/Userprofile/UserProfilePage';
import PrivateRoute from './PrivateRoute';
import EmailContainer from './../containers/Email/EmailContainer';
import ItemList from './../containers/Items/ItemList';
import ItemDetail from './../containers/Items/ItemDetail';
import QuotationList from './../containers/Quotations/QuotationList';
import QuotationDetail from './../containers/Quotations/QuotationDetail';
import BudgetBlockList from "../containers/BudgetBlock/BudgetBlockList";
import BudgetBlockDetail from "../containers/BudgetBlock/BudgetBlockDetail";
import AdminSettings from "../containers/Userprofile/AdminSettings";
import Signup from "../containers/Authentication/Signup";

const BaseRouter = () => (
    <Switch>
        <PrivateRoute exact path="/" exact component={Home} />
        <PrivateRoute exact path="/signup" component={Signup} />
        <PrivateRoute exact path="/changepassword" component={ChangePassword} />
        <PrivateRoute exact path="/adminsettings" component={AdminSettings} />
        <PrivateRoute exact path="/customer/all" exact component={CustomerList} />
        <PrivateRoute exact path="/customer/detail/:id" component={CustomerDetail} />
        <PrivateRoute exact path="/vendor/all" exact component={VendorList} />
        <PrivateRoute exact path="/vendor/detail/:id" component={VendorDetail} />
        <PrivateRoute exact path="/project/all" exact component={SalesProjectList} />
        <PrivateRoute exact path="/project/detail/:id" component={SalesProjectDetail} />
        <PrivateRoute exact path="/workflows" component={ListWorkflowObjectsPage} />
        <PrivateRoute exact path="/workflows/view/:id" component={WorkFlowDetailPage} />
        <PrivateRoute exact path="/workflow/automations" component={ListFunctionPage} />
        <PrivateRoute exact path="/workflow/automations/:id" component={FunctionDetailPage} />
        <PrivateRoute exact path="/workflow/states" component={ListStatesPage} />
        <PrivateRoute exact path="/ticket/all" component={TicketListPage} />
        <PrivateRoute exact path="/ticket/detail/:id" component={TicketDetailPage} />
        <PrivateRoute exact path="/email" exact component={EmailContainer} />
        <PrivateRoute exact path="/profile/:id" exact component={UserProfile} />
        <PrivateRoute exact path="/item/all" exact component={ItemList} />
        <PrivateRoute exact path="/item/detail/:id" exact component={ItemDetail} />
        <PrivateRoute exact path="/quotation/all" exact component={QuotationList} />
        <PrivateRoute exact path="/quotation/detail/:id" exact component={QuotationDetail} />
        <PrivateRoute exact path="/block/all" exact component={BudgetBlockList} />
        <PrivateRoute exact path="/block/detail/:id" exact component={BudgetBlockDetail} />
        <Route exact path="*" component={() => '404 NOT FOUND'} />

    </Switch>
);


export default BaseRouter;