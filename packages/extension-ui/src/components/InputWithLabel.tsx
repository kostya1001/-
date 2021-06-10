// Copyright 2019-2020 @polkadot/extension-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import styled from 'styled-components';

import Label from './Label';
import { Input } from './TextInputs';

interface Props {
  className?: string;
  defaultValue?: string | null;
  isError?: boolean;
  isFocused?: boolean;
  isReadOnly?: boolean;
  label: string;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  type?: 'text' | 'password';
  value?: string;
  placeholder?: string;
}

function InputWithLabel ({ className, defaultValue, isError, isFocused, isReadOnly, label, onBlur, onChange, placeholder, type = 'text', value }: Props): React.ReactElement<Props> {
  const _onChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    onChange && onChange(value.trim());
  };

  return (
    <Label
      className={className}
      label={label}
    >
      <Input
        autoCapitalize='off'
        autoCorrect='off'
        autoFocus={isFocused}
        defaultValue={defaultValue || undefined}
        onBlur={onBlur}
        onChange={_onChange}
        placeholder={placeholder}
        readOnly={isReadOnly}
        spellCheck={false}
        type={type}
        value={value}
        withError={isError}
      />
    </Label>
  );
}

export default styled(InputWithLabel)`
  margin-bottom: 16px;
`;
