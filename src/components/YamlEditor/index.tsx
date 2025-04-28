import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { Spin } from 'antd';

// 初始化 YAML 语言支持（只需执行一次）
const initYamlLanguage = () => {
  try {
    // 注册 YAML 语言
    monaco.languages.register({ id: 'yaml' });

    // 配置 YAML 语言的语法高亮规则
    // monaco.languages.setMonarchTokensProvider('yaml', {
    //   tokenizer: {
    //     root: [
    //       [/^[\t ]*#.*$/, 'comment'],
    //       [/^[\t ]*-/, 'delimiter'],
    //       [/^[\t ]*[\w]+(?=:)/, 'type'],
    //       [/^[\t ]*[\w]+[?:]/, 'type'],
    //       [/:/, 'delimiter'],
    //       [/[&*][a-zA-Z0-9-_]+/, 'tag'],
    //       [/\$\{[^}]+\}/, 'variable'],
    //       [/\[[^\]]+\]/, 'string'],
    //       [/"[^"]*"/, 'string'],
    //       [/'[^']*'/, 'string'],
    //       [/[0-9]+(\.[0-9]+)?/, 'number'],
    //       [/\b(true|false|null|on|off)\b/, 'keyword'],
    //       [/\b[\w-]+\b/, 'identifier'],
    //     ],
    //   },
    // });

    // 配置 YAML 语言的自动完成
    monaco.languages.registerCompletionItemProvider('yaml', {
      provideCompletionItems: () => {
        return {
          suggestions: [],
        };
      },
    });
  } catch (error) {
    console.error('初始化 YAML 语言支持失败:', error);
  }
};

// 在模块加载时执行一次 YAML 语言初始化
try {
  initYamlLanguage();
} catch (error) {
  console.error('YAML 语言初始化失败', error);
}

interface YamlEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string | number;
  width?: string | number;
}

const YamlEditor: React.FC<YamlEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  height = '400px',
  width = '100%',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 确保容器元素存在
    if (!containerRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // 如果编辑器已经存在，销毁它以防止内存泄漏
      if (editorRef.current) {
        editorRef.current.dispose();
      }

      // 创建编辑器实例
      editorRef.current = monaco.editor.create(containerRef.current, {
        value,
        language: 'yaml',
        readOnly,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        minimap: { enabled: true },
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        wordWrap: 'on',
        fontSize: 14,
        tabSize: 2,
        theme: 'vs-dark',
      });

      setIsLoading(false);

      // 添加内容变更监听
      if (onChange) {
        const disposable = editorRef.current.onDidChangeModelContent(() => {
          const newValue = editorRef.current?.getValue();
          if (newValue !== undefined) {
            onChange(newValue);
          }
        });

        // 清理函数，在组件卸载时执行
        return () => {
          disposable.dispose();
          if (editorRef.current) {
            editorRef.current.dispose();
          }
        };
      }
    } catch (err) {
      console.error('创建编辑器失败:', err);
      setError('初始化编辑器失败，请检查控制台以获取更多信息');
      setIsLoading(false);
    }

    // 组件卸载时清理编辑器实例
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []); // 只在组件挂载时执行

  // 当 value 发生变化时更新编辑器内容
  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      if (value !== currentValue) {
        editorRef.current.setValue(value);
      }
    }
  }, [value]);

  // 当 readOnly 属性变化时更新编辑器
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly });
    }
  }, [readOnly]);

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <Spin spinning={isLoading} tip="加载编辑器中...">
      <div
        ref={containerRef}
        style={{
          height: typeof height === 'number' ? `${height}px` : height,
          width: typeof width === 'number' ? `${width}px` : width,
        }}
      />
    </Spin>
  );
};

export default YamlEditor;
