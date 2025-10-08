import { CloseOutlined, DownOutlined, RightOutlined, CopyOutlined, MinusOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import ReactJson from 'react-json-view';
import { notification } from 'antd';

let notificationCounter = 0;
const activeNotifications: Set<string> = new Set();

const CollapsibleSection: React.FC<{
  title: string;
  data: any;
  defaultCollapsed?: boolean;
}> = ({ title, data, defaultCollapsed = false }) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    notification.success({
      message: 'Copied to clipboard',
      description: `${title} data copied successfully`,
      duration: 2,
      placement: 'topRight',
    });
  };

  return (
    <div className="json-debug-section mb-1">
      <div
        className="json-debug-section-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: '#262626',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: collapsed ? '0' : '8px',
          border: '1px solid #404040',
          transition: 'all 0.2s ease',
        }}
        onClick={() => setCollapsed(!collapsed)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#2d2d2d';
          e.currentTarget.style.borderColor = '#525252';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#262626';
          e.currentTarget.style.borderColor = '#404040';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {collapsed ? (
            <RightOutlined style={{ fontSize: '10px', color: '#94a3b8' }} />
          ) : (
            <DownOutlined style={{ fontSize: '10px', color: '#94a3b8' }} />
          )}
          <span
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#e2e8f0',
              letterSpacing: '0.025em',
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: '10px',
              color: '#64748b',
              backgroundColor: '#1f2937',
              padding: '2px 6px',
              borderRadius: '4px',
              fontFamily: 'monospace',
            }}
          >
            {typeof data === 'object' && data !== null ? Object.keys(data).length : 0} keys
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
            onClick={handleCopy}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#374151';
              e.currentTarget.style.color = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <CopyOutlined style={{ fontSize: '10px' }} />
          </button>
        </div>
      </div>
      {!collapsed && (
        <div
          style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333333',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '8px',
          }}
        >
          <ReactJson
            style={{
              background: 'transparent',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            }}
            name={false}
            indentWidth={2}
            theme={{
              base00: 'transparent',
              base01: '#1f2937',
              base02: '#374151',
              base03: '#6b7280',
              base04: '#9ca3af',
              base05: '#e5e7eb',
              base06: '#f3f4f6',
              base07: '#ffffff',
              base08: '#ef4444',
              base09: '#f97316',
              base0A: '#eab308',
              base0B: '#22c55e',
              base0C: '#06b6d4',
              base0D: '#3b82f6',
              base0E: '#8b5cf6',
              base0F: '#f59e0b',
            }}
            collapseStringsAfterLength={40}
            quotesOnKeys={false}
            displayDataTypes={false}
            collapsed={2}
            enableClipboard={true}
            src={data || {}}
          />
        </div>
      )}
    </div>
  );
};

const JsonDebugContent: React.FC<{
  data: Record<string, any>;
}> = ({ data }) => {
  return (
    <div className="json-debug-container zoomed6" style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {Object.keys(data).map((key, index) => (
        <CollapsibleSection
          key={key}
          title={key}
          data={data[key]}
          defaultCollapsed={index > 0} // Keep first section expanded by default
        />
      ))}
    </div>
  );
};

/**
 * Show a premium debug notification with ReactJson view
 * Allows multiple notifications to be displayed simultaneously
 */
export function showJsonDebug(data: Record<string, any>, title = 'Debug'): void {
  // Create new notification
  const id = `debug-${++notificationCounter}`;

  // Track this notification
  activeNotifications.add(id);

  // Configure premium notification
  notification.open({
    key: id,
    placement: 'bottomLeft',
    icon: null,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              boxShadow: '0 0 6px #3b82f6',
            }}
          />
          <span
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#f8fafc',
              letterSpacing: '0.025em',
            }}
          >
            {title}
          </span>
        </div>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s ease',
          }}
          onClick={() => {
            notification.destroy(id);
            activeNotifications.delete(id);
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#374151';
            e.currentTarget.style.color = '#e2e8f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <MinusOutlined style={{ fontSize: '12px' }} />
        </button>
      </div>
    ),
    description: <JsonDebugContent data={data} />,
    style: {
      backgroundColor: '#171717', // neutral-900
      color: '#e2e8f0',
      padding: '12px',
      borderRadius: '12px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
      border: '1px solid #404040',
      maxWidth: '480px',
      backdropFilter: 'blur(8px)',
    },
    className: 'json-debug-notification',
    closeIcon: null, // We handle close button manually
    closable: false,
    duration: 0, // Never auto-close
    onClose: () => {
      // Remove from active notifications when closed
      activeNotifications.delete(id);
    },
  });
}

export function logJsonDebug(
  globalObj: any,
  paramState: any,
  event: any,
  sessionKey: string,
  getUrlDetails: (params: any) => any,
  process
): void {
  // Parse any string values that might be JSON
  const state = sessionKey ? localStorage.getItem(sessionKey) : null;
  const parsedState = state ? tryParseJSON(state) : {};

  // Build localStorage data from all available keys for debugging (filtered to hide system keys)
  const localStorageData = {};
  
  // System keys to hide from debug console
  const hiddenKeys = [
    'googleFontsCache',
    'googleFontsCacheExpiry',
    'admin',
    'user',
    'accessToken',
    'refreshToken',
    'errorReports'
  ];
  
  // Patterns to hide (keys that start with these)
  const hiddenPatterns = [
    'vscode-tabs-',
    'panelSizes_'
  ];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        // Skip if key is in hidden list
        if (hiddenKeys.includes(key)) continue;
        
        // Skip if key matches any hidden pattern
        if (hiddenPatterns.some(pattern => key.startsWith(pattern))) continue;
        
        try {
          const value = localStorage.getItem(key);
          localStorageData[key] = value ? JSON.parse(value) : value;
        } catch (parseError) {
          localStorageData[key] = localStorage.getItem(key);
        }
      }
    }
  } catch (error) {
    // localStorage access might be restricted
  }

  function getCircularReplacer() {
    const seen = new WeakSet();
    const depthMap = new WeakMap();
    const MAX_DEPTH = 10;
    
    return (key, value) => {
      if (value === null || value === undefined) {
        return value;
      }
      
      if (typeof value !== 'object') {
        return value;
      }
      
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      
      const currentDepth = depthMap.get(value) || 0;
      if (currentDepth > MAX_DEPTH) {
        return '[Max Depth Exceeded]';
      }
      
      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          stack: value.stack
        };
      }
      
      if (value instanceof Event || value instanceof Node) {
        return '[DOM Object]';
      }
      
      if (typeof value === 'function') {
        return '[Function]';
      }
      
      seen.add(value);
      depthMap.set(value, currentDepth + 1);
      
      return value;
    };
  }

  let stringified;
  try {
    stringified = JSON.stringify(event, getCircularReplacer());
  } catch (error) {
    console.error('Failed to stringify event in debug:', error);
    stringified = JSON.stringify({
      type: event?.type || 'unknown',
      timestamp: Date.now(),
      error: 'Debug serialization failed'
    });
  }

  const debugData = {
    controller: globalObj,
    history: getUrlDetails(paramState),
    event: JSON.parse(stringified),
    state: parsedState,
    localStorage: localStorageData,
  };

  showJsonDebug(debugData, process.name || 'Workflow Debug');
}

function tryParseJSON(jsonString: string | null): any {
  if (!jsonString) return {};
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return { error: 'Invalid JSON', raw: jsonString };
  }
}

export function initJsonDebugStyles(): void {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .json-debug-notification {
      margin: 0 !important;
    }
    .json-debug-notification .ant-notification-notice-message,
    .json-debug-notification .ant-notification-notice-description {
      padding: 0 !important;
      margin: 0 !important;
    }
    .json-debug-notification .ant-notification-notice-close {
      display: none !important;
    }
    .json-debug-notification .ant-notification-notice-with-icon .ant-notification-notice-message,
    .json-debug-notification .ant-notification-notice-with-icon .ant-notification-notice-description {
      margin-left: 0 !important;
    }
    .json-debug-container::-webkit-scrollbar {
      width: 4px;
    }
    .json-debug-container::-webkit-scrollbar-track {
      background: #262626;
      border-radius: 2px;
    }
    .json-debug-container::-webkit-scrollbar-thumb {
      background: #525252;
      border-radius: 2px;
    }
    .json-debug-container::-webkit-scrollbar-thumb:hover {
      background: #737373;
    }
    @keyframes pulse-notification {
      0% { 
        transform: scale(1);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
      }
      50% { 
        transform: scale(1.02);
        box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.1);
      }
      100% { 
        transform: scale(1);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
      }
    }
    .pulse-notification {
      animation: pulse-notification 0.8s ease-in-out 2;
    }
  `;
  document.head.appendChild(styleEl);
}

export default {
  showJsonDebug,
  logJsonDebug,
  initJsonDebugStyles,
};
