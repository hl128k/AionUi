import { ArrowCircleLeft, Plus, SettingTwo, Moon, SunOne } from '@icon-park/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSimpleTheme } from './themes/simple-provider';
import ChatHistory from './pages/conversation/ChatHistory';
import SettingsSider from './pages/settings/SettingsSider';

const Sider: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toggleTheme, currentTheme } = useSimpleTheme();
  const isSettings = pathname.startsWith('/settings');

  return (
    <div className='o-slider-menu size-full flex flex-col'>
      {isSettings ? (
        <SettingsSider></SettingsSider>
      ) : (
        <>
          <div
            className='o-slider-menu flex items-center justify-start gap-10px px-12px py-8px rd-0.5rem mb-8px cursor-pointer group'
            onClick={() => {
              navigate('/guid');
            }}
          >
            <Plus theme='outline' size='24' className='o-icon-color flex' />
            <span className='collapsed-hidden font-bold'>{t('conversation.welcome.newConversation')}</span>
          </div>
          <ChatHistory></ChatHistory>
        </>
      )}

      {/* 主题切换按钮 */}
      <div onClick={toggleTheme} className='o-slider-menu flex items-center justify-start gap-10px px-12px py-8px rd-0.5rem mb-8px cursor-pointer' title={`切换到${currentTheme.mode === 'light' ? '黑暗' : '明亮'}主题`}>
        {currentTheme.mode === 'light' ? <Moon className='o-icon-color flex' theme='outline' size='24' /> : <SunOne className='o-icon-color flex' theme='outline' size='24' />}
        <span className='collapsed-hidden'>{currentTheme.mode === 'light' ? '黑暗模式' : '明亮模式'}</span>
      </div>

      <div
        onClick={() => {
          if (isSettings) return navigate('/guid');
          navigate('/settings');
        }}
        className='o-slider-menu flex items-center justify-start gap-10px px-12px py-8px rd-0.5rem mb-8px cursor-pointer'
      >
        {isSettings ? <ArrowCircleLeft className='o-icon-color flex' theme='outline' size='24' /> : <SettingTwo className='o-icon-color flex' theme='outline' size='24' />}
        <span className='collapsed-hidden'>{isSettings ? t('common.back') : t('common.settings')}</span>
      </div>
    </div>
  );
};

export default Sider;
