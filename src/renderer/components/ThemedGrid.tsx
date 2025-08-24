/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

/**
 * 内部主题化Grid组件，替换Arco Design Grid
 * 完全受控于我们自己的主题系统
 */

export type GridSize = 'small' | 'medium' | 'large';
export type GridAlign = 'top' | 'middle' | 'bottom';
export type GridJustify = 'start' | 'center' | 'end' | 'space-around' | 'space-between' | 'space-evenly';
export type GridGutter = number | [number, number];

export interface ThemedGridProps {
  className?: string;
  children: ReactNode;
  columns?: number;
  gutter?: GridGutter;
  align?: GridAlign;
  justify?: GridJustify;
  wrap?: boolean;
  style?: React.CSSProperties;
}

export interface ThemedColProps {
  className?: string;
  children: ReactNode;
  span?: number;
  offset?: number;
  order?: number;
  push?: number;
  pull?: number;
  xs?: number | { span?: number; offset?: number };
  sm?: number | { span?: number; offset?: number };
  md?: number | { span?: number; offset?: number };
  lg?: number | { span?: number; offset?: number };
  xl?: number | { span?: number; offset?: number };
  xxl?: number | { span?: number; offset?: number };
  style?: React.CSSProperties;
}

export const ThemedGrid: React.FC<ThemedGridProps> = ({ className, children, columns = 24, gutter = 0, align = 'top', justify = 'start', wrap = true, style }) => {
  const currentTheme = useCurrentTheme();

  const getGutterStyle = () => {
    if (typeof gutter === 'number') {
      return {
        marginLeft: `-${gutter / 2}px`,
        marginRight: `-${gutter / 2}px`,
      };
    } else {
      const [horizontal, vertical] = gutter;
      return {
        marginLeft: `-${horizontal / 2}px`,
        marginRight: `-${horizontal / 2}px`,
        marginTop: `-${vertical / 2}px`,
        marginBottom: `-${vertical / 2}px`,
      };
    }
  };

  const getAlignClasses = () => {
    switch (align) {
      case 'middle':
        return 'items-center';
      case 'bottom':
        return 'items-end';
      default:
        return 'items-start';
    }
  };

  const getJustifyClasses = () => {
    switch (justify) {
      case 'center':
        return 'justify-center';
      case 'end':
        return 'justify-end';
      case 'space-around':
        return 'justify-around';
      case 'space-between':
        return 'justify-between';
      case 'space-evenly':
        return 'justify-evenly';
      default:
        return 'justify-start';
    }
  };

  return (
    <div
      className={classNames('themed-grid', 'flex', wrap ? 'flex-wrap' : 'flex-nowrap', getAlignClasses(), getJustifyClasses(), className)}
      style={{
        ...getGutterStyle(),
        ...style,
      }}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === ThemedCol) {
          return React.cloneElement(child, {
            ...child.props,
            gutter,
            columns,
          } as Partial<ThemedColProps>);
        }
        return child;
      })}
    </div>
  );
};

export const ThemedCol: React.FC<ThemedColProps> = ({ className, children, span = 24, offset = 0, order, push, pull, xs, sm, md, lg, xl, xxl, style }) => {
  const currentTheme = useCurrentTheme();
  const gutter = (React.useContext(React.createContext({ gutter: 0 })) as any).gutter || 0;
  const columns = (React.useContext(React.createContext({ columns: 24 })) as any).columns || 24;

  const getGutterStyle = () => {
    if (typeof gutter === 'number') {
      return {
        paddingLeft: `${gutter / 2}px`,
        paddingRight: `${gutter / 2}px`,
      };
    } else {
      const [horizontal, vertical] = gutter;
      return {
        paddingLeft: `${horizontal / 2}px`,
        paddingRight: `${horizontal / 2}px`,
        paddingTop: `${vertical / 2}px`,
        paddingBottom: `${vertical / 2}px`,
      };
    }
  };

  const getResponsiveClasses = () => {
    const classes: string[] = [];

    const addResponsiveClass = (prefix: string, value: number | { span?: number; offset?: number } | undefined) => {
      if (typeof value === 'number') {
        classes.push(`${prefix}-${value}`);
      } else if (value && typeof value === 'object') {
        if (value.span) classes.push(`${prefix}-${value.span}`);
        if (value.offset) classes.push(`${prefix}-offset-${value.offset}`);
      }
    };

    addResponsiveClass('xs', xs);
    addResponsiveClass('sm', sm);
    addResponsiveClass('md', md);
    addResponsiveClass('lg', lg);
    addResponsiveClass('xl', xl);
    addResponsiveClass('xxl', xxl);

    return classes;
  };

  const getWidthStyle = () => {
    const width = (span / columns) * 100;
    const marginLeft = (offset / columns) * 100;

    return {
      width: `${width}%`,
      marginLeft: offset > 0 ? `${marginLeft}%` : undefined,
    };
  };

  return (
    <div
      className={classNames('themed-col', `col-${span}`, offset > 0 ? `col-offset-${offset}` : '', ...getResponsiveClasses(), className)}
      style={{
        ...getGutterStyle(),
        ...getWidthStyle(),
        order,
        marginLeft: push ? `${(push / columns) * 100}%` : undefined,
        marginRight: pull ? `-${(pull / columns) * 100}%` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Grid 组件的子组件
export const Row: React.FC<ThemedGridProps> = (props) => <ThemedGrid {...props} />;

export const Col: React.FC<ThemedColProps> = (props) => <ThemedCol {...props} />;

// 常用预设
export const GridContainer: React.FC<Omit<ThemedGridProps, 'columns'>> = (props) => <ThemedGrid {...props} columns={24} className={classNames('max-w-7xl mx-auto', props.className)} />;

export const GridCenter: React.FC<Omit<ThemedGridProps, 'justify' | 'align'>> = (props) => <ThemedGrid {...props} justify='center' align='middle' />;

export const GridHalf: React.FC<Omit<ThemedGridProps, 'columns'>> = (props) => <ThemedGrid {...props} columns={2} />;

export const GridThird: React.FC<Omit<ThemedGridProps, 'columns'>> = (props) => <ThemedGrid {...props} columns={3} />;

export const GridQuarter: React.FC<Omit<ThemedGridProps, 'columns'>> = (props) => <ThemedGrid {...props} columns={4} />;
