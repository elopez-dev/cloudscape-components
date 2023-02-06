// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import clsx from 'clsx';
import { useAppLayoutInternals } from './context';
import styles from './styles.css.js';
import testutilStyles from '../test-classes/styles.css.js';

export default function Notifications() {
  const { ariaLabels, isAnyPanelOpen, isMobile, notifications, notificationsElement, stickyNotifications } =
    useAppLayoutInternals();

  if (!notifications) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label={ariaLabels?.notifications ?? undefined}
      className={clsx(
        styles.notifications,
        {
          [styles['sticky-notifications']]: stickyNotifications,
          [styles.unfocusable]: isMobile && isAnyPanelOpen,
        },
        testutilStyles.notifications,
        'awsui-context-content-header'
      )}
      ref={notificationsElement}
    >
      {notifications}
    </div>
  );
}
