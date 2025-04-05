// ReactJsonDebug.tsx

import { CloseOutlined } from '@ant-design/icons';
import React from 'react';
import ReactJson from 'react-json-view';
import { notification } from 'antd';

// Track the current active notification
let notificationCounter = 0;
let activeNotificationId: string | null = null;
let activeNotificationData: Record<string, any> | null = null;

// Custom notification component with ReactJson
const JsonDebugContent: React.FC<{
  data: Record<string, any>;
}> = ({ data }) => {
  return (
    <div className="json-debug-container" style={{ fontSize: '10px' }}>
      {Object.keys(data).map((key) => (
        <div
          key={key}
          style={{
            marginBottom: '4px',
            borderBottom: '1px solid #333',
            paddingBottom: '4px',
          }}
        >
          <div
            style={{
              color: '#94a3b8',
              fontSize: '10px',
              marginBottom: '2px',
              fontWeight: 'bold',
            }}
          >
            {key}:
          </div>
          <ReactJson
            style={{
              background: 'transparent',
              fontSize: '0.55rem',
            }}
            name={false}
            indentWidth={2}
            theme={'ashes'}
            className="bg-transparent zoomed6 text-xs"
            collapseStringsAfterLength={25}
            displayArrayKey={false}
            quotesOnKeys={false}
            displayDataTypes={false}
            collapsed={1}
            enableClipboard={true}
            src={data[key] || {}}
          />
        </div>
      ))}
    </div>
  );
};

// Deep equality function to compare objects
function isEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return obj1 === obj2;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !isEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Show a debug notification with ReactJson view
 * Only shows one notification at a time, replacing any existing one
 * Skips rendering if data is identical to currently displayed notification
 */
export function showJsonDebug(data: Record<string, any>, title: string = 'Debug'): void {
  // Check if identical data is already being displayed
  if (activeNotificationData && isEqual(activeNotificationData, data)) {
    // Data is the same, don't rerender
    const element = document.querySelector('.json-debug-notification');
    if (element) {
      // Add a blink effect to draw attention to the existing notification
      element.classList.add('blink-notification');
      setTimeout(() => {
        element.classList.remove('blink-notification');
      }, 1000);
    }
    return;
  }

  // If there's an active notification, close it first
  if (activeNotificationId) {
    notification.close(activeNotificationId);
  }

  // Create new notification since data is different
  const id = `debug-${++notificationCounter}`;

  // Update active notification tracking
  activeNotificationId = id;
  activeNotificationData = data;

  // Configure notification without the default icon
  notification.open({
    key: id,
    placement: 'bottomLeft',
    icon: null, // Remove the icon
    message: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0',
          margin: '0',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#e2e8f0',
          }}
        >
          {title}
        </span>
      </div>
    ),
    description: <JsonDebugContent data={data} />,
    style: {
      backgroundColor: '#171717', // neutral-900
      color: '#e2e8f0',
      padding: '6px',
      borderRadius: '4px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      border: '1px solid #262626',
      maxWidth: '380px',
    },
    className: 'json-debug-notification',
    closeIcon: <CloseOutlined style={{ color: '#94a3b8', fontSize: '10px' }} />,
    closable: true,
    duration: 0, // Never auto-close
    onClose: () => {
      // Reset active notification tracking when closed
      if (activeNotificationId === id) {
        activeNotificationId = null;
        activeNotificationData = null;
      }
    },
  });
}

// Specialized debug logger for workflow debugging
export function logJsonDebug(
  globalObj: any,
  paramState: any,
  event: any,
  sessionKey: string,
  getUrlDetails: (params: any) => any,
  //   currentApplication?: { _id: string },
  process
): void {
  // Parse any string values that might be JSON
  const state = localStorage.getItem(sessionKey);
  const parsedState = state ? tryParseJSON(state) : {};

  const sessionInfo = sessionKey ? localStorage.getItem(sessionKey + '-sessionInfo') : '{}';
  const parsedSessionInfo = tryParseJSON(sessionInfo);

  function getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      return value;
    };
  }

  const stringified = JSON.stringify(event, getCircularReplacer());

  const debugData = {
    controller: globalObj,
    history: getUrlDetails(paramState),
    event: JSON.parse(stringified),
    state: parsedState,
    sessionInfo: parsedSessionInfo,
  };

  showJsonDebug(debugData, process.name || 'Workflow Debug');
}

// Helper function to safely parse JSON
function tryParseJSON(jsonString: string | null): any {
  if (!jsonString) return {};
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return { error: 'Invalid JSON', raw: jsonString };
  }
}

// Add global styles to document
export function initJsonDebugStyles(): void {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .json-debug-notification {
      margin: 0 !important;
    }
    .json-debug-notification .ant-notification-notice-message,
    .json-debug-notification .ant-notification-notice-description {
      padding: 4px !important;
      margin: 0 !important;
    }
    .json-debug-notification .ant-notification-notice-close {
      top: 6px !important;
      right: 6px !important;
    }
    .json-debug-notification .ant-notification-notice-with-icon .ant-notification-notice-message,
    .json-debug-notification .ant-notification-notice-with-icon .ant-notification-notice-description {
      margin-left: 0 !important;
    }
    @keyframes blink-notification {
      0% { border-color: #262626; }
      50% { border-color: #3b82f6; }
      100% { border-color: #262626; }
    }
    .blink-notification {
      animation: blink-notification 0.6s ease-in-out 3;
      border: 1px solid #3b82f6 !important;
    }
  `;
  document.head.appendChild(styleEl);
}

export default {
  showJsonDebug,
  logJsonDebug,
  initJsonDebugStyles,
};
