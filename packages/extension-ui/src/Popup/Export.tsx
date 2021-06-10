// Copyright 2019-2020 @polkadot/extension-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useContext, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { ActionContext, Address, Button, InputWithLabel, Warning, ActionText, ActionBar } from '../components';
import { exportAccount } from '../messaging';
import { Header } from '../partials';
import styled from 'styled-components';

const MIN_LENGTH = 6;

type Props = RouteComponentProps<{ address: string }>;

function Export ({ match: { params: { address } } }: Props): React.ReactElement<Props> {
  const onAction = useContext(ActionContext);

  const [pass, setPass] = useState('');
  const [wrongPasswordHighlight, setWrongPasswordHighlight] = useState(false);

  const _onExportButtonClick = (): Promise<void> =>
    exportAccount(address, pass)
      .then(({ exportedJson }) => {
        const element = document.createElement('a');

        element.href = `data:text/plain;charset=utf-8,${exportedJson}`;
        element.download = `${JSON.parse(exportedJson).meta.name}_exported_account_${Date.now()}.json`;
        element.click();
        onAction('/');
      })
      .catch((error: Error) => {
        console.error(error);
        setWrongPasswordHighlight(true);
        setTimeout(() => setWrongPasswordHighlight(false), 100);
      });

  return (
    <>
      <Header
        showBackArrow
        text='Export account'
      />
      <div>
        <Address address={address}>
          <MovedWarning danger>You are exporting your account. Keep it safe and don&apos;t share it with anyone.</MovedWarning>
          <ActionArea>
            <InputWithLabel
              data-export-password
              isError={pass.length < MIN_LENGTH || wrongPasswordHighlight}
              label='password for this account'
              onChange={setPass}
              type='password'
            />
            <Button
              className='export-button'
              data-export-button
              isDanger
              isDisabled={pass.length === 0}
              onClick={_onExportButtonClick}
            >
              I want to export this account
            </Button>
            <CancelButton>
              <ActionText
                onClick={(): void => onAction('/')}
                text='Cancel'
              />
            </CancelButton>
          </ActionArea>
        </Address>
      </div>
    </>
  );
}

const MovedWarning = styled(Warning)`
  margin-top: 8px;
`;

const ActionArea = styled.div`
  padding: 10px 24px;
`;

const CancelButton = styled(ActionBar)`
  margin-top: 4px;
  text-decoration: underline;

  ${ActionText} {
    margin: auto;
  }
`;

export default withRouter(Export);
