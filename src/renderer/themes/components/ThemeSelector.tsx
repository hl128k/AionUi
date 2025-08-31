import React from 'react';
import { Button, Card, Form, Input, Radio, Select, Space, Message, Table } from '@arco-design/web-react';
import { useTheme } from '../provider';
import { BUILTIN_PRESETS } from '../presets';
import { loadYamlPreset } from '../presets/index';
import { parseAuto, toYAML } from '../yaml-utils';
// Use extended IPC helpers to avoid tight coupling with existing bridge declarations
import * as ipcEx from '@/common/ipcBridgeEx';
import { parseDesignVariablesFromMarkdown, normalizeDarkKeys } from '../docs-parser';
import { themeManager } from '../manager';
import { getAllI18nKeys } from '../i18n-theme-manager';
import { THEME_VARIABLE_KEYS } from '../variables';

const ThemeSelector: React.FC = () => {
  const { themeId, mode, setMode, setTheme, list, exportTheme, importTheme } = useTheme();
  const [fileHandle, setFileHandle] = React.useState<File | null>(null);
  const [json, setJson] = React.useState('');
  const [i18nKey, setI18nKey] = React.useState('title');
  const [i18nStyle, setI18nStyle] = React.useState({ colorVar: '--color-text-1', fontSize: '16px', fontWeight: 600 } as any);
  const [i18nKeys, setI18nKeys] = React.useState<string[]>([]);

  React.useEffect(() => {
    try {
      setI18nKeys(getAllI18nKeys());
    } catch (_err) {
      // Ignore errors during i18n key initialization
      void 0;
    }
  }, []);

  return (
    <Card>
      <Space direction='vertical' style={{ width: '100%' }} size='large'>
        <Form layout='vertical'>
          <Form.Item label='主题'>
            <Select value={themeId} onChange={(v) => setTheme(v)} style={{ width: 260 }}>
              {list.map((t) => (
                <Select.Option key={t.id} value={t.id}>
                  {t.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label='导入内置预设'>
            <Space>
              {BUILTIN_PRESETS.map((p) => (
                <Button key={p.id} onClick={() => importTheme(JSON.stringify(p))}>
                  {p.name}
                </Button>
              ))}
            </Space>
          </Form.Item>
          <Form.Item label='从文件导入 (JSON/YAML)'>
            <input
              type='file'
              accept='.json,.yaml,.yml,application/json,application/x-yaml,text/yaml'
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const text = await f.text();
                // 先按 YAML/JSON 预设装载 ThemePack
                const preset = await loadYamlPreset(text);
                if (preset) return importTheme(JSON.stringify(preset));
                const data = parseAuto(text); // fallback
                if (data) return importTheme(JSON.stringify(data));
              }}
            />
          </Form.Item>
          <Form.Item label='保存为文件 (JSON/YAML)'>
            <Space>
              <Button
                onClick={async () => {
                  const data = exportTheme(themeId);
                  if (!data) return;
                  const fullPath = await ipcEx.showSave.invoke({ defaultPath: `theme-${themeId}.json`, filters: [{ name: 'JSON', extensions: ['json'] }] });
                  if (!fullPath) return;
                  const res = await ipcEx.saveTextFile.invoke({ fullPath, content: data });
                  if (!res.success) Message.error(res.msg || '保存失败');
                  else Message.success('已保存');
                }}
              >
                另存为 JSON
              </Button>
              <Button
                onClick={async () => {
                  const data = exportTheme(themeId);
                  if (!data) return;
                  const yaml = toYAML(JSON.parse(data));
                  const fullPath = await ipcEx.showSave.invoke({ defaultPath: `theme-${themeId}.yaml`, filters: [{ name: 'YAML', extensions: ['yaml', 'yml'] }] });
                  if (!fullPath) return;
                  const res = await ipcEx.saveTextFile.invoke({ fullPath, content: yaml });
                  if (!res.success) Message.error(res.msg || '保存失败');
                  else Message.success('已保存');
                }}
              >
                另存为 YAML
              </Button>
            </Space>
          </Form.Item>
          <Form.Item label='从设计变量文档导入'>
            <Space>
              <Button
                onClick={async () => {
                  Message.info('请将设计变量文档内容复制到下方文本框后点击“从下方文本解析并合入”');
                }}
              >
                选择文档文件
              </Button>
              <Button
                type='primary'
                onClick={() => {
                  // 尝试从下方文本区解析
                  const keys = parseDesignVariablesFromMarkdown(json);
                  const norm = normalizeDarkKeys(keys);
                  const data = exportTheme(themeId);
                  if (!data) return;
                  const pack = JSON.parse(data);
                  // 将解析出来的变量键补充到当前模式下的变量 map（若不存在则空值）
                  const target = mode === 'dark' ? pack.dark.variables : pack.light.variables;
                  norm.forEach((k) => {
                    if (!(k in target)) target[k] = target[k] || '';
                  });
                  themeManager.upsertTheme(pack);
                  // 立即刷新 DOM 变量
                  themeManager.applyToDOM(document.body);
                  Message.success(`已合入 ${norm.length} 个变量键`);
                }}
              >
                从下方文本解析并合入
              </Button>
            </Space>
          </Form.Item>
          <Form.Item label='i18n 关键字样式'>
            <Space direction='vertical' style={{ width: '100%' }}>
              <Space>
                {/* 全量 i18n key 选择器（可搜索，支持 * 与 a.b.* 规则）*/}
                <Select showSearch allowClear placeholder='选择或搜索 i18n key（支持 * 与 a.b.*）' value={i18nKey} onChange={setI18nKey} style={{ width: 420 }}>
                  <Select.Option key='*' value='*'>
                    *
                  </Select.Option>
                  {i18nKeys.map((k) => (
                    <Select.Option key={k} value={k}>
                      {k}
                    </Select.Option>
                  ))}
                </Select>
                <Input placeholder='i18n key，例如 title' value={i18nKey} onChange={setI18nKey} style={{ width: 220 }} />
                {/* 颜色变量下拉（从 variables 列表选择），也保留手动输入 */}
                <Select showSearch allowClear placeholder='选择颜色变量，例如 --color-text-1' value={i18nStyle.colorVar} onChange={(v) => setI18nStyle((s: any) => ({ ...s, colorVar: v || undefined }))} style={{ width: 320 }}>
                  {THEME_VARIABLE_KEYS.map((v) => (
                    <Select.Option key={v} value={v}>
                      {v}
                    </Select.Option>
                  ))}
                </Select>
                <Input placeholder='颜色 CSS 变量，如 --color-text-1' value={i18nStyle.colorVar} onChange={(v) => setI18nStyle((s: any) => ({ ...s, colorVar: v }))} style={{ width: 240 }} />
                <Input placeholder='字体大小，如 16px' value={i18nStyle.fontSize} onChange={(v) => setI18nStyle((s: any) => ({ ...s, fontSize: v }))} style={{ width: 160 }} />
                <Input placeholder='字重，如 600' value={String(i18nStyle.fontWeight || '')} onChange={(v) => setI18nStyle((s: any) => ({ ...s, fontWeight: Number(v) || undefined }))} style={{ width: 120 }} />
              </Space>
              <Space>
                <Button
                  type='primary'
                  onClick={() => {
                    const data = exportTheme(themeId);
                    if (!data) return;
                    const pack = JSON.parse(data);
                    const target = mode === 'dark' ? pack.dark : pack.light;
                    target.i18nStyles = target.i18nStyles || {};
                    target.i18nStyles[i18nKey] = i18nStyle;
                    importTheme(JSON.stringify(pack));
                    Message.success('已更新 i18n 样式');
                  }}
                >
                  保存样式
                </Button>
                <span>预览：</span>
                <span data-i18n-key={i18nKey}>示例文本</span>
              </Space>
            </Space>
          </Form.Item>
          <Form.Item label='模式'>
            <Radio.Group value={mode} onChange={setMode} type='button'>
              <Radio value='light'>明亮</Radio>
              <Radio value='dark'>黑暗</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label='导入主题 JSON/YAML'>
            <Input.TextArea value={json} onChange={setJson} placeholder='粘贴导入的主题 JSON 或 YAML' autoSize />
            <Space style={{ marginTop: 8 }}>
              <Button
                type='primary'
                onClick={() => {
                  const data = parseAuto(json);
                  if (data) {
                    importTheme(JSON.stringify(data));
                  }
                }}
              >
                导入
              </Button>
              <Button onClick={() => setJson(exportTheme(themeId) || '')}>导出为 JSON 到下方</Button>
              <Button
                onClick={() => {
                  const data = exportTheme(themeId);
                  if (data) setJson(toYAML(JSON.parse(data)));
                }}
              >
                导出为 YAML 到下方
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  );
};

export default ThemeSelector;
