// Copyright 2019-2020 @polkadot/extension-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useCallback, useState } from 'react';

import { InputWithLabel, ValidatedInput } from '../components';
import { validateDerivationPath } from '../messaging';
import { Result } from '../validators';

interface Props {
  onChange: (derivedAccount: { address: string; suri: string } | null) => void;
  parentAddress: string;
  parentPassword: string;
}

function DerivationPath ({ onChange, parentAddress, parentPassword }: Props): React.ReactElement<Props> {
  const [path, setPath] = useState<string>('');

  const isPathValid = useCallback(async (path: string): Promise<Result<string>> => {
    try {
      await validateDerivationPath(parentAddress, path, parentPassword);

      return Result.ok(path);
    } catch (error) {
      return Result.error('Invalid derivation path');
    }
  }, [parentAddress, parentPassword]);

  const _onChange = useCallback(async (newPath: string | null) => {
    newPath && setPath(newPath);
    onChange(newPath ? await validateDerivationPath(parentAddress, newPath, parentPassword) : null);
  }, [parentAddress, onChange, parentPassword]);

  return (
    <ValidatedInput
      component={InputWithLabel}
      label='Derivation path'
      onValidatedChange={_onChange}
      placeholder='//hard/soft'
      validator={isPathValid}
      value={path}
    />
  );
}

export default DerivationPath;
