export enum AppEnvironment {
  Dev = "development",
  Test = "test",
  Staging = "staging",
  QA = "qa",
  Prod = "production",
}

export enum ShortAppEnvironment {
  Dev = "dev",
  Test = "test",
  Staging = "staging",
  QA = "qa",
  Prod = "prod",
}

enum EnvHostname {
  Dev = "rcubed-dev",
  Test = "rcubed-test",
  Staging = "rcubed-staging",
  QA = "rcubed-qa",
  Prod = "rcubed-prod",
  Localhost = "localhost",
}

export function getEnvironment() {
  const currentHost = window.location.hostname;
  const currentEnv = currentHost === 'rcubed.lilly.com' ? 'rcubed-prod' : currentHost === 'rcubed-dev.lilly.com' ? 'rcubed-dev' : currentHost === 'rcubed-qa.lilly.com' ? 'rcubed-qa' : 'localhost';

  const hostObj = {}; 
  hostObj[EnvHostname.Test] = AppEnvironment.Test;
  hostObj[EnvHostname.Staging] = AppEnvironment.Staging;
  hostObj[EnvHostname.QA] = AppEnvironment.QA;
  hostObj[EnvHostname.Prod] = AppEnvironment.Prod;
  hostObj[EnvHostname.Dev] = AppEnvironment.Dev;
  hostObj[EnvHostname.Localhost] = AppEnvironment.Dev;
  return hostObj[currentEnv] || AppEnvironment.Dev;
}

export function getShortAppEnvironment(env: AppEnvironment) {
  const appEnv = {};
  appEnv[AppEnvironment.Test] = ShortAppEnvironment.Test;
  appEnv[AppEnvironment.Staging] = ShortAppEnvironment.Staging;
  appEnv[AppEnvironment.QA] = ShortAppEnvironment.QA;
  appEnv[AppEnvironment.Prod] = ShortAppEnvironment.Prod;
  appEnv[AppEnvironment.Dev] = ShortAppEnvironment.Dev;
  return appEnv[env] || ShortAppEnvironment.Dev;
}
