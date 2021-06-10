// Copyright 2019-2020 @polkadot/extension-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '../../../../../__mocks__/chrome';

import React, { useState } from 'react';
import Adapter from 'enzyme-adapter-react-16';

import { configure, mount, ReactWrapper } from 'enzyme';
import { act } from 'react-dom/test-utils';
import * as messaging from '@polkadot/extension-ui/messaging';
import { SigningRequest } from '@polkadot/extension-base/background/types';
import { flushAllPromises } from '@polkadot/extension-ui/testHelpers';
import { ActionContext, Address, Button, Input, SigningReqContext, themes } from '@polkadot/extension-ui/components';
import { ThemeProvider } from 'styled-components';
import Signing from '.';
import TransactionIndex from './TransactionIndex';
import Request from './Request';
import Extrinsic from './Extrinsic';
import Qr from './Qr';
import { EventEmitter } from 'events';

configure({ adapter: new Adapter() });

describe.skip('Signing requests', () => {
  let wrapper: ReactWrapper;
  let onActionStub: jest.Mock;
  let signRequests: SigningRequest[] = [];

  const emitter = new EventEmitter();

  function MockRequestsProvider (): React.ReactElement {
    const [requests, setRequests] = useState(signRequests);

    emitter.on('request', setRequests);

    return (
      <SigningReqContext.Provider value={requests}>
        <Signing />
      </SigningReqContext.Provider>
    );
  }

  const mountComponent = async (): Promise<void> => {
    wrapper = mount(
      <ActionContext.Provider value={onActionStub}>
        <ThemeProvider theme={themes.dark}>
          <MockRequestsProvider />
        </ThemeProvider>
      </ActionContext.Provider>
    );
    await act(flushAllPromises);
    wrapper.update();
  };

  beforeEach(async () => {
    jest.spyOn(messaging, 'cancelSignRequest').mockResolvedValue(true);
    jest.spyOn(messaging, 'approveSignPassword').mockResolvedValue(true);
    signRequests = [{ // 0.031415926500000 DOT -> 5D4bqjQRPgdMBK8bNvhX4tSuCtSGZS7rZjD5XH5SoKcFeKn5
      account: {
        address: '5D4bqjQRPgdMBK8bNvhX4tSuCtSGZS7rZjD5XH5SoKcFeKn5',
        name: 'acc1'
      },
      id: '1574174715509.78',
      request: {
        inner: {
          address: '5D4bqjQRPgdMBK8bNvhX4tSuCtSGZS7rZjD5XH5SoKcFeKn5',
          blockHash: '0xc288fbc472dab27d13ce58212eeb1243f460c5b0f9a65e9de97cbbf9bc761cb0',
          blockNumber: '0x00000000003d8c4a',
          era: '0xa500',
          genesisHash: '0xdcd1346701ca8396496e52aa2785b1748deb6db09551b72159dcb3e08991025b',
          method: '0x0300ff2c27fb3518d84bfad60f39b2cb5502947746ca5921fd66dccc861bad5c9a65220ba0aa2397921c',
          nonce: '0x0000000000000000',
          specVersion: '0x00000070',
          tip: '0x00000000000000000000000000000000',
          version: 1
        },
        sign: jest.fn()
      },
      url: 'polkadot.js'
    }, { // 10000000000 nDOT -> 5D1ss3KFnzNtLzRDfUhqLivzVvt5BDrBnK21dMf1si2twPuj
      account: {
        address: '5E9nq1yGJJFiP8C75ryD9J2R62q2cesz6NumLnuXRgmuN5DG',
        name: 'acc2'
      },
      id: '1574174306604.76',
      request: {
        inner: {
          address: '5E9nq1yGJJFiP8C75ryD9J2R62q2cesz6NumLnuXRgmuN5DG',
          blockHash: '0xf3b92cf71c84762ba1cb59dc4fd192f1824171a96b43bce44ceb0671b378d15a',
          blockNumber: '0x00000000003d8e9d',
          era: '0xd501',
          genesisHash: '0xdcd1346701ca8396496e52aa2785b1748deb6db09551b72159dcb3e08991025b',
          method: '0x0300ff2a142e8c67a1ddcf6241f4fabf55a0bb0ee41d8a681ab3b3662a75037025967c0700e40b5402',
          nonce: '0x0000000000000000',
          specVersion: '0x00000070',
          tip: '0x00000000000000000000000000000000',
          version: 1
        },
        sign: jest.fn()
      },
      url: 'polkadot.js'
    }];
    onActionStub = jest.fn();
    await mountComponent();
  });

  describe('Switching between requests', () => {
    it('initially first request should be shown', () => {
      expect(wrapper.find(TransactionIndex).text()).toBe('1/2');
      expect(wrapper.find(Request).prop('signId')).toBe(signRequests[0].id);
    });

    it('only ArrowRight should be active on first screen', () => {
      expect(wrapper.find('ArrowLeft').prop('isActive')).toBe(false);
      expect(wrapper.find('ArrowRight').prop('isActive')).toBe(true);
      wrapper.find('ArrowLeft').simulate('click');
      expect(wrapper.find(TransactionIndex).text()).toBe('1/2');
    });

    it('should display second request after clicking right arrow', () => {
      wrapper.find('ArrowRight').simulate('click');
      expect(wrapper.find(TransactionIndex).text()).toBe('2/2');
      expect(wrapper.find(Request).prop('signId')).toBe(signRequests[1].id);
    });

    it('only ArrowLeft should be active on second screen', () => {
      wrapper.find('ArrowRight').simulate('click');
      expect(wrapper.find('ArrowLeft').prop('isActive')).toBe(true);
      expect(wrapper.find('ArrowRight').prop('isActive')).toBe(false);
      expect(wrapper.find(TransactionIndex).text()).toBe('2/2');
    });

    it('should display previous request after ArrowLeft has been clicked', () => {
      wrapper.find('ArrowRight').simulate('click');
      wrapper.find('ArrowLeft').simulate('click');
      expect(wrapper.find(TransactionIndex).text()).toBe('1/2');
      expect(wrapper.find(Request).prop('signId')).toBe(signRequests[0].id);
    });
  });

  describe('External account', () => {
    it('shows Qr scanner for external accounts', async () => {
      signRequests = [{
        account: {
          address: '5Cf1CGZas62RWwce3d2EPqUvSoi1txaXKd9M5w9bEFSsQtRe',
          isExternal: true,
          name: 'external'
        },
        id: '1574174306604.76',
        request: {
          inner: {
            address: '5Cf1CGZas62RWwce3d2EPqUvSoi1txaXKd9M5w9bEFSsQtRe',
            blockHash: '0xf3b92cf71c84762ba1cb59dc4fd192f1824171a96b43bce44ceb0671b378d15a',
            blockNumber: '0x00000000003d8e9d',
            era: '0xd501',
            genesisHash: '0xdcd1346701ca8396496e52aa2785b1748deb6db09551b72159dcb3e08991025b',
            method: '0x0300ff2a142e8c67a1ddcf6241f4fabf55a0bb0ee41d8a681ab3b3662a75037025967c0700e40b5402',
            nonce: '0x0000000000000000',
            specVersion: '0x00000070',
            tip: '0x00000000000000000000000000000000',
            version: 1
          },
          sign: jest.fn()
        },
        url: 'polkadot.js'
      }];
      await mountComponent();
      expect(wrapper.find(Extrinsic)).toHaveLength(0);
      expect(wrapper.find(Qr)).toHaveLength(1);
    });
  });

  describe('Request rendering', () => {
    it('correctly displays request 1', () => {
      expect(wrapper.find(Address).find('FullAddress').text()).toBe('5D4bqjQRPgdMBK8bNvhX4tSuCtSGZS7rZjD5XH5SoKcFeKn5');
      expect(wrapper.find(Extrinsic).find('td.data').map((el): string => el.text())).toEqual([
        'polkadot.js',
        'Alexander',
        '112',
        '0',
        'balances.transfer',
        `{
  "dest": "5D4bqjQRPgdMBK8bNvhX4tSuCtSGZS7rZjD5XH5SoKcFeKn5",
  "value": 31415926500000
}`,
        ' Transfer some liquid free balance to another account.   `transfer` will set the `FreeBalance` of the sender and receiver.  It will decrease the total issuance of the system by the `TransferFee`.  If the sender\'s account is below the existential deposit as a result  of the transfer, the account will be reaped.   The dispatch origin for this call must be `Signed` by the transactor.',
        'mortal, valid from #4,033,610 to #4,033,674'
      ]);
    });

    it('correctly displays request 2', () => {
      wrapper.find('ArrowRight').simulate('click');
      expect(wrapper.find(Address).find('FullAddress').text()).toBe('5E9nq1yGJJFiP8C75ryD9J2R62q2cesz6NumLnuXRgmuN5DG');
      expect(wrapper.find(Extrinsic).find('td.data').at(5).text()).toBe(`{
  "dest": "5D1ss3KFnzNtLzRDfUhqLivzVvt5BDrBnK21dMf1si2twPuj",
  "value": 10000000000
}`);
    });
  });

  describe('Submitting', () => {
    it('passes request id to cancel call', () => {
      wrapper.find('CancelButton').find('a').simulate('click');
      expect(messaging.cancelSignRequest).toBeCalledWith(signRequests[0].id);
    });

    it('passes request id and password to approve call', () => {
      wrapper.find(Input).simulate('change', { target: { value: 'hunter1' } });
      wrapper.find(Button).find('button').simulate('click');
      expect(messaging.approveSignPassword).toBeCalledWith(signRequests[0].id, 'hunter1');
    });

    it('when last request has been removed/cancelled, shows the previous one', () => {
      wrapper.find('ArrowRight').simulate('click');
      act(() => {
        emitter.emit('request', [signRequests[0]]);
      });
      wrapper.update();
      expect(wrapper.find(TransactionIndex)).toHaveLength(0);
      expect(wrapper.find(Request).prop('signId')).toBe(signRequests[0].id);
    });
  });
});
