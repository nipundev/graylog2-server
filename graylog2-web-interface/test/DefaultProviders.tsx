/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import * as React from 'react';
import { ThemeProvider } from 'styled-components';
import { defaultTimezone, defaultUser } from 'defaultMockValues';
import { COLOR_SCHEME_LIGHT } from '@graylog/sawmill';
import SawmillSC from '@graylog/sawmill/styled-components';
import SawmillMantine from '@graylog/sawmill/mantine';
import { MantineProvider } from '@mantine/core';

import CurrentUserContext from 'contexts/CurrentUserContext';
import UserDateTimeProvider from 'contexts/UserDateTimeProvider';

const themeSC = SawmillSC({ colorScheme: COLOR_SCHEME_LIGHT });
const themeMantine = SawmillMantine({ colorScheme: COLOR_SCHEME_LIGHT });

type Props = {
  children: React.ReactNode,
}

const DefaultProviders = ({ children }: Props) => (
  <CurrentUserContext.Provider value={defaultUser}>
    <MantineProvider theme={themeMantine}>
      <ThemeProvider theme={{ ...themeSC, changeMode: () => {}, mantine: themeMantine }}>
        <UserDateTimeProvider tz={defaultTimezone}>
          {children}
        </UserDateTimeProvider>
      </ThemeProvider>
    </MantineProvider>
  </CurrentUserContext.Provider>
);

export default DefaultProviders;
