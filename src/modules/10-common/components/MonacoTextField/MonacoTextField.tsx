import React from 'react'
import type { MonacoEditorProps } from 'react-monaco-editor'
import { FormikProps, connect } from 'formik'
import { get } from 'lodash-es'
import type { languages, IDisposable } from 'monaco-editor/esm/vs/editor/editor.api'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'
import { useDeepCompareEffect } from '@common/hooks'

import css from './MonacoTextField.module.scss'

type Languages = typeof languages

export interface MonacoTextFieldProps {
  name: string
  disabled?: boolean
  expressions?: string[]
  'data-testid'?: string
}

export interface ConnectedMonacoTextFieldProps extends MonacoTextFieldProps {
  formik: FormikProps<unknown>
}

const VAR_REGEX = /.*<\+.*?/
const LANG_ID = 'plaintext'

export function MonacoText(props: ConnectedMonacoTextFieldProps): React.ReactElement {
  const { formik, name, disabled, expressions } = props
  const value = get(formik.values, name) || ''

  useDeepCompareEffect(() => {
    let disposable: IDisposable | null = null

    if (Array.isArray(expressions) && expressions.length > 0) {
      const suggestions: Array<Partial<languages.CompletionItem>> = expressions
        .filter(label => label)
        .map(label => ({
          label,
          insertText: label + '>',
          kind: 13
        }))

      disposable = (monaco?.languages as Languages)?.registerCompletionItemProvider(LANG_ID, {
        triggerCharacters: ['+', '.'],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provideCompletionItems(model, position): any {
          const prevText = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 0,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          })

          if (VAR_REGEX.test(prevText)) {
            return { suggestions }
          }

          return { suggestions: [] }
        }
      })
    }

    return () => {
      disposable?.dispose()
    }
  }, [expressions])

  return (
    <div className={css.main}>
      <MonacoEditor
        height={300}
        value={value}
        language={LANG_ID}
        options={
          {
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 14,
            minimap: {
              enabled: false
            },
            readOnly: disabled,
            scrollBeyondLastLine: false,
            lineNumbers: 'off',
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0
          } as MonacoEditorProps['options']
        }
        onChange={txt => formik.setFieldValue(name, txt)}
        {...({ name: props.name, 'data-testid': props['data-testid'] } as any)} // this is required for test cases
      />
    </div>
  )
}

export const MonacoTextField = connect<MonacoTextFieldProps>(MonacoText)
