// Copyright 2019-2020 @polkadot/extension-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import styled from 'styled-components';

interface Props {
  banner?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function Box ({ banner, children, className }: Props): React.ReactElement<Props> {
  return (
    <article className={className}>
      {children}
      {banner && <div className='banner'>{banner}</div>}
    </article>
  );
}

export default styled(Box)`
  background: ${({ theme }): string => theme.readonlyInputBackground};
  border: none;
  border-radius: ${({ theme }): string => theme.borderRadius};
  color: ${({ theme }): string => theme.textColor};
  font-family: ${({ theme }): string => theme.fontFamily};
  font-size: ${({ theme }): string => theme.fontSize};
  margin: ${({ theme }): string => theme.boxMargin};
  padding: ${({ theme }): string => theme.boxPadding};
  position: relative;

  .banner {
    background: darkorange;
    border-radius: 0 ${({ theme }): string => theme.borderRadius} 0 ${({ theme }): string => theme.borderRadius};
    color: white;
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    position: absolute;
    right: 0;
    top: 0;
  }
`;
