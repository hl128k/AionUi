/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ThemeProvider } from '@/renderer/themes';
import Layout from './layout';
import Router from './router';
import Sider from './sider';

const Main = () => {
  return (
    <ThemeProvider>
      <Router layout={<Layout sider={<Sider></Sider>}></Layout>}></Router>
    </ThemeProvider>
  );
};

export default Main;
