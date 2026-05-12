/**
 * ## RichTextEditor
 *
 * Custom rich text editor component with formik integration using Quill.js.
 * Provides WYSIWYG editing capabilities with toolbar options.
 *
 * @param {RichTextEditorProps} props - Props for the RichTextEditor component.
 *
 * #### Example
 *
 * ```js
 * import React from "react";
 * import { RichTextEditor } from "react-mkx-components";
 * import { useFormik } from "formik";
 * const MyComponent = () => {
 *   const formik = useFormik({
 *     initialValues: {
 *       description: "",
 *     },
 *     onSubmit: (values) => {
 *       console.log(values);
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       <RichTextEditor
 *         name="description"
 *         label="Description"
 *         placeholder="Enter description..."
 *         formik={formik}
 *         height={400}
 *         theme="snow"
 *         formats={['bold', 'italic', 'list']}
 *         debug={false}
 *       />
 *     </div>
 *   );
 * };
 *
 * export default MyComponent;
 * ```
 * 
 * #### Configuration Options
 * 
 * - **theme**: 'snow' | 'bubble' - Theme to use (default: 'snow')
 * - **formats**: string[] | null - Allowed formats (default: all formats)
 * - **debug**: 'error' | 'warn' | 'log' | 'info' | false - Debug level (default: false)
 * - **bounds**: string | HTMLElement - Boundary for UI elements (default: document.body)
 * - **toolbar**: Custom toolbar configuration (default: full toolbar)
 * - **readOnly**: boolean - Read-only mode (default: false)
 * - **height**: string | number - Editor height (default: 400)
 */
import { Box, Typography, type BoxProps } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import type { FormikProps } from 'formik';

import 'quill/dist/quill.snow.css';

interface RichTextEditorProps extends Omit<BoxProps, 'onChange'> {
    formik?: FormikProps<any>;
    setValue?: (value: any) => void;
    onChange?: (value: string) => void;
    name?: string;
    label?: string;
    placeholder?: string;
    value?: string;
    height?: string | number;
    readOnly?: boolean;
    toolbar?: any;
    theme?: 'snow' | 'bubble';
    formats?: string[] | null;
    debug?: 'error' | 'warn' | 'log' | 'info' | false;
    bounds?: string | HTMLElement;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    formik,
    setValue,
    onChange,
    name,
    label,
    placeholder = 'Enter text...',
    value,
    height = 400,
    readOnly = false,
    toolbar,
    theme = 'snow',
    formats,
    debug = false,
    bounds,
    className = '',
    ...rest
}) => {
    const quillRef = useRef<Quill | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    const defaultToolbar = [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
    ];

    const editorToolbar = toolbar || defaultToolbar;

    useEffect(() => {
        if (quillRef.current) return;

        if (containerRef.current) {
            containerRef.current.innerHTML = '';

            quillRef.current = new Quill(containerRef.current, {
                theme,
                placeholder,
                readOnly,
                debug,
                bounds,
                formats,
                modules: {
                    toolbar: editorToolbar,
                },
            });

            const editorElement = quillRef.current.root;
            editorElement.style.minHeight = `${height}px`;
            editorElement.style.height = `${height}px`;

            const editorContent = quillRef.current.root.querySelector('.ql-editor') as HTMLElement;
            if (editorContent) {
                editorContent.style.minHeight = `${height}px`;
            }

            const currentValue = value || (formik?.values?.[name || '']) || '';
            if (currentValue) {
                quillRef.current.root.innerHTML = currentValue;
            }

            quillRef.current.on('text-change', () => {
                const html = quillRef.current?.root.innerHTML || '';

                const cleanHtml = html === '<p><br></p>' ? '' : html;

                if (formik && name) {
                    formik.setFieldValue(name, cleanHtml);
                } else if (setValue) {
                    setValue(cleanHtml);
                } else if (onChange) {
                    onChange(cleanHtml);
                }
            });
        }

        return () => {
            if (quillRef.current) {
                quillRef.current.off('text-change');
                const container = quillRef.current.container;
                if (container && container.parentNode) {
                    container.parentNode.removeChild(container);
                }
                quillRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (quillRef.current) {
            const currentValue = value || (formik?.values?.[name || '']) || '';
            const currentEditorContent = quillRef.current.root.innerHTML;

            if (currentValue !== currentEditorContent) {
                quillRef.current.root.innerHTML = currentValue || '';
            }
        }
    }, [value, formik?.values, name]);

    useEffect(() => {
        if (quillRef.current) {
            quillRef.current.enable(!readOnly);
        }
    }, [readOnly]);

    const error = formik?.touched?.[name || ''] && formik?.errors?.[name || ''];
    const errorMessage = typeof error === 'string' ? error : undefined;

    const heightNumber = typeof height === 'string' ? parseInt(height) : height;
    const editorHeight = heightNumber - 40;

    return (
        <Box className={`rich-text-editor flex flex-col ${className}`} {...rest}>
            {label && (
                <Typography
                    variant="body1"
                    className="!font-medium !mb-2 !text-gray-700"
                    component="label"
                >
                    {label}
                </Typography>
            )}
            <Box
                ref={editorRef}
                className="!border !border-gray-300 !rounded-lg !overflow-hidden"
                sx={{
                    height: `${heightNumber}px`,
                    '& .ql-toolbar': {
                        backgroundColor: '#f9fafb',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        borderBottom: '1px solid #e5e7eb',
                    },
                    '& .ql-container': {
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        height: `${editorHeight}px`,
                        '&.ql-blank::before': {
                            fontStyle: 'normal',
                            color: '#9ca3af',
                        },
                    },
                    '& .ql-editor': {
                        height: `${editorHeight}px`,
                        padding: '12px 16px',
                        '&.ql-blank::before': {
                            fontStyle: 'normal',
                            color: '#9ca3af',
                        },
                    },
                    ...(error && {
                        '& .ql-toolbar': {
                            borderColor: '#ef4444',
                        },
                        '& .ql-container': {
                            borderColor: '#ef4444',
                        },
                    }),
                }}
            >
                <div ref={containerRef} />
            </Box>
            {errorMessage && (
                <Typography
                    variant="caption"
                    className="!text-red-500 !mt-1 !block"
                >
                    {errorMessage}
                </Typography>
            )}
        </Box>
    );
};

export default RichTextEditor;
export type { RichTextEditorProps };
