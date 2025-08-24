import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Conversation from './pages/conversation';
import Guid from './pages/guid';
import About from './pages/settings/About';
import GeminiSettings from './pages/settings/GeminiSettings';
import ModeSettings from './pages/settings/ModeSettings';
import SystemSettings from './pages/settings/SystemSettings';
import ThemeSettings from './pages/settings/ThemeSettings';
import { ThemeProvider } from './themes/provider';

const PanelRoute: React.FC<{ layout: React.ReactNode }> = (props) => {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route path='/' element={props.layout}>
            <Route index path='/' element={<Navigate to='/guid' />}></Route>
            <Route index path='/guid' element={<Guid />} />
            <Route path='/conversation/:id' element={<Conversation></Conversation>} />
            <Route path='/settings/gemini' element={<GeminiSettings />} />
            <Route path='/settings/model' element={<ModeSettings />} />
            <Route path='/settings/system' element={<SystemSettings />} />
            <Route path='/settings/themes' element={<ThemeSettings />} />
            <Route path='/settings/about' element={<About />} />
            <Route path='/settings' element={<Navigate to='/settings/gemini' />}></Route>
          </Route>
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
};

export default PanelRoute;
