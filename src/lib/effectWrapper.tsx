import React, { useState, useRef } from 'react';
import { Activity, MousePointer, Zap, Database, Loader2, ArrowRight, Eye, Settings, Globe, Timer, Users, FileText, ShoppingCart, Target, RefreshCw, Play, Component, Code, RotateCw, CheckCircle, Send, Edit3, Lock, Layers, Info, EyeOff } from 'lucide-react';
// import ControllerSelect from '@/components/shared/SchemaForm/Fields/ControllerField';
// import EventHandlerField from '@/components/shared/SchemaForm/Fields/EventHandler';
import { Form, Select } from 'antd';

// Global state manager to handle both hover and pinned elements
let globalHoveredElement = null;
let globalPinnedElement = null;
// Store the pinned element's data
let globalPinnedElementData = null;
let globalHoverTimeout = null;

const setGlobalHover = (elementId, isHovered) => {
  if (globalHoverTimeout) {
    clearTimeout(globalHoverTimeout);
    globalHoverTimeout = null;
  }

  if (isHovered) {
    // Don't show any hover effects if something is pinned
    if (globalPinnedElement) {
      return;
    }
    
    // Hide any currently hovered element
    if (globalHoveredElement && globalHoveredElement !== elementId) {
      const event = new CustomEvent('hidePopover', { detail: { elementId: globalHoveredElement } });
      window.dispatchEvent(event);
    }
    globalHoveredElement = elementId;
  } else {
    if (globalHoveredElement === elementId) {
      globalHoveredElement = null;
    }
  }
};

const setGlobalPinned = (elementId, isPinned, elementData = null) => {
  if (isPinned) {
    // Hide any currently pinned element
    if (globalPinnedElement && globalPinnedElement !== elementId) {
      const event = new CustomEvent('hidePopover', { detail: { elementId: globalPinnedElement } });
      window.dispatchEvent(event);
    }
    
    // Hide any currently hovered element
    if (globalHoveredElement && globalHoveredElement !== elementId) {
      const event = new CustomEvent('hidePopover', { detail: { elementId: globalHoveredElement } });
      window.dispatchEvent(event);
    }
    
    globalPinnedElement = elementId;
    globalPinnedElementData = elementData;
    globalHoveredElement = null;
  } else {
    if (globalPinnedElement === elementId) {
      globalPinnedElement = null;
      globalPinnedElementData = null;
    }
  }
};

// Helper function to find element by ID
const findElementById = (elements, id) => {
  // This is a simplified version - in the real implementation, 
  // you'd need access to the full elements array from the parent
  return null;
};

// Enhanced workflow steps generator with detailed context
const getDetailedWorkflowSteps = (workflows, configuration, element) => {
  const steps = [];
  
  // Detect interaction types from configuration
  const hasClick = configuration?.onClick;
  const hasSubmit = configuration?.onSubmit;
  const hasChange = configuration?.onChange;
  const hasFocus = configuration?.onFocus;
  
  // Add initial interaction step
  if (hasClick) {
    steps.push({ label: 'click', icon: MousePointer, color: 'text-green-400' });
  } else if (hasSubmit) {
    steps.push({ label: 'validate', icon: CheckCircle, color: 'text-blue-400' });
    steps.push({ label: 'submit', icon: Send, color: 'text-green-400' });
  } else if (hasChange) {
    steps.push({ label: 'input', icon: Edit3, color: 'text-blue-400' });
  } else if (hasFocus) {
    steps.push({ label: 'focus', icon: Lock, color: 'text-blue-400' });
  }

  // Add workflow-based steps
  if (workflows && workflows.length > 0) {
    workflows.forEach(plugin => {
      if (plugin.type === 'controller-invoke') {
        steps.push({ label: 'loading', icon: Loader2, color: 'text-orange-400' });
        steps.push({ label: 'fetch', icon: Database, color: 'text-purple-400' });
      } else if (plugin.type === 'set-state' || plugin.type === 'state-setState') {
        steps.push({ label: 'setState', icon: Target, color: 'text-orange-400' });
        steps.push({ label: 'update', icon: RefreshCw, color: 'text-blue-400' });
      } else if (plugin.type === 'navigate') {
        steps.push({ label: 'navigate', icon: ArrowRight, color: 'text-green-400' });
      } else if (plugin.type === 'loop') {
        steps.push({ label: 'loop', icon: RefreshCw, color: 'text-blue-400' });
        steps.push({ label: 'render', icon: Layers, color: 'text-purple-400' });
      }
    });
    
    // Add animation step for complex workflows
    if (workflows.length > 1) {
      steps.push({ label: 'animate', icon: Play, color: 'text-yellow-400' });
    }
  } else if (steps.length === 0) {
    // Default fallback
    steps.push({ label: 'action', icon: Zap, color: 'text-yellow-400' });
  }

  return steps;
};

// Extract interaction information from configuration
const getInteractionInfo = (configuration) => {
  const interactions = [];
  
  Object.keys(configuration || {}).forEach(key => {
    if (key.toLowerCase().startsWith('on')) {
      const eventType = key.replace(/^on/, '').toLowerCase();
      interactions.push({
        event: eventType,
        handler: configuration[key],
        description: getInteractionDescription(eventType)
      });
    }
  });

  return interactions;
};

const getInteractionDescription = (eventType) => {
  const descriptions = {
    click: 'Triggers action when clicked',
    submit: 'Submits form data',
    change: 'Updates value when changed',
    focus: 'Activates when focused',
    blur: 'Deactivates when focus lost',
    hover: 'Shows hover effects',
    mouseenter: 'Mouse enters element',
    mouseleave: 'Mouse leaves element'
  };
  return descriptions[eventType] || 'User interaction available';
};

// Enhanced function to extract all effects and event handlers from element configuration
const getElementEffectsAndEvents = (configuration, element) => {
  const effects = [];
  const events = [];
  
  if (!configuration) return { effects, events };

  // Extract event handlers (onClick, onSubmit, etc.)
  Object.keys(configuration).forEach(key => {
    if (key.toLowerCase().startsWith('on') && configuration[key]) {
      const eventType = key.replace(/^on/, '').toLowerCase();
      events.push({
        type: eventType,
        handler: configuration[key],
        description: getEventDescription(eventType),
        icon: getEventIcon(eventType)
      });
    }
  });

  // Extract effects from _overrides_ workflows
  if (configuration._overrides_) {
    configuration._overrides_.forEach(override => {
      if (override.plugins) {
        override.plugins.forEach(plugin => {
          effects.push({
            type: plugin.type,
            name: plugin.name || plugin.type,
            description: getEffectDescription(plugin.type, plugin),
            icon: getEffectIcon(plugin.type),
            plugin: plugin
          });
        });
      }
    });
  }

  // Extract conditional effects (if any)
  if (configuration.conditions) {
    configuration.conditions.forEach(condition => {
      effects.push({
        type: 'condition',
        name: condition.name || 'Conditional Logic',
        description: `Shows/hides based on: ${condition.expression}`,
        icon: Code,
        condition: condition
      });
    });
  }

  // Extract data bindings
  if (configuration.dataSource || configuration.src || configuration.value) {
    effects.push({
      type: 'data-binding',
      name: 'Data Binding',
      description: 'Element is bound to dynamic data',
      icon: Database,
      source: configuration.dataSource || configuration.src || configuration.value
    });
  }

  // Extract animation/transition effects
  if (configuration.classNames && configuration.classNames.includes('animate-')) {
    const animationClasses = configuration.classNames.split(' ').filter(cls => cls.includes('animate-'));
    animationClasses.forEach(animClass => {
      effects.push({
        type: 'animation',
        name: 'CSS Animation',
        description: `Applies ${animClass} animation`,
        icon: Play,
        animation: animClass
      });
    });
  }

  return { effects, events };
};

// Helper functions for icons and descriptions
const getEventIcon = (eventType) => {
  const icons = {
    click: MousePointer,
    submit: Send,
    change: Edit3,
    focus: Target,
    blur: EyeOff,
    hover: Eye,
    mouseenter: MousePointer,
    mouseleave: MousePointer,
    keydown: Component,
    keyup: Component
  };
  return icons[eventType] || Activity;
};

const getEventDescription = (eventType) => {
  const descriptions = {
    click: 'Triggers when element is clicked',
    submit: 'Handles form submission',
    change: 'Responds to value changes',
    focus: 'Activates when element gains focus',
    blur: 'Triggers when element loses focus',
    hover: 'Shows hover effects',
    mouseenter: 'Mouse enters element area',
    mouseleave: 'Mouse leaves element area',
    keydown: 'Responds to key press down',
    keyup: 'Responds to key release'
  };
  return descriptions[eventType] || 'User interaction handler';
};

const getEffectIcon = (effectType) => {
  const icons = {
    'controller-invoke': Database,
    'set-state': Target,
    'state-setState': Target,
    'loop': RefreshCw,
    'navigate': ArrowRight,
    'condition': Code,
    'data-binding': Database,
    'animation': Play,
    'timer': Timer,
    'websocket': Globe
  };
  return icons[effectType] || Zap;
};

const getEffectDescription = (effectType, plugin) => {
  const descriptions = {
    'controller-invoke': `Makes API call to ${plugin.controller || 'endpoint'}`,
    'set-state': `Updates ${plugin.stateKey || plugin.key || 'state variable'}`,
    'state-setState': `Updates ${plugin.stateKey || plugin.key || 'state variable'}`,
    'loop': `Iterates through ${plugin.dataSource || 'data items'}`,
    'navigate': `Navigates to ${plugin.to || plugin.href || 'destination'}`,
    'timer': `Executes after ${plugin.delay || 'delay'}`,
    'websocket': `WebSocket operation: ${plugin.action || 'connection'}`
  };
  return descriptions[effectType] || 'Element effect or workflow';
};

// Visual indicators for different element states and operations
const getElementOperations = (configuration, element) => {
  const operations = [];
  
  // Check for controller invokes (API calls)
  if (configuration?._overrides_) {
    configuration._overrides_.forEach(override => {
      if (override.plugins) {
        // Sort plugins by their order/sequence if available
        const sortedPlugins = [...override.plugins].sort((a, b) => {
          return (a.sequence || a.index || 0) - (b.sequence || b.index || 0);
        });
        
        sortedPlugins.forEach((plugin, index) => {
          if (plugin.type === 'controller-invoke') {
            const invokingComponent = element?.name || element?.componentId || 'Unknown Component';
            
            operations.push({
              type: 'controller-invoke',
              sequence: index + 1,
              name: plugin.name || 'API Call',
              controller: plugin.controller,
              invokingComponent,
              description: `${invokingComponent} fetches data from ${plugin.controller}`,
              details: {
                endpoint: plugin.controller,
                method: plugin.method || 'POST',
                sendAsMultipart: plugin.sendAsMultipart
              },
              icon: Database,
              color: 'bg-purple-600',
              borderColor: 'border-purple-600'
            });
          } else if (plugin.type === 'set-state' || plugin.type === 'state-setState') {
            const targetName = plugin.elementOverride ? 'Target Element' : element?.name || element?.componentId || 'Current Element';
            
            operations.push({
              type: 'set-state',
              sequence: index + 1,
              name: plugin.name || 'Update State',
              stateKey: plugin.stateKey || plugin.key,
              value: plugin.value,
              targetElement: targetName,
              description: `Sets ${plugin.stateKey || plugin.key || 'state variable'} in ${targetName}`,
              details: {
                stateKey: plugin.stateKey || plugin.key,
                value: plugin.value,
                elementOverride: plugin.elementOverride,
                targetElementName: targetName
              },
              icon: Target,
              color: 'bg-orange-500',
              borderColor: 'border-orange-500'
            });
          } else if (plugin.type === 'loop') {
            operations.push({
              type: 'loop',
              sequence: index + 1,
              name: plugin.name || 'Dynamic List',
              dataSource: plugin.dataSource,
              description: `Loops through data items`,
              details: {
                dataSource: plugin.dataSource,
                itemVariable: plugin.itemVariable || 'item'
              },
              icon: RefreshCw,
              color: 'bg-blue-600',
              borderColor: 'border-blue-600'
            });
          } else if (plugin.type === 'navigate') {
            const targetName = plugin.navigateTo ? 'Target Element' : plugin.to || plugin.href || 'Unknown Destination';
            
            operations.push({
              type: 'navigate',
              sequence: index + 1,
              name: plugin.name || 'Navigation',
              destination: targetName,
              description: `Navigate to ${targetName}`,
              details: {
                navigateTo: plugin.navigateTo,
                href: plugin.href,
                to: plugin.to
              },
              icon: ArrowRight,
              color: 'bg-green-600',
              borderColor: 'border-green-600'
            });
          }
        });
      }
    });
  }

  return operations;
};

// Get visual state indicators
const getElementStateIndicators = (configuration) => {
  const indicators = [];
  
  // Check for loading states
  const hasLoading = configuration?.classNames?.includes('animate-spin') || 
                   configuration?.loading || 
                   configuration?.isLoading;
  if (hasLoading) {
    indicators.push({
      type: 'loading',
      label: 'Loading',
      icon: Loader2,
      color: 'bg-orange-900 text-orange-300 border-orange-700'
    });
  }

  // Check for event handlers
  const hasClick = configuration?.onClick;
  if (hasClick) {
    indicators.push({
      type: 'interactive',
      label: 'Clickable',
      icon: MousePointer,
      color: 'bg-green-900 text-green-300 border-green-700'
    });
  }

  // Check for data sources
  const hasDataSource = configuration?.dataSource || configuration?.src;
  if (hasDataSource) {
    indicators.push({
      type: 'data',
      label: 'Data Connected',
      icon: Database,
      color: 'bg-purple-900 text-purple-300 border-purple-700'
    });
  }

  return indicators;
};

// New component for editable debug info with intellisense
const EditableDebugOperations = ({ operations, context, onOperationChange }) => {
  const [form] = Form.useForm();
  
  if (!operations || operations.length === 0) {
    return null;
  }

  const handleControllerChange = (opIndex, newController) => {
    if (onOperationChange) {
      onOperationChange(opIndex, 'controller', newController);
    }
  };

  const handleEventHandlerChange = (opIndex, newEventHandler) => {
    if (onOperationChange) {
      onOperationChange(opIndex, 'eventHandler', newEventHandler);
    }
  };

  return (
    <div className="space-y-2">
      {operations.map((operation, index) => (
        <div key={index} className="bg-neutral-800/30 rounded-md p-2 border border-neutral-700/30">
          <div className="font-medium text-neutral-200 text-xs mb-2 flex items-center gap-1">
            <span className={`w-3 h-3 rounded-full ${operation.color} inline-block`}></span>
            {operation.name}
          </div>
          
   
          
          {operation.type === 'set-state' && (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">State Key:</label>
                <Select
                  value={operation.details?.stateKey}
                  onChange={(value) => handleEventHandlerChange(index, { stateKey: value })}
                  placeholder="Enter state key..."
                  showSearch
                  allowClear
                  className="w-full"
                  options={context?.state ? Object.keys(context.state).map(key => ({ value: key, label: key })) : []}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const EnhancedElementDebugInfo = ({ element, configuration, context = null }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const operations = getElementOperations(configuration, element);
  const stateIndicators = getElementStateIndicators(configuration);
  const interactions = getInteractionInfo(configuration);
  
  // NEW: Extract effects and events
  const { effects, events } = getElementEffectsAndEvents(configuration, element);
  
  // Get workflow steps from operations
  const allWorkflows = operations || [];
  const workflowSteps = getDetailedWorkflowSteps(allWorkflows, configuration, element);
  
  const hasOperations = operations.length > 0;
  const hasStateIndicators = stateIndicators.length > 0;
  const hasInteractions = interactions.length > 0;
  const hasEffects = effects.length > 0;
  const hasEvents = events.length > 0;

  // Handle operation changes
  const handleOperationChange = (opIndex, field, value) => {
    // This would update the element's configuration
    // TODO: Implement actual update logic
  };
  

  // Always show the popover with at least basic element info
  return (
    <div className="w-full">
      {/* Enhanced header with debug info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
            <Eye className="w-3 h-3 text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-neutral-100 block">
              {element?.name || element?.componentId || element?.i || 'Element'}
            </span>
            <span className="text-xs text-purple-400">
              {element?.configuration?.tag || 'Component'} Details
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {hasOperations && context && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors border border-blue-500/20"
            >
              {isEditing ? 'View' : 'Edit'}
            </button>
          )}
          {(hasOperations || hasEffects || hasEvents || stateIndicators.length > 1 || hasInteractions) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-purple-400 hover:text-purple-300 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors border border-purple-500/20"
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
        </div>
      </div>

      {/* Debug Information Section - Always visible for debugging */}
      <div className="mb-3 p-2 bg-red-900/20 border border-red-700/50 rounded-lg text-red-300 text-xs">
        <div className="font-medium mb-1">🔍 Debug Detection:</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div>Events: {events.length}</div>
          <div>Effects: {effects.length}</div>
          <div>Operations: {operations.length}</div>
          <div>Interactions: {interactions.length}</div>
        </div>
        <div className="mt-1 text-xs">
          Config keys: {Object.keys(configuration || {}).length}
        </div>
        {configuration?._overrides_ && (
          <div className="text-xs">Overrides: {configuration._overrides_.length}</div>
        )}
      </div>

      {/* Enhanced Quick Summary - Always show with debug counts */}
      <div className="mb-3 p-2 bg-neutral-800/30 rounded-md">
        <div className="flex flex-wrap gap-2 text-xs">
          {/* Always show counts for debugging */}
          <span className="bg-green-900/50 text-green-300 px-2 py-1 rounded border border-green-700/50 flex items-center gap-1">
            <MousePointer className="w-3 h-3" />
            {events.length} Event{events.length !== 1 ? 's' : ''}
          </span>
          <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded border border-blue-700/50 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {effects.length} Effect{effects.length !== 1 ? 's' : ''}
          </span>
          <span className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded border border-purple-700/50 flex items-center gap-1">
            <Database className="w-3 h-3" />
            {operations.length} Operation{operations.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Raw Configuration Display for debugging */}
      <div className="mb-3 p-2 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-yellow-300 text-xs">
        <div className="font-medium mb-1">🔧 Raw Configuration:</div>
        <div className="max-h-24 overflow-y-auto">
          {Object.keys(configuration || {}).map((key, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-yellow-400">{key}:</span>
              <span className="text-neutral-300 truncate">
                {typeof configuration[key] === 'object' 
                  ? JSON.stringify(configuration[key]).substring(0, 50) + '...'
                  : String(configuration[key]).substring(0, 50)
                }
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Event Handlers Section - Always show even if empty */}
      <div className="mb-3">
        <div className="text-xs font-medium text-neutral-200 mb-2 flex items-center gap-2">
          <MousePointer className="w-3 h-3 text-green-400" />
          Event Handlers ({events.length})
        </div>
        {hasEvents ? (
          <div className="space-y-1">
            {events.slice(0, isExpanded ? events.length : 3).map((event, index) => {
              const Icon = event.icon;
              return (
                <div key={index} className="flex items-center gap-2 p-2 bg-neutral-800/50 rounded text-xs border border-green-700/30">
                  <Icon className="w-3 h-3 text-green-400" />
                  <div className="flex-1">
                    <div className="font-medium text-green-300">on{event.type}</div>
                    <div className="text-neutral-400">{event.description}</div>
                  </div>
                </div>
              );
            })}
            {!isExpanded && events.length > 3 && (
              <div className="text-xs text-green-400 text-center">+{events.length - 3} more events</div>
            )}
          </div>
        ) : (
          <div className="text-xs text-neutral-500 italic">No event handlers detected</div>
        )}
      </div>

      {/* Effects Section - Always show even if empty */}
      <div className="mb-3">
        <div className="text-xs font-medium text-neutral-200 mb-2 flex items-center gap-2">
          <Zap className="w-3 h-3 text-blue-400" />
          Effects & Workflows ({effects.length})
        </div>
        {hasEffects ? (
          <div className="space-y-1">
            {effects.slice(0, isExpanded ? effects.length : 3).map((effect, index) => {
              const Icon = effect.icon;
              return (
                <div key={index} className="flex items-center gap-2 p-2 bg-neutral-800/50 rounded text-xs border border-blue-700/30">
                  <Icon className="w-3 h-3 text-blue-400" />
                  <div className="flex-1">
                    <div className="font-medium text-blue-300">{effect.name}</div>
                    <div className="text-neutral-400">{effect.description}</div>
                  </div>
                </div>
              );
            })}
            {!isExpanded && effects.length > 3 && (
              <div className="text-xs text-blue-400 text-center">+{effects.length - 3} more effects</div>
            )}
          </div>
        ) : (
          <div className="text-xs text-neutral-500 italic">No effects or workflows detected</div>
        )}
      </div>

      {/* Basic Element Information - Always visible */}
      <div className="mb-3 p-2 bg-neutral-800/30 rounded-md">
        <div className="text-xs text-neutral-300 space-y-1">
          <div className="flex justify-between">
            <span className="text-neutral-400">Element ID:</span>
            <span className="text-purple-300 font-mono">{element?.i || element?.componentId || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Tag:</span>
            <span className="text-blue-300">{element?.configuration?.tag || 'div'}</span>
          </div>
          {element?.configuration?.classNames && (
            <div className="flex justify-between">
              <span className="text-neutral-400">Classes:</span>
              <span className="text-green-300 text-xs truncate max-w-32">{element.configuration.classNames}</span>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced state indicators */}
      {hasStateIndicators && (
        <div className="flex flex-wrap gap-1 mb-3">
          {stateIndicators.slice(0, isExpanded ? stateIndicators.length : 3).map((indicator, index) => {
            const Icon = indicator.icon;
            return (
              <span 
                key={index}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border backdrop-blur-sm ${indicator.color}`}
              >
                <Icon className="w-3 h-3" />
                <span>{indicator.label}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* User Interactions */}
      {hasInteractions && (
        <div className="mb-3">
          <div className="text-xs font-medium text-neutral-200 mb-2 flex items-center gap-2">
            <MousePointer className="w-3 h-3 text-green-400" />
            User Interactions ({interactions.length})
          </div>
          <div className="space-y-1">
            {interactions.slice(0, isExpanded ? interactions.length : 2).map((interaction, index) => (
              <div key={index} className="flex items-center gap-2 p-1 bg-neutral-800/50 rounded text-xs">
                <span className="bg-neutral-700 text-neutral-300 px-1 py-0.5 rounded">
                  {interaction.event}
                </span>
                <span className="text-neutral-400 flex-1">
                  {interaction.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Details */}
      {element?.configuration && (
        <div className="mb-3">
          <div className="text-xs font-medium text-neutral-200 mb-2 flex items-center gap-2">
            <Settings className="w-3 h-3 text-blue-400" />
            Configuration
          </div>
          <div className="space-y-1">
            {Object.keys(element.configuration).slice(0, isExpanded ? 10 : 3).map((key, index) => {
              if (key.startsWith('_') || key === 'classNames' || key === 'tag') return null;
              const value = element.configuration[key];
              return (
                <div key={index} className="flex items-center gap-2 p-1 bg-neutral-800/50 rounded text-xs">
                  <span className="bg-neutral-700 text-neutral-300 px-1 py-0.5 rounded min-w-fit">
                    {key}
                  </span>
                  <span className="text-neutral-400 flex-1 truncate">
                    {typeof value === 'string' ? value : typeof value === 'object' ? 'Object' : String(value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Workflow Steps */}
      {workflowSteps.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-medium text-neutral-200 mb-2 flex items-center gap-2">
            <RotateCw className="w-3 h-3 text-purple-400" />
            Workflow Steps ({workflowSteps.length})
          </div>
          <div className="flex items-center flex-wrap gap-1">
            {workflowSteps.slice(0, isExpanded ? workflowSteps.length : 4).map((step, stepIndex) => {
              const StepIcon = step.icon;
              const isLast = stepIndex === Math.min(workflowSteps.length, isExpanded ? workflowSteps.length : 4) - 1;
              return (
                <React.Fragment key={stepIndex}>
                  <div className="flex items-center gap-1 bg-neutral-800/50 px-1 py-0.5 rounded">
                    <StepIcon className="w-2 h-2" />
                    <span className={`text-xs ${step.color} font-medium`}>
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <ArrowRight className="w-2 h-2 text-neutral-500" />
                  )}
                </React.Fragment>
              );
            })}
            {!isExpanded && workflowSteps.length > 4 && (
              <span className="text-xs text-neutral-500 ml-1">+{workflowSteps.length - 4}</span>
            )}
          </div>
        </div>
      )}

      {/* Enhanced operations sequence */}
      {hasOperations && (
        <div className="mb-3">
          <div className="text-xs font-medium text-neutral-200 mb-2 flex items-center gap-2">
            <Database className="w-3 h-3 text-purple-400" />
            Operations ({operations.length})
            {isEditing && context && (
              <span className="text-xs text-blue-300 bg-blue-900/30 px-2 py-1 rounded border border-blue-600/50">
                Edit Mode - Intellisense Enabled
              </span>
            )}
          </div>
          
          {isEditing && context ? (
            <EditableDebugOperations
              operations={operations}
              context={context}
              onOperationChange={handleOperationChange}
            />
          ) : (
            <div className="space-y-2">
              {operations.slice(0, isExpanded ? operations.length : 2).map((operation, index) => {
                const Icon = operation.icon;
                
                return (
                  <div key={index} className="flex items-start gap-2 p-2 bg-neutral-800/50 rounded-md border border-neutral-700/50">
                    <div className={`w-6 h-6 rounded-full ${operation.color} flex items-center justify-center text-xs font-bold text-white shadow-lg`}>
                      {operation.sequence}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <Icon className="w-3 h-3 text-neutral-300" />
                        <span className="font-medium text-neutral-100 text-xs">{operation.name}</span>
                        <span className="bg-neutral-700 text-neutral-300 px-1 py-0.5 rounded text-xs">
                          {operation.type}
                        </span>
                      </div>
                      <p className="text-neutral-400 text-xs leading-relaxed">{operation.description}</p>
                    </div>
                  </div>
                );
              })}
              
              {!isExpanded && operations.length > 2 && (
                <div className="text-center">
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="text-xs text-purple-400 hover:text-purple-300 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
                  >
                    +{operations.length - 2} more operations
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Fallback message when no workflows */}
      {!hasOperations && !hasInteractions && workflowSteps.length === 0 && (
        <div className="mb-3 p-2 bg-blue-900/20 border border-blue-700/50 rounded-md">
          <div className="text-xs text-blue-300 flex items-center gap-2">
            <Info className="w-3 h-3" />
            <span>Static element - no workflows or interactions detected</span>
          </div>
        </div>
      )}

      {/* Enhanced expanded details */}
      {isExpanded && hasOperations && (
        <div className="border-t border-neutral-700/50 pt-3">
          <div className="text-xs font-medium text-neutral-200 mb-2 flex items-center gap-2">
            <Component className="w-3 h-3 text-blue-400" />
            Technical Details
          </div>
          <div className="space-y-2">
            {operations.map((op, index) => (
              <div key={index} className="bg-neutral-800/30 rounded-md p-2 border border-neutral-700/30">
                <div className="font-medium text-neutral-200 text-xs mb-1 flex items-center gap-1">
                  <span className={`w-3 h-3 rounded-full ${op.color} inline-block`}></span>
                  {op.name}
                </div>
                
                {op.details && (
                  <div className="space-y-1 text-xs">
                    {op.type === 'controller-invoke' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Endpoint:</span>
                          <span className="text-purple-300 font-mono">{op.details.endpoint}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Method:</span>
                          <span className="text-purple-300 font-mono">{op.details.method}</span>
                        </div>
                        {op.details.sendAsMultipart && (
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Format:</span>
                            <span className="text-orange-300">Multipart</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {op.type === 'set-state' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">State Key:</span>
                          <span className="text-orange-300 font-mono">{op.details.stateKey}</span>
                        </div>
                        {op.details.elementOverride && (
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Target:</span>
                            <span className="text-orange-300">{op.details.targetElementName}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {op.type === 'navigate' && op.details.navigateTo && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Destination:</span>
                        <span className="text-green-300">Target Element</span>
                      </div>
                    )}
                    
                    {op.type === 'loop' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Data Source:</span>
                          <span className="text-blue-300 font-mono">{op.details.dataSource}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Variable:</span>
                          <span className="text-blue-300 font-mono">{op.details.itemVariable}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main DebugWrapper component  
const DebugWrapper = ({ 
  children, 
  element, 
  enabled = true, 
  selectedTargets = [], 
  // Context for intellisense: { state, elements, _self, history, localStore, controllers }
  context = null,
  ...props 
}) => {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef(null);
  const elementId = element?.i || element?.componentId || Math.random().toString();
  
  // Check if this element is selected
  const isSelected = selectedTargets.includes(elementId);
  
  // Cleanup timeout on unmount and handle global events
  React.useEffect(() => {
          // Listen for global hide events
      const handleGlobalHide = (event) => {
        if (event.detail.elementId === elementId) {
          setIsHovered(false);
        }
      };
    
         // Note: Click outside handling is now managed by parent component through selectedTargets
     const handleClickOutside = (event) => {
       // This is now handled externally through selectedTargets prop
     };
    
    window.addEventListener('hidePopover', handleGlobalHide);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('hidePopover', handleGlobalHide);
      document.removeEventListener('click', handleClickOutside);
      
      // Clean up global state if this element was hovered or pinned
      if (globalHoveredElement === elementId) {
        globalHoveredElement = null;
      }
      if (globalPinnedElement === elementId) {
        globalPinnedElement = null;
      }
    };
  }, [elementId, isSelected]);
  
  // Skip virtual elements completely
  if (element?.isVirtual) {
    return children;
  }

  // If anatomy mode is disabled, just return children without debug features
  if (!enabled) {
    return children;
  }
  
  const configuration = element?.configuration || {};
  const operations = getElementOperations(configuration, element);
  
  const hasOperations = operations.length > 0;

  // Note: Element selection is now handled by parent component
  const handleElementClick = (e) => {
    e.stopPropagation();
    // Selection is managed externally through selectedTargets prop
    // Parent component should handle element selection/deselection
  };

  // Clean hover state management with global coordination
  const handleMouseEnter = (e) => {
    e.stopPropagation();
    
    // Don't show hover if this element is selected OR if any element is selected
    if (isSelected || selectedTargets.length > 0) {
      return;
    }
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Update global hover state
    setGlobalHover(elementId, true);
    setIsHovered(true);
  };

  const handleMouseLeave = (e) => {
    e.stopPropagation();
    
    // Don't hide if selected
    if (isSelected) {
      return;
    }
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Add a small delay before hiding to prevent flickering
    timeoutRef.current = setTimeout(() => {
      setGlobalHover(elementId, false);
      setIsHovered(false);
      timeoutRef.current = null;
    }, 150);
  };
  
  return (
    <div 
      ref={ref} 
      className="relative"
      style={{ 
        outline: hasOperations ? '1px dashed #9333ea' : undefined,
        outlineOffset: hasOperations ? '1px' : undefined
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleElementClick}
      {...props}
    >
      {children}
      
      {/* Debug overlay - shows when element is hovered or selected */}
      {(isHovered || isSelected) && (
        <div 
          className="fixed pointer-events-auto"
          data-element-id={elementId}
          style={{ 
            zIndex: 99999,
            top: '10px',
            right: '10px'
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
            // Keep the popover visible when hovering over it
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            // Only hide when leaving the popover if not selected
            if (!isSelected) {
              setGlobalHover(elementId, false);
              setIsHovered(false);
            }
          }}
        >
          <div className="max-w-sm">
            <div className={`bg-neutral-900 rounded-lg shadow-2xl p-3 backdrop-blur-sm bg-opacity-95 ${
              isSelected 
                ? 'border-2 border-yellow-400/70 shadow-yellow-400/20' 
                : 'border border-purple-500/50'
            }`}>
              {/* Selection indicator */}
              {isSelected && (
                <div className="flex items-center gap-2 mb-2 text-xs text-yellow-300 bg-yellow-900/30 px-2 py-1 rounded border border-yellow-600/50">
                  <Lock className="w-3 h-3" />
                  <span>Selected - Element info locked</span>
                </div>
              )}
              <EnhancedElementDebugInfo 
                element={element} 
                configuration={configuration}
                context={context}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugWrapper;
