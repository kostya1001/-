// Copyright 2019-2020 @polkadot/extension-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import styled from 'styled-components';

interface Props {
  className?: string;
  icon: string;
  onClick?: () => void | Promise<void>;
}

function Icon ({ className, icon, onClick }: Props): React.ReactElement<Props> {
  return (
    <div
      className={`${className} icon`}
      onClick={onClick}
    >
      {icon}
    </div>
  );
}

export default styled(Icon)`
  background: white;
  border-radius: 50%;
  box-sizing: border-box;
  cursor: ${({ onClick }): string =>
    onClick
      ? 'pointer'
      : 'inherit'};
  text-align: center;
`;
