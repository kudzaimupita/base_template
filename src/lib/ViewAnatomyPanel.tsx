import React, { useState, useMemo, useEffect } from 'react';
import { 
  Database, 
  Loader2, 
  Eye, 
  Settings, 
  Globe, 
  Users, 
  FileText, 
  ArrowRight, 
  Play,
  Pause,
  RotateCw,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Zap,
  Upload,
  Download,
  RefreshCw,
  Target,
  Layers,
  Clock,
  MousePointer,
  Edit3,
  Send,
  Lock,
  Unlock,
  Component,
  Code
} from 'lucide-react';

interface ViewAnatomyPanelProps {
  elements: any[];
  currentApplication: any;
  isEnabled: boolean;
}

// Helper function to find element by ID
const findElementById = (elements, id) => {
  const findInElements = (elementList) => {
    for (const element of elementList) {
      // Skip virtual elements
      if (element.isVirtual) continue;
      
      if (element.i === id || element.componentId === id) {
        return element;
      }
      if (element.children) {
        for (const childId of element.children) {
          const childElement = elements.find(el => el.i === childId || el.componentId === childId);
          if (childElement && !childElement.isVirtual) {
            const found = findInElements([childElement]);
            if (found) return found;
          }
        }
      }
    }
    return null;
  };
  return findInElements(elements);
};

// Enhanced sequence steps extractor with nested loop handling
const extractSequenceSteps = (viewData) => {
  const steps = [];
  
  const processElement = (element) => {
    if (element?.isVirtual) return; // Skip virtual elements
    
    if (element?.configuration?._overrides_) {
      element.configuration._overrides_.forEach(override => {
        if (override.plugins) {
          const sortedPlugins = [...override.plugins].sort((a, b) => {
            return (a.sequence || a.index || 0) - (b.sequence || b.index || 0);
          });
          
          sortedPlugins.forEach((plugin, index) => {
            const stepData = {
              id: plugin.id || `${plugin.type}-${index}`,
              elementName: element.name || element.componentId || 'Unknown Element',
              elementId: element.i || element.componentId,
              sequence: plugin.sequence || plugin.index || index,
              plugin
            };

            if (plugin.type === 'controller-invoke') {
              steps.push({
                ...stepData,
                type: 'controller-invoke',
                name: plugin.name || 'API Call',
                controller: plugin.controller,
                description: `${stepData.elementName} fetches data from ${plugin.controller}`,
                icon: Database,
                color: 'bg-purple-600',
                details: {
                  endpoint: plugin.controller,
                  method: plugin.method || 'POST',
                  sendAsMultipart: plugin.sendAsMultipart,
                  body: plugin.body,
                  headers: plugin.headers
                }
              });
            } else if (plugin.type === 'set-state' || plugin.type === 'state-setState') {
              const targetElement = plugin.elementOverride ? 
                findElementById(viewData?.layout, plugin.elementOverride) : 
                element;
              const targetName = targetElement?.name || targetElement?.componentId || 'Current Element';
              
              steps.push({
                ...stepData,
                type: 'set-state',
                name: plugin.name || 'Update State',
                stateKey: plugin.stateKey || plugin.key,
                targetElement: targetName,
                description: `Sets ${plugin.stateKey || plugin.key || 'state'} in ${targetName}`,
                icon: Target,
                color: 'bg-orange-500',
                details: {
                  stateKey: plugin.stateKey || plugin.key,
                  value: plugin.value,
                  targetElementName: targetName
                }
              });
            } else if (plugin.type === 'loop') {
              // Extract nested steps within the loop
              const nestedSteps = [];
              
              // Check if loop has nested plugins/workflows
              if (plugin.children || plugin.workflows || plugin.steps) {
                const loopWorkflows = plugin.children || plugin.workflows || plugin.steps;
                loopWorkflows.forEach((nestedPlugin, nestedIndex) => {
                  if (nestedPlugin.type === 'controller-invoke') {
                    nestedSteps.push({
                      type: 'controller-invoke',
                      name: nestedPlugin.name || 'Loop API Call',
                      description: `Fetch data for each item`,
                      icon: Database,
                      color: 'text-purple-400',
                      sequence: nestedIndex
                    });
                  } else if (nestedPlugin.type === 'set-state' || nestedPlugin.type === 'state-setState') {
                    nestedSteps.push({
                      type: 'set-state',
                      name: nestedPlugin.name || 'Update Item State',
                      description: `Update state for each item`,
                      icon: Target,
                      color: 'text-orange-400',
                      sequence: nestedIndex
                    });
                  } else if (nestedPlugin.type === 'navigate') {
                    nestedSteps.push({
                      type: 'navigate',
                      name: nestedPlugin.name || 'Navigate Item',
                      description: `Navigate for each item`,
                      icon: ArrowRight,
                      color: 'text-green-400',
                      sequence: nestedIndex
                    });
                  }
                });
              }

              // If no explicit nested steps, infer common loop patterns
              if (nestedSteps.length === 0) {
                // Common loop pattern: iterate → render → optionally update
                nestedSteps.push({
                  type: 'iterate',
                  name: 'Iterate Items',
                  description: 'Process each data item',
                  icon: RefreshCw,
                  color: 'text-blue-400',
                  sequence: 0
                });
                
                nestedSteps.push({
                  type: 'render',
                  name: 'Render Item',
                  description: 'Display each item',
                  icon: Component,
                  color: 'text-purple-400',
                  sequence: 1
                });

                // Check if there are state operations that might happen per item
                const hasStateOperations = sortedPlugins.some(p => 
                  p.type === 'set-state' || p.type === 'state-setState'
                );
                if (hasStateOperations) {
                  nestedSteps.push({
                    type: 'update',
                    name: 'Update State',
                    description: 'Update item state',
                    icon: Target,
                    color: 'text-orange-400',
                    sequence: 2
                  });
                }
              }
              
              steps.push({
                ...stepData,
                type: 'loop',
                name: plugin.name || 'Dynamic List',
                dataSource: plugin.dataSource,
                description: `Loops through ${plugin.dataSource || 'data items'}`,
                icon: RefreshCw,
                color: 'bg-blue-600',
                nestedSteps: nestedSteps, // Include nested steps
                details: {
                  dataSource: plugin.dataSource,
                  itemVariable: plugin.itemVariable || 'item',
                  nestedWorkflows: nestedSteps.length
                }
              });
            } else if (plugin.type === 'navigate') {
              const targetElement = plugin.navigateTo ? 
                findElementById(viewData?.layout, plugin.navigateTo) : null;
              const targetName = targetElement?.name || plugin.to || plugin.href || 'Destination';
              
              steps.push({
                ...stepData,
                type: 'navigate',
                name: plugin.name || 'Navigation',
                destination: targetName,
                description: `Navigate to ${targetName}`,
                icon: ArrowRight,
                color: 'bg-green-600',
                details: {
                  navigateTo: plugin.navigateTo,
                  targetElementName: targetName
                }
              });
            }
          });
        }
      });
    }
  };

  // Process all elements in the layout
  const processAllElements = (elements) => {
    if (Array.isArray(elements)) {
      elements.forEach(processElement);
    } else if (elements?.layout) {
      elements.layout.forEach(processElement);
    }
  };

  if (viewData?.layout) {
    processAllElements(viewData.layout);
  }

  return steps.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
};

// Enhanced compact sequence overview with nested loop visualization
const CompactSequenceOverview = ({ steps }) => {
  if (steps.length === 0) return null;

  return (
    <div className="bg-neutral-800/30 rounded-lg p-3 border border-neutral-700/50 zoomed6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
          <RotateCw className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-medium text-neutral-100">Workflow Sequence</span>
        <span className="bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded-full text-xs">
          {steps.length} steps
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;
          const isLoop = step.type === 'loop';
          
          return (
            <React.Fragment key={step.id || index}>
              <div className="flex flex-col items-center group relative">
                <div className={`w-8 h-8 rounded-lg ${step.color} flex items-center justify-center text-xs font-bold text-white shadow-lg transition-transform hover:scale-110`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs text-neutral-400 mt-1 max-w-16 truncate text-center">
                  {step.name}
                </span>
                
                {/* Enhanced loop visualization with nested steps */}
                {isLoop && step.nestedSteps && step.nestedSteps.length > 0 && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-neutral-900 border border-blue-500/30 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-48">
                    <div className="text-xs font-medium text-blue-300 mb-2 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      Loop Steps ({step.nestedSteps.length})
                    </div>
                    <div className="space-y-1">
                      {step.nestedSteps.map((nestedStep, nestedIndex) => {
                        const NestedIcon = nestedStep.icon;
                        return (
                          <div key={nestedIndex} className="flex items-center gap-2 text-xs">
                            <div className="w-4 h-4 bg-neutral-700 rounded flex items-center justify-center">
                              <NestedIcon className="w-2 h-2 text-neutral-300" />
                            </div>
                            <span className={`${nestedStep.color} font-medium`}>
                              {nestedStep.name}
                            </span>
                            <span className="text-neutral-500 text-xs">
                              {nestedStep.description}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-blue-500/30"></div>
                  </div>
                )}
              </div>
              
              {!isLast && (
                <ArrowRight className="w-4 h-4 text-neutral-500" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// Extract comprehensive interaction information with workflows
const extractInteractionInfo = (elements) => {
  const interactions = [];
  
  const processElement = (element) => {
    // Skip virtual elements
    if (element.isVirtual) return;
    
    const config = element.configuration || {};
    
    // Check for event handlers and their associated workflows
    Object.keys(config).forEach(key => {
      if (key.toLowerCase().startsWith('on')) {
        const eventType = key.replace(/^on/, '').toLowerCase();
        
        // Extract workflow details from the handler
        const workflows = [];
        if (element.configuration?._overrides_) {
          element.configuration._overrides_.forEach(override => {
            if (override.trigger === key && override.plugins) {
              override.plugins.forEach(plugin => {
                workflows.push({
                  type: plugin.type,
                  name: plugin.name,
                  details: plugin
                });
              });
            }
          });
        }
        
        interactions.push({
          element: element.name || element.componentId,
          elementId: element.i || element.componentId,
          event: eventType,
          handler: config[key],
          type: getInteractionType(eventType),
          icon: getInteractionIcon(eventType),
          description: getInteractionDescription(eventType, element),
          workflows: workflows
        });
      }
    });

    // Check for form elements
    if (config.type === 'input' || config.type === 'textarea' || config.type === 'select') {
      interactions.push({
        element: element.name || element.componentId,
        elementId: element.i || element.componentId,
        event: 'input',
        type: 'form',
        icon: Edit3,
        description: `User can input data`,
        workflows: []
      });
    }

    // Check for navigation
    if (config.href || config.to) {
      interactions.push({
        element: element.name || element.componentId,
        elementId: element.i || element.componentId,
        event: 'navigation',
        type: 'navigation',
        icon: ArrowRight,
        description: `Links to ${config.href || config.to}`,
        workflows: []
      });
    }

    // Process children recursively
    if (element.children) {
      element.children.forEach(childId => {
        const childElement = elements.find(el => el.i === childId || el.componentId === childId);
        if (childElement && !childElement.isVirtual) {
          processElement(childElement);
        }
      });
    }
  };

  elements.filter(el => !el.isVirtual).forEach(processElement);
  return interactions;
};

const getInteractionType = (eventType) => {
  const types = {
    click: 'action',
    submit: 'form',
    change: 'input',
    focus: 'input',
    blur: 'input',
    hover: 'visual',
    mouseenter: 'visual',
    mouseleave: 'visual'
  };
  return types[eventType] || 'interaction';
};

const getInteractionIcon = (eventType) => {
  const icons = {
    click: MousePointer,
    submit: Send,
    change: Edit3,
    focus: Lock,
    blur: Unlock,
    hover: Eye,
    mouseenter: Eye,
    mouseleave: Eye
  };
  return icons[eventType] || Zap;
};

const getInteractionDescription = (eventType, element) => {
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

const CompactStats: React.FC<{ analysis: any, interactions: any[] }> = ({ analysis, interactions }) => {
  return (
    <div className="grid grid-cols-4 gap-1">
      <div className="bg-neutral-800 rounded-md p-1 border border-neutral-700 text-center">
        <div className="text-sm font-bold text-purple-400">{analysis.dataFetchers}</div>
        <div className="text-xs text-neutral-400">APIs</div>
      </div>
      <div className="bg-neutral-800 rounded-md p-1 border border-neutral-700 text-center">
        <div className="text-sm font-bold text-orange-400">{analysis.stateSetters}</div>
        <div className="text-xs text-neutral-400">States</div>
      </div>
      <div className="bg-neutral-800 rounded-md p-1 border border-neutral-700 text-center">
        <div className="text-sm font-bold text-blue-400">{analysis.loopComponents}</div>
        <div className="text-xs text-neutral-400">Loops</div>
      </div>
      <div className="bg-neutral-800 rounded-md p-1 border border-neutral-700 text-center">
        <div className="text-sm font-bold text-green-400">{interactions.length}</div>
        <div className="text-xs text-neutral-400">Actions</div>
      </div>
    </div>
  );
};

const ViewAnatomyPanel: React.FC<ViewAnatomyPanelProps> = ({
  elements,
  currentApplication,
  isEnabled
}) => {
  const [showMore, setShowMore] = useState(false);

  // Extensive debugging
  useEffect(() => {
    
    if (elements && elements.length > 0) {
      
      // Check all elements for overrides
      elements.forEach((element, index) => {
        if (element?.configuration?._overrides_) {
          element.configuration._overrides_.forEach((override, oIndex) => {
            if (override.plugins) {
            }
          });
        }
      });
    }
  }, [elements, currentApplication, isEnabled]);

  // Make sure we have valid elements data
  const validElements = elements || [];
  
  // Debug: Force create some mock data to test the UI
  const mockElements = [
    {
      name: "Test Container",
      i: "test-container-1",
      configuration: {
        _overrides_: [
          {
            plugins: [
              {
                id: "mock-api-1",
                type: "controller-invoke",
                name: "fetch_users",
                controller: "users-controller",
                sequence: 1
              },
              {
                id: "mock-state-1", 
                type: "set-state",
                name: "update_users",
                stateKey: "users",
                sequence: 2
              }
            ]
          }
        ]
      }
    }
  ];

  // Use mock data temporarily for testing
  const testElements = validElements.length > 0 ? validElements : mockElements;

  const sequenceSteps = useMemo(() => {
    return extractSequenceSteps({ layout: testElements });
  }, [testElements]);

  const interactions = useMemo(() => {
    const allInteractions = extractInteractionInfo(testElements);
    
    // Remove duplicates based on element + event combination
    const uniqueInteractions = allInteractions.filter((interaction, index, array) => {
      const key = `${interaction.element}-${interaction.event}`;
      return array.findIndex(item => `${item.element}-${item.event}` === key) === index;
    });
    
    return uniqueInteractions;
  }, [testElements]);

  // Analyze the view to extract meaningful insights
  const viewAnalysis = useMemo(() => {
    const analysis = {
      totalElements: testElements.filter(el => !el.isVirtual).length,
      dataFetchers: 0,
      stateSetters: 0,
      loopComponents: 0,
      navigators: 0,
      controllers: new Set(),
      stateKeys: new Set()
    };

    const analyzeElement = (element) => {
      // Skip virtual elements
      if (element.isVirtual) return;
      
      // Analyze overrides and plugins
      if (element.configuration?._overrides_) {
        element.configuration._overrides_.forEach(override => {
          if (override.plugins) {
            override.plugins.forEach(plugin => {
              switch (plugin.type) {
                case 'controller-invoke':
                  analysis.dataFetchers++;
                  if (plugin.controller) {
                    analysis.controllers.add(plugin.controller);
                  }
                  break;
                case 'set-state':
                case 'state-setState':
                  analysis.stateSetters++;
                  if (plugin.stateKey || plugin.key) {
                    analysis.stateKeys.add(plugin.stateKey || plugin.key);
                  }
                  break;
                case 'loop':
                  analysis.loopComponents++;
                  break;
                case 'navigate':
                  analysis.navigators++;
                  break;
              }
            });
          }
        });
      }

      // Analyze children recursively
      if (element.children) {
        element.children.forEach(childId => {
          const childElement = testElements.find(el => el.i === childId || el.componentId === childId);
          if (childElement && !childElement.isVirtual) {
            analyzeElement(childElement);
          }
        });
      }
    };

    testElements.filter(el => !el.isVirtual).forEach(analyzeElement);
    return analysis;
  }, [testElements]);

  // Debug the results

  // Force show for debugging

  return (
    <div className="bg-gradient-to-r from-neutral-950 to-neutral-900 border-b border-neutral-700 p-2 mb-2">
      {/* Compact header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-purple-600 rounded-md flex items-center justify-center">
            <Eye className="w-3 h-3 text-white" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-neutral-100">Anatomy</h2>
            <p className="text-xs text-neutral-400">{currentApplication?.name || 'Current View'}</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-1 px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-xs hover:bg-neutral-600 text-neutral-200"
        >
          {showMore ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {showMore ? 'Less' : 'More'}
        </button>
      </div>

      {/* Compact stats */}
      <CompactStats analysis={viewAnalysis} interactions={interactions} />

      {/* Sequence overview - always visible */}
      {sequenceSteps.length > 0 && (
        <div className="mt-2">
          <CompactSequenceOverview steps={sequenceSteps} />
        </div>
      )}

      {/* Expanded details */}
      {showMore && (
        <div className="mt-2 space-y-2">
          {/* Detailed workflow steps */}
          {sequenceSteps.length > 0 && (
            <div className="bg-neutral-800 rounded-md p-2 border border-neutral-700">
              <h4 className="text-xs font-medium text-neutral-100 mb-1">Detailed Workflow</h4>
              <div className="space-y-2">
                {sequenceSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="bg-neutral-900 rounded-md p-2 border border-neutral-700">
                      <div className="flex items-start gap-2">
                        <div className={`w-4 h-4 rounded-full ${step.color} flex items-center justify-center text-white font-bold text-xs`}>
                          {step.id}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1 mb-1">
                            <Icon className="w-3 h-3 text-neutral-300" />
                            <span className="font-medium text-neutral-100 text-xs">{step.name}</span>
                            <span className="bg-neutral-700 text-neutral-300 px-1 py-0.5 rounded text-xs">
                              {step.type}
                            </span>
                          </div>
                          <p className="text-neutral-300 text-xs mb-1">{step.description}</p>
                          
                          {/* Component details */}
                          <div className="bg-neutral-800 rounded p-1 text-xs space-y-0.5">
                            <div className="flex items-center gap-1">
                              <Component className="w-2 h-2 text-blue-400" />
                              <span className="text-blue-400 text-xs">Component:</span>
                              <span className="text-neutral-300 text-xs">{step.elementName}</span>
                            </div>
                            
                            {step.details && (
                              <div className="space-y-0.5 ml-3">
                                {step.type === 'controller-invoke' && (
                                  <>
                                    <div className="text-purple-400 text-xs">→ Endpoint: {step.details.endpoint}</div>
                                    <div className="text-purple-400 text-xs">→ Method: {step.details.method}</div>
                                    {step.details.sendAsMultipart && (
                                      <div className="text-orange-400 text-xs">→ Multipart: Yes</div>
                                    )}
                                  </>
                                )}
                                
                                {step.type === 'set-state' && (
                                  <>
                                    <div className="text-orange-400 text-xs">→ State Key: {step.details.stateKey}</div>
                                    {step.details.targetElementName && (
                                      <div className="text-orange-400 text-xs">→ Target: {step.details.targetElementName}</div>
                                    )}
                                  </>
                                )}
                                
                                {step.type === 'navigate' && step.details.targetElementName && (
                                  <div className="text-green-400 text-xs">→ Target: {step.details.targetElementName}</div>
                                )}
                                
                                {step.type === 'loop' && (
                                  <>
                                    <div className="text-blue-400 text-xs">→ Data Source: {step.details.dataSource}</div>
                                    <div className="text-blue-400 text-xs">→ Item Variable: {step.details.itemVariable}</div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactions with workflows - Detailed Step Visualization */}
          {interactions.length > 0 && (
            <div className="bg-neutral-800 rounded-md p-2 border border-neutral-700">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-medium text-neutral-100">Actions ({interactions.length})</h4>
                {interactions.length > 6 && (
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="text-xs text-purple-400 hover:text-purple-300 px-1 py-0.5 bg-neutral-700 rounded"
                  >
                    {showMore ? 'Less' : `+${interactions.length - 6}`}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                {interactions.slice(0, showMore ? interactions.length : 6).map((interaction, index) => {
                  const Icon = interaction.icon;
                  
                  // Create detailed workflow steps based on common patterns
                  const getDetailedWorkflowSteps = (workflows, interactionType) => {
                    if (workflows.length === 0) {
                      // Default workflows based on interaction type
                      switch (interactionType) {
                        case 'click':
                          return [
                            { label: 'click', icon: MousePointer, color: 'text-green-400' },
                            { label: 'action', icon: Zap, color: 'text-yellow-400' }
                          ];
                        case 'submit':
                          return [
                            { label: 'validate', icon: CheckCircle, color: 'text-blue-400' },
                            { label: 'submit', icon: Send, color: 'text-green-400' },
                            { label: 'loading', icon: Loader2, color: 'text-orange-400' }
                          ];
                        case 'change':
                          return [
                            { label: 'input', icon: Edit3, color: 'text-blue-400' },
                            { label: 'setState', icon: Target, color: 'text-orange-400' }
                          ];
                        case 'focus':
                          return [
                            { label: 'focus', icon: Lock, color: 'text-blue-400' },
                            { label: 'highlight', icon: Eye, color: 'text-purple-400' }
                          ];
                        default:
                          return [
                            { label: 'trigger', icon: Play, color: 'text-green-400' }
                          ];
                      }
                    }

                    // Build workflow from actual workflow data
                    const steps = [];
                    
                    // Add initial trigger
                    steps.push({ 
                      label: interactionType, 
                      icon: interaction.icon, 
                      color: 'text-green-400' 
                    });

                    workflows.forEach(workflow => {
                      if (workflow.type === 'controller-invoke') {
                        steps.push({ label: 'loading', icon: Loader2, color: 'text-orange-400' });
                        steps.push({ label: 'fetch', icon: Database, color: 'text-purple-400' });
                      } else if (workflow.type === 'set-state' || workflow.type === 'state-setState') {
                        steps.push({ label: 'setState', icon: Target, color: 'text-orange-400' });
                        steps.push({ label: 'update', icon: RefreshCw, color: 'text-blue-400' });
                      } else if (workflow.type === 'navigate') {
                        steps.push({ label: 'navigate', icon: ArrowRight, color: 'text-green-400' });
                      } else if (workflow.type === 'loop') {
                        steps.push({ label: 'loop', icon: RefreshCw, color: 'text-blue-400' });
                        steps.push({ label: 'render', icon: Layers, color: 'text-purple-400' });
                      }
                    });

                    // Add common ending steps for complex workflows
                    if (workflows.length > 1) {
                      steps.push({ label: 'animate', icon: Play, color: 'text-yellow-400' });
                    }

                    return steps;
                  };

                  const workflowSteps = getDetailedWorkflowSteps(interaction.workflows, interaction.event);
                  
                  return (
                    <div key={index} className="p-2 bg-neutral-900 rounded border border-neutral-700/50 hover:border-neutral-600 transition-colors">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                          <Icon className="w-3 h-3 text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="font-medium text-neutral-100 text-xs truncate">{interaction.element}</span>
                            <span className="bg-neutral-700 text-neutral-300 px-1 py-0.5 rounded text-xs flex-shrink-0">
                              {interaction.event}
                            </span>
                            {interaction.workflows.length > 0 && (
                              <span className="bg-blue-900 text-blue-300 px-1 py-0.5 rounded text-xs flex-shrink-0">
                                {interaction.workflows.length}w
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-400 mb-1 truncate">
                            {interaction.description}
                          </div>
                          
                          {/* Detailed Workflow Steps */}
                          {workflowSteps.length > 0 && (
                            <div className="mt-1">
                              <div className="flex items-center flex-wrap gap-1">
                                {workflowSteps.slice(0, 5).map((step, stepIndex) => {
                                  const StepIcon = step.icon;
                                  const isLast = stepIndex === Math.min(workflowSteps.length, 5) - 1;
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
                                {workflowSteps.length > 5 && (
                                  <span className="text-xs text-neutral-500 ml-1">+{workflowSteps.length - 5}</span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Show actual workflow names if available */}
                          {interaction.workflows.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {interaction.workflows.slice(0, 2).map((workflow, wfIndex) => (
                                <span key={wfIndex} className="text-xs text-blue-400 bg-blue-900/20 px-1 py-0.5 rounded">
                                  {workflow.name || workflow.type}
                                </span>
                              ))}
                              {interaction.workflows.length > 2 && (
                                <span className="text-xs text-neutral-500">
                                  +{interaction.workflows.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Show grid pattern hint */}
              <div className="text-xs text-neutral-500 mt-1 text-center">
                Hover elements in view for details
              </div>
            </div>
          )}

          {/* Hover Effects Summary */}
          <div className="bg-neutral-800 rounded-md p-2 border border-neutral-700">
            <h4 className="text-xs font-medium text-neutral-100 mb-1">Element Effects</h4>
            <div className="text-xs text-neutral-300 space-y-0.5">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <span>Hover any element to see its workflow details</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Purple outlines indicate elements with operations</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Tooltips show step-by-step component details</span>
              </div>
            </div>
          </div>

          {/* Controllers and state keys */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {viewAnalysis.controllers.size > 0 && (
              <div className="bg-neutral-800 rounded-md p-3 border border-neutral-700">
                <h4 className="text-sm font-medium text-neutral-100 mb-2">API Controllers</h4>
                <div className="flex flex-wrap gap-1">
                  {Array.from(viewAnalysis.controllers).map(controller => (
                    <span key={controller} className="bg-purple-900 text-purple-300 px-2 py-1 rounded text-xs">
                      {controller}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {viewAnalysis.stateKeys.size > 0 && (
              <div className="bg-neutral-800 rounded-md p-3 border border-neutral-700">
                <h4 className="text-sm font-medium text-neutral-100 mb-2">State Variables</h4>
                <div className="flex flex-wrap gap-1">
                  {Array.from(viewAnalysis.stateKeys).map(stateKey => (
                    <span key={stateKey} className="bg-orange-900 text-orange-300 px-2 py-1 rounded text-xs">
                      {stateKey}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAnatomyPanel; 