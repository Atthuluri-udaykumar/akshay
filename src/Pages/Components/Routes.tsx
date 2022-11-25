import React from "react";
import ReferenceData from "./ReferenceData";
import RegionsContainer from "./Regions/RegionsContainer";
import { Routes as AppRoutes, Route } from "react-router-dom";
import Welcome from "./Welcome";
import SearchLandingPage from "./SearchReqForms/SearchLandingPage";
// import Search from "./Search";
import Alerts from "./Alerts";
import Tasks from "./Tasks/Tasks";
import Dashboard from "./Dashboard";
import FormsPage from "./RequirementsForm/FormsPage";
import Documents from "./Documents";
import MyWork from "./Mywork";
import NotFound from "./NotFound.js";
import PublishedForm from "./RequirementsForm/PublishedForm";
import DraftForm from "./RequirementsForm/DraftForm";
import QuestionsViewContainer from "../ReusableComponents/QuestionTable/QuestionsViewContainer";
import UserManagement from "./UserManagement";
import {
  GenericUserGroups,
  filterItemsUsingUserGroups,
} from "../../global/userGroups";
import AnswerUnansweredFormPage from "./SearchReqForms/AnswerUnansweredFormPage";
import { QuestionTemplate } from "./Question/QuestionTemplate";
import { QuestionSearch } from "./Question/QuestionSearch";
import { PublishAndDraftForm } from "./Form/PublishAndDraftForm";

interface IRouteItem {
  exact?: boolean;
  path: string;
  groups: GenericUserGroups[];
  component: React.ReactElement;
}

const routes: IRouteItem[] = [
  {
    path: "/",
    component: <Welcome />,
    exact: true,
    groups: [GenericUserGroups.Admin, GenericUserGroups.User],
  },
  {
    path: "/questionbuilder/:questionTemplateId",
    component: <QuestionTemplate />,
    groups: [GenericUserGroups.Admin],
  },
  {
    path: "/admin",
    component: <ReferenceData />,
    exact: true,
    groups: [GenericUserGroups.Admin],
  },
  {
    path: "/questionbuilder",
    component: <QuestionTemplate />,
    exact: true,
    groups: [GenericUserGroups.Admin],
  },
  {
    path: "/usermanagement",
    component: <UserManagement />,
    exact: true,
    groups: [GenericUserGroups.Admin],
  },
  {
    path: "/regions",
    component: <RegionsContainer />,
    exact: true,
    groups: [GenericUserGroups.Admin],
  },
  {
    path: "/alerts",
    component: <Alerts />,
    exact: true,
    groups: [GenericUserGroups.Admin],
  },
  {
    path: "/assignedtasks",
    component: <Tasks />,
    exact: true,
    groups: [],
  },
  {
    path: "/unassignedtasks",
    component: <Tasks />,
    exact: true,
    groups: [],
  },
  {
    path: "/answerforms/:formId",
    component: <AnswerUnansweredFormPage />,
    exact: true,
    groups: [],
  },
  {
    path: "/questionsearch",
    component: <QuestionSearch/>,//<QuestionsViewContainer />,
    exact: true,
    groups: [GenericUserGroups.Admin],
  },
  {
    path: "/publishedforms/:formId",
    component: <PublishedForm />,
    exact: false,
    groups: [GenericUserGroups.Admin],
  },
  {
    path: "/forms",
    component: <PublishAndDraftForm/>, //<FormsPage />,
    exact: true,
    groups: [GenericUserGroups.Admin],
  },
  {
    path: "/draftforms/:formId",
    component: <DraftForm />,
    exact: false,
    groups: [GenericUserGroups.Admin],
  },
  {
    path: "/draftforms",
    component: <FormsPage />,
    groups: [GenericUserGroups.Admin],
  },
  {
    path: "/Search",
    component: <SearchLandingPage />,
    groups: [],
    exact: true,
  },
  {
    path: "/Alerts",
    component: <Alerts />,
    groups: [],
    exact: true,
  },
  {
    path: "/Dashboard",
    component: <Dashboard />,
    groups: [],
    exact: true,
  },
  {
    path: "/Documents",
    component: <Documents />,
    groups: [],
    exact: true,
  },
  {
    path: "/MyWork",
    component: <MyWork />,
    groups: [],
    exact: true,
  },
  {
    path: "*",
    component: <NotFound />,
    groups: [],
  },
];

export interface IRoutesProps {
  userGroups: string[];
}

const Routes: React.FC<IRoutesProps> = ({ userGroups }) => {
  const memoizedRoutes = React.useMemo(
    () => filterItemsUsingUserGroups(routes, userGroups),
    [userGroups]
  );

  return (
    <AppRoutes>
      {memoizedRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.component}
        ></Route>
      ))}
    </AppRoutes>
  );
};

export default Routes;
