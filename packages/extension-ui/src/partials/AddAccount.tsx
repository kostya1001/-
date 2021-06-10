// Copyright 2019-2020 @polkadot/extension-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

import { ActionContext } from '../components';
import AddAccountImage from './AddAccountImage';
import Header from './Header';

interface Props {
  className?: string;
}

function AddAccount ({ className }: Props): React.ReactElement<Props> {
  const onAction = useContext(ActionContext);
  const _onClick = useCallback(
    (): void => onAction('/account/create'),
    [onAction]
  );

  return (
    <>
      <Header
        showSettings
        text={'Add Account'}
      />
      <div className={className}>
        <Image>
          <AddAccountImage onClick={_onClick}/>
        </Image>
        <div>
          <TipText>You currently don&apos;t have any accounts. Either create a new account or if you have an existing account you wish to use, import it with the seed phrase.</TipText>
        </div>
      </div>
    </>
  );
}

const TipText = styled.p`
  text-align: center;
  font-size: 16px;
  line-height: 26px;
  margin: 0 30px;
  color: ${({ theme }): string => theme.subTextColor};
`;

const Image = styled.div`
  display: flex;
  justify-content: center;
`;

export default styled(AddAccount)`
  color: ${({ theme }): string => theme.textColor};
  height: 100%;

  h3 {
    color: ${({ theme }): string => theme.textColor};
    margin-top: 0;
    font-weight: normal;
    font-size: 24px;
    line-height: 33px;
    text-align: center;
  }
`;
