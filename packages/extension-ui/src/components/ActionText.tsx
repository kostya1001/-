// Copyright 2019-2020 @polkadot/extension-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { MouseEventHandler } from 'react';
import Svg from '@polkadot/extension-ui/components/Svg';
import styled from 'styled-components';

interface Props {
  className?: string;
  icon?: string;
  onClick: MouseEventHandler<HTMLDivElement>;
  text: string;
}

function ActionText ({ className, icon, onClick, text }: Props): React.ReactElement<Props> {
  return (
    <div
      className={className}
      onClick={onClick}
    >
      {icon && <Svg src={icon} />}
      <span>{text}</span>
    </div>
  );
}

export default styled(ActionText)`
  cursor: pointer;

  span {
    font-size: ${({ theme }): string => theme.labelFontSize};
    line-height: ${({ theme }): string => theme.labelLineHeight};
    text-decoration-line: underline;
    color: ${({ theme }): string => theme.labelColor}
  }

  ${Svg} {
    background: ${({ theme }): string => theme.iconNeutralColor};
    display: inline-block;
    position: relative;
    top: 2px;
    width: 14px;
    height: 14px;
    margin-right: 6px;
  }
`;
