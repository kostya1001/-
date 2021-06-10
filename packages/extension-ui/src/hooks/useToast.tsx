// Copyright 2019 @polkadot/extension-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useContext } from 'react';
import { ToastContext } from '../components/contexts';

export default function useToast (): {show: (message: string) => void} {
  return useContext(ToastContext);
}
