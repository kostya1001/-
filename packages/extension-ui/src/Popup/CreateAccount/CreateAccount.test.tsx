// Copyright 2019-2020 @polkadot/extension-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '../../../../../__mocks__/chrome';

import { configure, mount, ReactWrapper } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { ThemeProvider } from 'styled-components';

import { ActionContext, ActionText, Button, themes, Input, InputWithLabel } from '../../components';
import * as messaging from '../../messaging';
import { Header } from '../../partials';
import { flushAllPromises } from '../../testHelpers';
import CreateAccount from '.';

configure({ adapter: new Adapter() });

describe('Create Account', () => {
  let wrapper: ReactWrapper;
  let onActionStub: jest.Mock;
  const exampleAccount = {
    address: 'HjoBp62cvsWDA3vtNMWxz6c9q13ReEHi9UGHK7JbZweH5g5',
    seed: 'horse battery staple correct'
  };
  const mountComponent = (): ReactWrapper => mount(
    <ActionContext.Provider value={onActionStub}>
      <ThemeProvider theme={themes.dark}>
        <CreateAccount />
      </ThemeProvider>
    </ActionContext.Provider>
  );

  const check = (input: ReactWrapper): unknown => input.simulate('change', { target: { checked: true } });

  const type = async (input: ReactWrapper, value: string): Promise<void> => {
    input.simulate('change', { target: { value } });
    await act(flushAllPromises);
    wrapper.update();
  };

  const enterName = (name: string): Promise<void> => type(wrapper.find('input'), name);
  const password = (password: string) => (): Promise<void> => type(wrapper.find('input[type="password"]').first(), password);
  const repeat = (password: string) => (): Promise<void> => type(wrapper.find('input[type="password"]').last(), password);

  beforeEach(async () => {
    onActionStub = jest.fn();
    jest.spyOn(messaging, 'createSeed').mockResolvedValue(exampleAccount);
    jest.spyOn(messaging, 'createAccountSuri').mockResolvedValue(true);
    wrapper = mountComponent();
    await act(flushAllPromises);
    wrapper.update();
  });

  describe('Phase 1', () => {
    it('shows seed phrase in textarea', () => {
      expect(wrapper.find('textarea').text()).toBe(exampleAccount.seed);
    });

    it('next step button is disabled when checkbox is not checked', () => {
      expect(wrapper.find(Button).prop('isDisabled')).toBe(true);
    });

    it('action text is "Cancel"', () => {
      expect(wrapper.find(Header).find(ActionText).text()).toBe('Cancel');
    });

    it('clicking "Cancel" redirects to main screen', () => {
      wrapper.find(Header).find(ActionText).simulate('click');
      expect(onActionStub).toBeCalledWith('/');
    });

    it('clicking on Next activates phase 2', () => {
      check(wrapper.find('input[type="checkbox"]'));
      wrapper.find('button').simulate('click');
      expect(wrapper.find(Header).text()).toBe('Create an account 2/2Back');
    });
  });

  describe('Phase 2', () => {
    beforeEach(async () => {
      check(wrapper.find('input[type="checkbox"]'));
      wrapper.find('button').simulate('click');
      await act(flushAllPromises);
    });

    it('only account name input is visible at first', () => {
      expect(wrapper.find(InputWithLabel).find('[data-input-name]').find(Input)).toHaveLength(1);
      expect(wrapper.find(InputWithLabel).find('[data-input-password]')).toHaveLength(0);
      expect(wrapper.find(InputWithLabel).find('[data-input-repeat-password]')).toHaveLength(0);
      expect(wrapper.find(Button)).toHaveLength(0);
    });

    it('input should not be highlighted as error until first interaction', () => {
      expect(wrapper.find(Input).prop('withError')).toBe(false);
    });

    it('after typing less than 3 characters into name input, password input is not visible', async () => {
      await enterName('ab');
      expect(wrapper.find(Input).prop('withError')).toBe(true);
      expect(wrapper.find('ErrorMessage').text()).toBe('Account name is too short');
      expect(wrapper.find(InputWithLabel).find('[data-input-password]')).toHaveLength(0);
      expect(wrapper.find(InputWithLabel).find('[data-input-repeat-password]')).toHaveLength(0);
      expect(wrapper.find(Button)).toHaveLength(0);
    });

    it('input should keep showing error when something has been typed but then erased', async () => {
      await enterName('ab');
      await enterName('');
      expect(wrapper.find(Input).prop('withError')).toBe(true);
    });

    it('after typing 3 characters into name input, first password input is visible', async () => {
      await enterName('abc');
      expect(wrapper.find(Input).first().prop('withError')).toBe(false);
      expect(wrapper.find(InputWithLabel).find('[data-input-password]').find(Input)).toHaveLength(1);
      expect(wrapper.find(InputWithLabel).find('[data-input-repeat-password]')).toHaveLength(0);
      expect(wrapper.find(Button)).toHaveLength(0);
    });

    it('password shorter than 6 characters should be not valid', async () => {
      await enterName('abc').then(password('abcde'));
      expect(wrapper.find(InputWithLabel).find('[data-input-password]').find(Input).prop('withError')).toBe(true);
      expect(wrapper.find('ErrorMessage').text()).toBe('Password is too short');
      expect(wrapper.find(InputWithLabel).find('[data-input-password]').find(Input)).toHaveLength(1);
      expect(wrapper.find(InputWithLabel).find('[data-input-repeat-password]')).toHaveLength(0);
      expect(wrapper.find(Button)).toHaveLength(0);
    });

    it('submit button is not visible until both passwords are equal', async () => {
      await enterName('abc').then(password('abcdef')).then(repeat('abcdeg'));
      expect(wrapper.find('ErrorMessage').text()).toBe('Passwords do not match');
      expect(wrapper.find(InputWithLabel).find('[data-input-repeat-password]').find(Input).prop('withError')).toBe(true);
      expect(wrapper.find(Button)).toHaveLength(0);
    });

    it('submit button is visible when both passwords are equal', async () => {
      await enterName('abc').then(password('abcdef')).then(repeat('abcdef'));
      expect(wrapper.find('ErrorMessage')).toHaveLength(0);
      expect(wrapper.find(InputWithLabel).find('[data-input-repeat-password]').find(Input).prop('withError')).toBe(false);
      expect(wrapper.find(Button)).toHaveLength(1);
    });

    it('saves account with provided name and password', async () => {
      await enterName('abc').then(password('abcdef')).then(repeat('abcdef'));
      wrapper.find(Button).find('button').simulate('click');
      await act(flushAllPromises);

      expect(messaging.createAccountSuri).toBeCalledWith('abc', 'abcdef', exampleAccount.seed);
      expect(onActionStub).toBeCalledWith('/');
    });
  });

  describe('Both passwords are equal, but then', () => {
    beforeEach(async () => {
      check(wrapper.find('input[type="checkbox"]'));
      wrapper.find('button').simulate('click');
      await act(flushAllPromises);
      await enterName('abc').then(password('abcdef')).then(repeat('abcdef'));
    });

    it('first password input is cleared - second one and button get hidden', async () => {
      await type(wrapper.find('input[type="password"]').first(), '');
      expect(wrapper.find(InputWithLabel).find('[data-input-repeat-password]')).toHaveLength(0);
      expect(wrapper.find(Button)).toHaveLength(0);
    });

    it('first password changes - button is not visible', async () => {
      await type(wrapper.find('input[type="password"]').first(), 'aaaaaa');
      expect(wrapper.find('ErrorMessage').text()).toBe('Passwords do not match');
      expect(wrapper.find(Button)).toHaveLength(0);
    });

    it('first password changes, then second changes too - button is visible', async () => {
      await type(wrapper.find('input[type="password"]').first(), 'aaaaaa');
      await type(wrapper.find('input[type="password"]').last(), 'aaaaaa');
      expect(wrapper.find(Button)).toHaveLength(1);
    });

    it('second password changes, then first changes too - button is visible', async () => {
      await type(wrapper.find('input[type="password"]').last(), 'aaaaaa');
      await type(wrapper.find('input[type="password"]').first(), 'aaaaaa');
      expect(wrapper.find(Button)).toHaveLength(1);
    });
  });
});
