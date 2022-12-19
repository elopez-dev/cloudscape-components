// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useContext, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { AppLayoutContext } from '../app-layout/visual-refresh/context';
import { applyDisplayName } from '../internal/utils/apply-display-name';
import { ContentLayoutProps } from './interfaces';
import { getBaseProps } from '../internal/base-component';
import useBaseComponent from '../internal/hooks/use-base-component';
import { useDynamicOverlap } from '../app-layout/visual-refresh/hooks/use-dynamic-overlap';
import { useMergeRefs } from '../internal/hooks/use-merge-refs';
import { useVisualRefresh } from '../internal/hooks/use-visual-mode';
import styles from './styles.css.js';

export { ContentLayoutProps };

export default function ContentLayout({ children, disableOverlap, header, ...rest }: ContentLayoutProps) {
  const baseProps = getBaseProps(rest);
  const { breadcrumbs, setHasStickyBackground } = useContext(AppLayoutContext);

  const rootElement = useRef<HTMLDivElement>(null);
  const { __internalRootRef } = useBaseComponent('ContentLayout');
  const mergedRef = useMergeRefs(rootElement, __internalRootRef);
  const overlapElement = useDynamicOverlap();
  const isVisualRefresh = useVisualRefresh();

  /**
   * Handle sticky header integration with the AppLayout.
   */
  const hasStickyHeader = true;

  useEffect(
    function handleHasStickyBackground() {
      if (hasStickyHeader && isVisualRefresh) {
        setHasStickyBackground(true);
      }
    },
    [hasStickyHeader, isVisualRefresh, setHasStickyBackground]
  );

  /**
   * Disable the overlap if the component is missing either a header or child
   * content. If the component is not using visual refresh then the overlap
   * will not be displayed at all. This is handled in the CSS not the JavaScript.
   */
  const isOverlapDisabled = !children || !header || disableOverlap || hasStickyHeader;

  return (
    <div
      {...baseProps}
      className={clsx(baseProps.className, styles.layout, {
        [styles['is-overlap-disabled']]: isOverlapDisabled,
        [styles['is-visual-refresh']]: isVisualRefresh,
        [styles['has-sticky-header']]: hasStickyHeader,
      })}
      ref={mergedRef}
    >
      <div
        className={clsx(
          styles.background,
          { [styles['is-overlap-disabled']]: isOverlapDisabled },
          'awsui-context-content-header'
        )}
        ref={overlapElement}
      />

      {header && (
        <div
          className={clsx(styles.header, { [styles['has-breadcrumbs']]: breadcrumbs }, 'awsui-context-content-header')}
        >
          {header}
        </div>
      )}

      <div className={styles.content}>{children}</div>
    </div>
  );
}

applyDisplayName(ContentLayout, 'ContentLayout');
