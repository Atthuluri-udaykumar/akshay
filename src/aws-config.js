const currentHost = window.location.hostname;
const currentEnv = currentHost === 'rcubed.lilly.com' ? 'prod' : currentHost === 'rcubed-dev.lilly.com' ? 'dev' : currentHost === 'rcubed-qa.lilly.com' ? 'qa' : 'local';

import { awsenv } from "./aws-env";
console.log(`${currentEnv} configuration: `, awsenv[currentEnv]);
const rcubedEnv = awsenv[currentEnv];

const REGION = rcubedEnv.REGION;
const USER_POOL_ID = rcubedEnv.USER_POOL_ID;
const IDENTITY_POOL_ID = rcubedEnv.IDENTITY_POOL_ID;
const IDENTITY_PROVIDER_NAME = rcubedEnv.IDENTITY_PROVIDER_NAME;
const WEB_CLIENT_ID = rcubedEnv.WEB_CLIENT_ID;
const DOMAIN = rcubedEnv.DOMAIN;
const SCOPE = rcubedEnv.SCOPE;
const RESPONSE_TYPE = rcubedEnv.RESPONSE_TYPE;
const API_NAME = rcubedEnv.API_NAME;
const API_URL = rcubedEnv.API_URL;
const REDIRECT_URL = rcubedEnv.REDIRECT_URL;

const SIGNIN_URL = `https://${DOMAIN}/oauth2/authorize?identity_provider=${IDENTITY_PROVIDER_NAME}&redirect_uri=${REDIRECT_URL}&response_type=${RESPONSE_TYPE}&client_id=${WEB_CLIENT_ID}`;

const awsconfig = {
  auth: {
    mandatorySignIn: true,
    region: REGION,
    userPoolId: USER_POOL_ID,
    identityPoolId: IDENTITY_POOL_ID,
    userPoolWebClientId: WEB_CLIENT_ID,
    signInUrl: SIGNIN_URL,
    oauth: {
      domain: DOMAIN,
      scope: SCOPE,
      redirectSignIn: REDIRECT_URL,
      redirectSignOut: REDIRECT_URL,
      responseType: RESPONSE_TYPE,
      client_id: WEB_CLIENT_ID
    },
  },
  storage: {
    region: REGION,
    identityPoolId: IDENTITY_POOL_ID
  },
  api: {
    endpoints: [
      {
        name: API_NAME,
        endpoint: API_URL,
        region: REGION
      }
    ]
  },
  identity_provider:{
    identity_provider_name:IDENTITY_PROVIDER_NAME
  }
};

export default awsconfig;
