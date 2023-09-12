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
import React, { useCallback, useMemo, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import type { ColorScheme } from '@graylog/sawmill';
import SawmillSC from '@graylog/sawmill/styled-components';

import { DEFAULT_THEME_MODE } from './constants';

type Props = {
  children: React.ReactNode,
};

const usePreflightTheme = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(DEFAULT_THEME_MODE);

  const onChangeColorScheme = useCallback((nextMode: ColorScheme) => {
    setColorScheme(nextMode);
  }, []);

  return useMemo(() => {
    const theme = SawmillSC({ colorScheme });

    return ({
      ...theme,
      changeMode: onChangeColorScheme,
    });
  }, [colorScheme, onChangeColorScheme]);
};

const PreflightThemeProvider = ({ children }: Props) => {
  const theme = usePreflightTheme();

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

export default PreflightThemeProvider;
