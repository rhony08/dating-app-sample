import { Provider } from '@nestjs/common';

/**
 * Represents a scenario to be tested.
 */
export type Scenario = {
  /**
   * The name of the scenario.
   */
  name: string;

  /**
   * The request object for the scenario.
   */
  request: any;

  /**
   * The expected value for the scenario.
   */
  expectedValue: any;

  /**
   * The expected errors for the scenario (optional).
   */
  expectedErrors?: any;

  /**
   * The providers for the scenario (optional).
   */
  providers?: Provider<any>;
};
