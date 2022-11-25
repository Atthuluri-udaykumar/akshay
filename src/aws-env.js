export const awsenv = {
    dev:{
        REGION: 'us-east-2',
        USER_POOL_ID: 'us-east-2_OJF5hN35R',
        IDENTITY_POOL_ID: 'us-east-2:37656a2a-fbd4-491d-8ecc-cb65d449810c',
        IDENTITY_PROVIDER_NAME: 'Lilly-login',
        WEB_CLIENT_ID: '3000f572aq3plpvfo2ps0c2b1u',
        DOMAIN: 'rcubed-dev.auth.us-east-2.amazoncognito.com',
        SCOPE: ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"],
        RESPONSE_TYPE : 'token',
        API_NAME: 'dev-rcubed',
        API_URL: 'https://jenlvadd1m.execute-api.us-east-2.amazonaws.com/dev/rcubed/',
        REDIRECT_URL: 'https://rcubed-dev.lilly.com'
    },
    qa:{
        REGION: 'us-east-2',
        USER_POOL_ID: 'us-east-2_oAmh40i4c',
        IDENTITY_POOL_ID: 'us-east-2:b95c2830-dbbe-4047-bdaf-bf0d0e56b392',
        IDENTITY_PROVIDER_NAME: 'Rcubed-QA',
        WEB_CLIENT_ID: '78af5jdtcupnjn1ih7970bp0r5',
        DOMAIN: 'rcubed-qa.auth.us-east-2.amazoncognito.com',
        SCOPE: ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"],
        RESPONSE_TYPE : 'token',
        API_NAME: 'qa-rcubed',
        API_URL: 'https://35o36x45u8.execute-api.us-east-2.amazonaws.com/qa/rcubed/',
        REDIRECT_URL: 'https://rcubed-qa.lilly.com'
    },
    prod:{
        REGION: 'us-east-2',
        USER_POOL_ID: 'us-east-2_99sytNqSF',
        IDENTITY_POOL_ID: 'us-east-2:5312e3d7-a174-4b91-9788-04dd3d45d841',
        IDENTITY_PROVIDER_NAME: 'Rcubed-PROD',
        WEB_CLIENT_ID: 'e2inqm1kkr1aah1u5acll2etd',
        DOMAIN: 'rcubed.auth.us-east-2.amazoncognito.com',
        SCOPE: ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"],
        RESPONSE_TYPE : 'token',
        API_NAME: 'prod-rcubed',
        API_URL: 'https://lww03m2v22.execute-api.us-east-2.amazonaws.com/prod/rcubed/',
        REDIRECT_URL: 'https://rcubed.lilly.com'
    },
    local:{
        REGION: 'us-east-2',
        USER_POOL_ID: 'us-east-2_OJF5hN35R',
        IDENTITY_POOL_ID: 'us-east-2:37656a2a-fbd4-491d-8ecc-cb65d449810c',
        IDENTITY_PROVIDER_NAME: 'Lilly-login',
        WEB_CLIENT_ID: '3000f572aq3plpvfo2ps0c2b1u',
        DOMAIN: 'rcubed-dev.auth.us-east-2.amazoncognito.com',
        SCOPE: ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"],
        RESPONSE_TYPE : 'token',
        API_NAME: 'dev-rcubed',
        API_URL: 'https://jenlvadd1m.execute-api.us-east-2.amazonaws.com/dev/rcubed/',
        REDIRECT_URL: 'http://localhost:3000'
    }
}