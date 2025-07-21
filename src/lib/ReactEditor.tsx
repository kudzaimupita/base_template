

import * as AntCharts from '@ant-design/plots';
import * as AntDesign from 'antd';
import * as MUI from '@mui/material';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  // Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  // TreemapChart,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  Brush,
  ErrorBar
} from 'recharts';

// import { Tooltip } from '../../../../../components/shadcn/tooltip';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ErrorBoundary } from 'react-error-boundary';
import FormSc from '@rjsf/antd';
import defaults from 'json-schema-defaults';
import { genericEventHandlers } from './eventHandlers';
import { useSelector } from 'react-redux';
import { IconRenderer } from './IconRenderer';

const JsxParser = React.lazy(() => import('react-jsx-parser'));
const fallbackRender = ({ error }) => (
  <div role="alert">
    <p>Something went wrong with the JSX parsing:</p>
    <pre
      style={{
        color: 'red',
      }}
    >
      {error.message}
    </pre>
  </div>
);

const MyComponent = (props) => {
  const component = props?.meta?.config?.allComponentsRaw?.find((item) => item._id === props.meta?.componentId);
  const containerRef = useRef(null);
  const tab = props?.meta?.config?.id;
  const id = props?.meta?.config?.id;
  const [err, setErr] = useState(null);
  const appState = useSelector((state) => state.appState);
  const navigate = useNavigate();
  const propsData = appState?.[props?.meta?.i] || {};

  const AntComponents = useMemo(
    () => ({
      ...Object.entries(AntDesign).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [`Ant${key}`]: value,
        }),
        {}
      ),
    }),
    []
  );

  const AntDCharts = useMemo(
    () =>
      Object.entries(AntCharts).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [`AntChart${key}`]: value,
        }),
        {}
      ),
    []
  );

  // Add Recharts components with Recharts prefix
  const RechartsComponents = useMemo(
    () => ({
      RechartsAreaChart: AreaChart,
      RechartsArea: Area,
      RechartsBarChart: BarChart,
      RechartsBar: Bar,
      RechartsLineChart: LineChart,
      RechartsLine: Line,
      RechartsPieChart: PieChart,
      RechartsPie: Pie,
      RechartsCell: Cell,
      RechartsXAxis: XAxis,
      RechartsYAxis: YAxis,
      RechartsCartesianGrid: CartesianGrid,
      // RechartsTooltip: Tooltip,
      RechartsLegend: Legend,
      RechartsResponsiveContainer: ResponsiveContainer,
      RechartsScatterChart: ScatterChart,
      RechartsScatter: Scatter,
      RechartsComposedChart: ComposedChart,
      RechartsRadialBarChart: RadialBarChart,
      RechartsRadialBar: RadialBar,
      // RechartsTreemapChart: TreemapChart,
      RechartsTreemap: Treemap,
      RechartsFunnelChart: FunnelChart,
      RechartsFunnel: Funnel,
      RechartsLabelList: LabelList,
      RechartsReferenceLine: ReferenceLine,
      RechartsReferenceArea: ReferenceArea,
      RechartsReferenceDot: ReferenceDot,
      RechartsBrush: Brush,
      RechartsErrorBar: ErrorBar,
    }),
    []
  );

  // Add MUI components with Mui prefix
  const MuiComponents = useMemo(
    () => ({
      ...Object.entries(MUI).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [`Mui${key}`]: value,
        }),
        {}
      ),
    }),
    []
  );

  // Add Shadcn components with Shadcn prefix - Complete list with all sub-components
  const ShadcnComponents = useMemo(
    () => ({
     
      
    }),
    []
  );

  const defaultData = useMemo(
    () => ({
      ...defaults(props?.data?.props?.schema || {}),
    }),
    [props?.data?.props?.schema]
  );

  function deepReplace(obj, visited = new Set()) {
    if (obj && typeof obj === 'object') {
      if (visited.has(obj)) {
        return obj;
      }
      visited.add(obj);

      const clone = Array.isArray(obj) ? [...obj] : { ...obj };

      if (Array.isArray(clone)) {
        return clone.map((item) => deepReplace(item, visited));
      }

      if (clone?.hasOwnProperty('name') && clone?.hasOwnProperty('set') && clone?.hasOwnProperty('setName')) {
        return (
          <IconRenderer
            icon={
              clone || {
                name: 'FaHouse',
                set: 'Fa6',
                setName: 'Font Awesome 6',
              }
            }
          />
        );
      }
      if (clone?.hasOwnProperty('_children_')) {
        return props?.meta?.config?.renderChildren?.([]);
      }

      for (let key in clone) {
        if (clone.hasOwnProperty(key)) {
          clone[key] = deepReplace(clone[key], visited);
        }
      }

      return clone;
    }

    return obj;
  }

  const eventHandlerProps = useMemo(() => {
    const han = {};

    Object.keys(props?.props || {})?.forEach((key) => {
      const item = props.props[key];
      const modifiedItem = deepReplace(item);

      const hasProperties =
        modifiedItem?.hasOwnProperty('name') &&
        modifiedItem?.hasOwnProperty('set') &&
        modifiedItem?.hasOwnProperty('setName');

      if (Array.isArray(modifiedItem?.plugins)) {
        modifiedItem.plugins = modifiedItem.plugins.map((plugin) => {
          return deepReplace(plugin);
        });

        han[key] = (...args) => {
          const eventData = {
            ...args.reduce((acc, arg, index) => {
              acc[`arg${index}`] = arg;
              return acc;
            }, {}),
          };
          return props?.meta?.config?.createEventHandler(eventData, modifiedItem, props?.meta?.meta?.i);
        };

        return modifiedItem.plugins;
      }

      han[key] = modifiedItem;
    });

    return han;
  }, [props, id, navigate]);

  const bindings = useMemo(() => {
    const eventHandlerPropNames = new Set(Object.keys(genericEventHandlers?.properties));

    const filteredProps = {};
    for (const key in props.props) {
      if (!eventHandlerPropNames.has(key)) {
        filteredProps[key] = props.props[key];
      }
    }

    return {
      ...defaultData,
      ...filteredProps,
      ...propsData,
      ...eventHandlerProps,
      currentLayout: props?.meta?.layout,
      _parentId_: props?.meta?.i,
      _setItemToEdit_: props.setItemToEdit,
      _allComponentsRaw_: props.allComponentsRaw,
      _currentItem_: props.currentItem,
      _renderComponent_: props.renderComponent,
      _checked_: props.checked,
      _width_: props.width,
      _breakpoint_: props.breakpoint,
      _gridLayout_: props.gridLayout,
      _allComponents_: props.allComponents,
      children: props?.meta?.config?.renderChildren?.([]),
    };
  }, [
    defaultData,
    props.props,
    props.children,
    JSON.stringify(propsData),
    eventHandlerProps,
  ]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.pointerEvents = props.editMode ? 'none' : 'auto';
    }
  }, [props.editMode]);

  return (
    <>
      {err ? (
        <div className="text-red-500">{JSON.stringify(err)}</div>
      ) : (
        <ErrorBoundary fallbackRender={fallbackRender}>
          <Suspense fallback={<div>{}</div>}>
            <JsxParser
              renderInWrapper={false}
              className={'w-full group-container cube ' + (component?.isContainer ? ' h-full' : '')}
              renderError={setErr}
              jsx={props.jsx}
              components={{
                ...AntComponents,
                ...AntDCharts,
                ...MuiComponents,
                ...ShadcnComponents,
                ...RechartsComponents,
                AntSchemaForm: FormSc,
              }}
              blacklistedAttrs={[]}
              bindings={bindings}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </>
  );
};
export default MyComponent;