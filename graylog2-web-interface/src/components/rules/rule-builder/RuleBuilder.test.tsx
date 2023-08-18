/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import * as React from 'react';
import { renderWithDataRouter } from 'wrappedTestingLibrary';
import userEvent from '@testing-library/user-event';

import asMock from 'helpers/mocking/AsMock';
import useRuleBuilder from 'hooks/useRuleBuilder';

import RuleBuilder from './RuleBuilder';

import { PipelineRulesContext } from '../RuleContext';

jest.mock('hooks/useRuleBuilder');

describe('RuleBuilder', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should save Title and Description', () => {
    const createRule = jest.fn();
    const title = 'title';
    const description = 'description';
    const rule_builder = { actions: [], conditions: [] };

    asMock(useRuleBuilder).mockReturnValue({
      rule: null,
      createRule,
    } as any);

    const { getByLabelText, getByRole } = renderWithDataRouter((
      <PipelineRulesContext.Provider value={{
        setRawMessageToSimulate: () => {},
        setRuleSimulationResult: () => {},
        setStartRuleSimulation: () => {},
      }}>
        <RuleBuilder />
      </PipelineRulesContext.Provider>
    ));
    const titleInput = getByLabelText('Title');
    const descriptionInput = getByLabelText('Description');

    userEvent.paste(titleInput, title);
    userEvent.paste(descriptionInput, description);
    const createRuleButton = getByRole('button', { name: 'Create rule' });
    userEvent.click(createRuleButton);

    expect(createRule).toHaveBeenCalledWith({
      title,
      description,
      rule_builder,
    });
  });

  it('should update Title and Description', () => {
    const updateRule = jest.fn();
    const title = 'title';
    const description = 'description';
    const rule_builder = { actions: [], conditions: [] };

    asMock(useRuleBuilder).mockReturnValue({
      rule: { title: '', description: '', rule_builder },
      updateRule,
    } as any);

    const { getByLabelText, getByRole } = renderWithDataRouter((
      <PipelineRulesContext.Provider value={{
        setRawMessageToSimulate: () => {},
        setRuleSimulationResult: () => {},
        setStartRuleSimulation: () => {},
      }}>
        <RuleBuilder />
      </PipelineRulesContext.Provider>
    ));
    const titleInput = getByLabelText('Title');
    const descriptionInput = getByLabelText('Description');

    userEvent.paste(titleInput, title);
    userEvent.paste(descriptionInput, description);
    const updateRuleButton = getByRole('button', { name: 'Update rule' });
    userEvent.click(updateRuleButton);

    expect(updateRule).toHaveBeenCalledWith({
      title,
      description,
      rule_builder,
    });
  });

  it('should be able to convert Rule Builder to Source Code', () => {
    const title = 'title';
    const description = 'description';
    const rule_builder = { actions: [], conditions: [] };

    asMock(useRuleBuilder).mockReturnValue({
      rule: { title, description, rule_builder },
    } as any);

    const { getByRole } = renderWithDataRouter((
      <PipelineRulesContext.Provider value={{
        setRawMessageToSimulate: () => {},
        setRuleSimulationResult: () => {},
        setStartRuleSimulation: () => {},
      }}>
        <RuleBuilder />
      </PipelineRulesContext.Provider>
    ));

    const convertButton = getByRole('button', { name: 'Convert Rule Builder to Source Code', hidden: true });
    userEvent.click(convertButton);

    const createRuleFromCodeButton = getByRole('button', { name: 'Create new Rule from Code', hidden: true });
    const copyCloseButton = getByRole('button', { name: 'Copy & Close', hidden: true });

    expect(createRuleFromCodeButton).toBeInTheDocument();
    expect(copyCloseButton).toBeInTheDocument();
  });

  it('should show simulator', () => {
    const title = 'title';
    const description = 'description';
    const rule_builder = { actions: [], conditions: [] };

    asMock(useRuleBuilder).mockReturnValue({
      rule: { title, description, rule_builder },
    } as any);

    const { getByTitle, getByText, getByRole } = renderWithDataRouter((
      <PipelineRulesContext.Provider value={{
        simulateRule: () => {},
        setRawMessageToSimulate: () => {},
        setRuleSimulationResult: () => {},
        setStartRuleSimulation: () => {},
      }}>
        <RuleBuilder />
      </PipelineRulesContext.Provider>
    ));

    const showSimulatorSwitch = getByTitle('Show Simulator');
    userEvent.click(showSimulatorSwitch);

    const ruleSimulationLabel = getByText('Rule Simulation');
    const runRuleSimulation = getByRole('button', { name: 'Run rule simulation' });

    expect(ruleSimulationLabel).toBeInTheDocument();
    expect(runRuleSimulation).toBeInTheDocument();
  });

  it('should show simulator with conditions and actions output', () => {
    const title = 'title';
    const description = 'description';
    const rule_builder = { actions: [], conditions: [] };
    const conditionOutput1 = 'condition_output_1';
    const actionOutput1 = 'action_output_1';
    const actionOutput2 = 'action_output_2';

    asMock(useRuleBuilder).mockReturnValue({
      rule: { title, description, rule_builder },
    } as any);

    const { getByTitle, getByText, getByTestId } = renderWithDataRouter((
      <PipelineRulesContext.Provider value={{
        ruleSimulationResult: {
          fields: { message: 'test' },
          simulator_condition_variables: { 1: conditionOutput1 },
          simulator_action_variables: { 1: actionOutput1, 2: actionOutput2 },
        },
        simulateRule: () => {},
        setRawMessageToSimulate: () => {},
        setRuleSimulationResult: () => {},
        setStartRuleSimulation: () => {},
      }}>
        <RuleBuilder />
      </PipelineRulesContext.Provider>
    ));

    const showSimulatorSwitch = getByTitle('Show Simulator');
    userEvent.click(showSimulatorSwitch);

    const conditionOutputs = getByText('Conditions Output');
    const actionOutputs = getByText('Actions Output');
    const conditionOutputContainer = getByTestId('conditions-output');
    const actionOutputContainer = getByTestId('actions-output');

    expect(conditionOutputs).toBeInTheDocument();
    expect(actionOutputs).toBeInTheDocument();
    expect(conditionOutputContainer).toContainHTML(conditionOutput1);
    expect(actionOutputContainer).toContainHTML(actionOutput1);
    expect(actionOutputContainer).toContainHTML(actionOutput2);
  });
});
