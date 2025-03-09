// ReactJsonDebug.tsx

import { CloseOutlined } from '@ant-design/icons';
import React from 'react';
import ReactJson from 'react-json-view';
import { notification } from 'antd';

// Keep track of active notifications
let notificationCounter = 0;
const activeNotifications: string[] = [];

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

/**
 * Show a debug notification with ReactJson view
 */
export function showJsonDebug(data: Record<string, any>, title: string = 'Debug'): void {
  const id = `debug-${++notificationCounter}`;

  // Close all existing notifications
  activeNotifications.forEach((existingId) => {
    // notification?.close(existingId);
  });

  // Add this notification to the active list
  activeNotifications.push(id);

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
        {/* <span
          style={{
            fontSize: '9px',
            backgroundColor: '#1e40af',
            color: '#93c5fd',
            padding: '1px 5px',
            borderRadius: '4px',
            right: '30px',
          }}
        >
          #{notificationCounter}
        </span> */}
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
      // Remove from active notifications on close
      const index = activeNotifications.indexOf(id);
      if (index > -1) {
        activeNotifications.splice(index, 1);
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

  showJsonDebug(
    {
      controller: globalObj,
      history: getUrlDetails(paramState),
      event: event,
      state: parsedState,
      sessionInfo: parsedSessionInfo,
    },
    process.name || 'Workflow Debug'
  );
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
  `;
  document.head.appendChild(styleEl);
}

export default {
  showJsonDebug,
  logJsonDebug,
  initJsonDebugStyles,
};
