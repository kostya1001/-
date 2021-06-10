// Copyright 2019-2020 @polkadot/extension authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ProviderMeta } from '@polkadot/extension-inject/types';
import { JsonRpcResponse, ProviderInterface, ProviderInterfaceCallback } from '@polkadot/rpc-provider/types';
import { RequestRpcSend, RequestRpcSubscribe, ResponseRpcListProviders, RequestRpcUnsubscribe } from '../types';
import { Providers } from './types';

import { assert } from '@polkadot/util';

export default class StateRpc {
  // Map of providers currently injected in tabs
  readonly #injected: Map<chrome.runtime.Port, ProviderInterface> = new Map();

  // Map of all providers exposed by the extension, they are retrievable by key
  readonly #providers: Providers;

  constructor (providers: Providers = {}) {
    this.#providers = providers;
  }

  // List all providers the extension is exposing
  public listProviders (): Promise<ResponseRpcListProviders> {
    return Promise.resolve(Object.keys(this.#providers).reduce((acc, key) => {
      acc[key] = this.#providers[key].meta;

      return acc;
    }, {} as ResponseRpcListProviders));
  }

  public send (request: RequestRpcSend, port: chrome.runtime.Port): Promise<JsonRpcResponse> {
    const provider = this.#injected.get(port);

    assert(provider, 'Cannot call pub(rpc.subscribe) before provider is set');

    return provider.send(request.method, request.params);
  }

  // Start a provider, return its meta
  public startProvider (key: string, port: chrome.runtime.Port): Promise<ProviderMeta> {
    assert(Object.keys(this.#providers).includes(key), `Provider ${key} is not exposed by extension`);

    if (this.#injected.get(port)) {
      return Promise.resolve(this.#providers[key].meta);
    }

    // Instantiate the provider
    this.#injected.set(port, this.#providers[key].start());

    // Close provider connection when page is closed
    port.onDisconnect.addListener((): void => {
      const provider = this.#injected.get(port);

      if (provider) {
        provider.disconnect();
      }

      this.#injected.delete(port);
    });

    return Promise.resolve(this.#providers[key].meta);
  }

  public subscribe ({ method, params, type }: RequestRpcSubscribe, cb: ProviderInterfaceCallback, port: chrome.runtime.Port): Promise<number> {
    const provider = this.#injected.get(port);

    assert(provider, 'Cannot call pub(rpc.subscribe) before provider is set');

    return provider.subscribe(type, method, params, cb);
  }

  public subscribeConnected (_request: null, cb: ProviderInterfaceCallback, port: chrome.runtime.Port): void {
    const provider = this.#injected.get(port);

    assert(provider, 'Cannot call pub(rpc.subscribeConnected) before provider is set');

    cb(null, provider.isConnected()); // Immediately send back current isConnected
    provider.on('connected', () => cb(null, true));
    provider.on('disconnected', () => cb(null, false));
  }

  public unsubscribe (request: RequestRpcUnsubscribe, port: chrome.runtime.Port): Promise<boolean> {
    const provider = this.#injected.get(port);

    assert(provider, 'Cannot call pub(rpc.unsubscribe) before provider is set');

    return provider.unsubscribe(request.type, request.method, request.subscriptionId);
  }
}
