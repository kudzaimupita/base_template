import * as AntCharts from '@ant-design/plots';
import * as AntDesign from 'antd';
import { ConfigProvider } from 'antd';
import * as MUI from '@mui/material';

// React Quill imports
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';

// React Leaflet imports
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Video React imports
import { Player as VideoPlayer } from 'video-react';
import 'video-react/dist/video-react.css';

// Wavesurfer imports
import { useWavesurfer, WaveSurferOptions } from '@wavesurfer/react';

// Nivo charts imports
import { ResponsiveBar, Bar as NivoBar } from '@nivo/bar';
import { ResponsiveLine, Line as NivoLine } from '@nivo/line';
import { ResponsivePie, Pie as NivoPie } from '@nivo/pie';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { ResponsiveHeatMap, HeatMap as NivoHeatMap } from '@nivo/heatmap';
import { ResponsiveTreeMap } from '@nivo/treemap';
import { ResponsiveSunburst } from '@nivo/sunburst';
import { ResponsiveCalendar } from '@nivo/calendar';
import { ResponsiveChoropleth, ResponsiveGeoMap } from '@nivo/geo';
import { ResponsiveNetwork } from '@nivo/network';
import { ResponsiveSankey } from '@nivo/sankey';
import { ResponsiveRadar, Radar as NivoRadar } from '@nivo/radar';
import { ResponsiveSwarmPlot } from '@nivo/swarmplot';
import { ResponsiveBump } from '@nivo/bump';
import { ResponsiveStream } from '@nivo/stream';
import { ResponsiveWaffle } from '@nivo/waffle';
import { ResponsiveFunnel } from '@nivo/funnel';
import { ResponsiveMarimekko } from '@nivo/marimekko';
import { ResponsiveBoxPlot, BoxPlot as NivoBoxPlot } from '@nivo/boxplot';
import { ResponsiveBullet } from '@nivo/bullet';
import { ResponsiveCirclePacking } from '@nivo/circle-packing';
import { ResponsiveChord } from '@nivo/chord';
import { ResponsiveAreaBump } from '@nivo/bump';
import { ResponsiveParallelCoordinates } from '@nivo/parallel-coordinates';
import { ResponsiveRadialBar } from '@nivo/radial-bar';
import { ResponsivePolarBar } from '@nivo/polar-bar';
import { ResponsiveIcicle } from '@nivo/icicle';
import { ResponsiveTree } from '@nivo/tree';
import { ResponsiveVoronoi } from '@nivo/voronoi';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartJSTooltip,
  Legend as ChartJSLegend,
  ArcElement,
  RadialLinearScale,
  Filler,
} from 'chart.js';
import {
  Line as ChartJSLine,
  Bar as ChartJSBar,
  Pie as ChartJSPie,
  Doughnut as ChartJSDoughnut,
  Radar as ChartJSRadar,
  PolarArea as ChartJSPolarArea,
  Bubble as ChartJSBubble,
  Scatter as ChartJSScatter,
} from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartJSTooltip,
  ChartJSLegend,
  ArcElement,
  RadialLinearScale,
  Filler
);

// Recharts imports - comprehensive collection
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
  ZAxis,
  CartesianGrid,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  Brush,
  ErrorBar,
  RadarChart,
  Radar,
  Text,
  Sector,
  Curve,
  Dot,
  Cross,
  Polygon,
  Rectangle,
  Symbols,
  Customized,
  CartesianAxis,
  DefaultTooltipContent,
  DefaultLegendContent,
  Surface,
  Layer
} from 'recharts';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ErrorBoundary } from 'react-error-boundary';
import FormSc from '@rjsf/antd';
import { genericEventHandlers } from './eventHandlers';
import { useSelector } from 'react-redux';
import { IconRenderer } from './IconRenderer';
import WaveSurfer from '@wavesurfer/react';

const JsxParser = React.lazy(() => import('react-jsx-parser'));
const fallbackRender = ({ error }: { error: Error }) => (
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

const MyComponent = React.memo((props: any) => {
  // Removed the line causing constant refreshing: AntDesign.message.error('refreshing')
  const component = props?.meta?.config?.allComponentsRaw?.find((item: any) => item._id === props.meta?.componentId);
  const containerRef = useRef(null);
  const tab = props?.meta?.config?.id;
  const id = props?.meta?.config?.id;
  const [err, setErr] = useState(null);
  const appState = useSelector((state: any) => state.appState);
  const navigate = useNavigate();
  const propsData = appState?.[props?.meta?.i] || {};

  const AntComponents = useMemo(
    () => {
      const baseComponents = Object.entries(AntDesign).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [`Ant${key}`]: value,
        }),
        {}
      );

      // Create special wrappers for Modal and Drawer to render within container in edit mode
      const AntModalWrapper = React.forwardRef((modalProps: any, ref) => {
        return (
          <AntDesign.Modal
            {...modalProps}
            getContainer={props.editMode ? false : modalProps.getContainer}
            open={props.editMode ? true : modalProps.open}
            mask={props.editMode ? false : modalProps.mask}
            style={{
              ...modalProps.style,
              ...(props.editMode && {
                position: 'absolute',
                top: '200px',
                left: '50%',
                transform: 'translateX(-50%)',
                margin: '0',
                zIndex: 1000
              })
            }}
            ref={ref}
          />
        );
      });

      const AntDrawerWrapper = React.forwardRef((drawerProps: any, ref) => {
        return (
          <AntDesign.Drawer
            {...drawerProps}
            getContainer={props.editMode ? false : drawerProps.getContainer}
            open={props.editMode ? true : drawerProps.open}
            mask={props.editMode ? false : drawerProps.mask}
            placement={props.editMode ? 'right' : drawerProps.placement}
            style={{
              ...drawerProps.style,
              ...(props.editMode && {
                position: 'absolute',
                top: '50%',
                right: '20px',
                transform: 'translateY(-50%)',
                width: drawerProps.width || '320px',
                height: 'auto',
                maxHeight: '80%'
              })
            }}
            ref={ref}
          />
        );
      });

      const AntPopoverWrapper = React.forwardRef((popoverProps: any, ref) => {
        return (
          <AntDesign.Popover
            {...popoverProps}
            getPopupContainer={props.editMode ? () => false : popoverProps.getPopupContainer}
            open={props.editMode ? true : popoverProps.open}
            ref={ref}
          />
        );
      });

      const AntTooltipWrapper = React.forwardRef((tooltipProps: any, ref) => {
        return (
          <AntDesign.Tooltip
            {...tooltipProps}
            getPopupContainer={props.editMode ? () => false : tooltipProps.getPopupContainer}
            open={props.editMode ? true : tooltipProps.open}
            ref={ref}
          />
        );
      });

      const AntPopconfirmWrapper = React.forwardRef((popconfirmProps: any, ref) => {
        return (
          <AntDesign.Popconfirm
            {...popconfirmProps}
            getPopupContainer={props.editMode ? () => false : popconfirmProps.getPopupContainer}
            open={props.editMode ? true : popconfirmProps.open}
            ref={ref}
          />
        );
      });

      return {
        ...baseComponents,
        AntModal: AntModalWrapper,
        AntDrawer: AntDrawerWrapper,
        AntPopover: AntPopoverWrapper,
        AntTooltip: AntTooltipWrapper,
        AntPopconfirm: AntPopconfirmWrapper,
      };
    },
    [props.editMode]
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

  // Add ApexCharts components with Apex prefix
  const ApexComponents = useMemo(
    () => ({

    }),
    []
  );

  // Add Recharts components with Recharts prefix - comprehensive collection
  const RechartsComponents = useMemo(
    () => ({
      // Chart containers
      RechartsAreaChart: AreaChart,
      RechartsBarChart: BarChart,
      RechartsLineChart: LineChart,
      RechartsPieChart: PieChart,
      RechartsScatterChart: ScatterChart,
      RechartsComposedChart: ComposedChart,
      RechartsRadialBarChart: RadialBarChart,
      RechartsTreemap: Treemap,
      RechartsFunnelChart: FunnelChart,
      RechartsRadarChart: RadarChart,
      RechartsResponsiveContainer: ResponsiveContainer,

      // Chart elements
      RechartsArea: Area,
      RechartsBar: Bar,
      RechartsLine: Line,
      RechartsPie: Pie,
      RechartsCell: Cell,
      RechartsScatter: Scatter,
      RechartsRadialBar: RadialBar,
      RechartsFunnel: Funnel,
      RechartsRadar: Radar,

      // Axes
      RechartsXAxis: XAxis,
      RechartsYAxis: YAxis,
      RechartsZAxis: ZAxis,
      RechartsPolarAngleAxis: PolarAngleAxis,
      RechartsPolarRadiusAxis: PolarRadiusAxis,
      RechartsCartesianAxis: CartesianAxis,

      // Grids
      RechartsCartesianGrid: CartesianGrid,
      RechartsPolarGrid: PolarGrid,

      // Components
      RechartsTooltip: RechartsTooltip,
      RechartsLegend: Legend,
      RechartsLabelList: LabelList,
      RechartsBrush: Brush,
      RechartsErrorBar: ErrorBar,

      // Reference elements
      RechartsReferenceLine: ReferenceLine,
      RechartsReferenceArea: ReferenceArea,
      RechartsReferenceDot: ReferenceDot,

      // Shapes & Symbols
      RechartsText: Text,
      RechartsSector: Sector,
      RechartsCurve: Curve,
      RechartsDot: Dot,
      RechartsCross: Cross,
      RechartsPolygon: Polygon,
      RechartsRectangle: Rectangle,
      RechartsSymbols: Symbols,

      // Utility components
      RechartsCustomized: Customized,
      RechartsDefaultTooltipContent: DefaultTooltipContent,
      RechartsDefaultLegendContent: DefaultLegendContent,
      RechartsSurface: Surface,
      RechartsLayer: Layer,
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

  // Utility to parse dimensions from various formats
  const parseDimensions = (element: HTMLElement) => {
    const computedStyle = getComputedStyle(element);
    const classList = Array.from(element.classList);
    
    // Helper to convert Tailwind spacing to pixels (complete spacing scale)
    const tailwindToPixels = (value: string) => {
      const spacing: { [key: string]: number } = {
        '0': 0, '0.5': 2, '1': 4, '1.5': 6, '2': 8, '2.5': 10, '3': 12, '3.5': 14, '4': 16, '5': 20, 
        '6': 24, '7': 28, '8': 32, '9': 36, '10': 40, '11': 44, '12': 48, '14': 56, '16': 64, '20': 80, 
        '24': 96, '28': 112, '32': 128, '36': 144, '40': 160, '44': 176, '48': 192, '52': 208, '56': 224,
        '60': 240, '64': 256, '72': 288, '80': 320, '96': 384, 'auto': 0, 'full': 9999, 'screen': 1024
      };
      return spacing[value] || parseInt(value) || 0;
    };
    
    const getDimension = (type: 'width' | 'height') => {
      const prefix = type === 'width' ? 'w-' : 'h-';
      

      
      // 1. CSS variables have highest priority (can override everything)
      const cssVar = computedStyle.getPropertyValue(`--${type}`);
      if (cssVar) {

        return parseInt(cssVar);
      }
      
      // 2. Tailwind classes (highest specificity in normal CSS)
      const tailwindClasses = classList.filter(cls => cls.startsWith(prefix) && !cls.includes('['));
      if (tailwindClasses.length > 0) {
        const tailwindClass = tailwindClasses[0];
        const value = tailwindClass.replace(prefix, '');
        const pixels = tailwindToPixels(value);
        if (pixels > 0) return pixels;
      }
      
      // 3. Custom bracket values in classes: w-[200px], h-[300px]
      const bracketClass = classList.find(cls => cls.startsWith(prefix) && cls.includes('[') && cls.includes(']'));
      if (bracketClass) {
      
        const match = bracketClass.match(/\[(.+?)\]/);
        if (match) {
          const value = match[1];
    
          if (value.includes('px')) {
            const pixels = parseInt(value);

            return pixels;
          }
          if (value.includes('rem')) return parseInt(value) * 16;
          if (value.includes('%')) return (parseInt(value) / 100) * 800;
          const fallbackNum = parseInt(value) || 0;
    
          return fallbackNum;
        }
      }
      
      // 4. Fallback to inline styles/computed style (lowest priority)
      if (type === 'width') {
        return parseInt(computedStyle.width) || element.offsetWidth;
      } else {
        return parseInt(computedStyle.height) || element.offsetHeight;
      }
    };
    
    return {
      width: getDimension('width') || 800,
      height: getDimension('height') || 400
    };
  };

  // Simple responsive Nivo wrapper - reads actual container size
  const NivoLineWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          // Use offsetWidth/Height which ignore CSS transforms (zoom/pinch)
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          // Fallback to computed style if offset dimensions are 0
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
           
          } else {
            setDimensions({ width, height });
          
          }
        }
      };
      
      // Initial update
      updateDimensions();
      
      // Watch for container size changes
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateDimensions);
      });
      
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      
      return () => {
        resizeObserver.disconnect();
      };
    }, []);
    
    const { width, height, ...otherProps } = props;
    
    return (
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          minWidth: '200px',
          minHeight: '200px'
        }}
      >
        <NivoLine 
          {...otherProps} 
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>
    );
  };

  const NivoBarWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          let element = containerRef.current.closest('[class*="w-"], [style*="--width"]') as HTMLElement;
          if (!element) element = containerRef.current.parentElement as HTMLElement;
          
          if (element) {
            const newDimensions = parseDimensions(element);
            setDimensions(newDimensions);
          }
        }
      };
      
      updateDimensions();
      
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateDimensions);
      });
      
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
        const parent = containerRef.current.parentElement;
        if (parent) resizeObserver.observe(parent);
      }
      
      return () => resizeObserver.disconnect();
    }, []);
    
    const { width = '100%', height = '100%', ...otherProps } = props;
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        <NivoBar 
          {...otherProps} 
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>
    );
  };

    const NivoPieWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          let element = containerRef.current.closest('[class*="w-"], [style*="--width"]') as HTMLElement;
          if (!element) element = containerRef.current.parentElement as HTMLElement;
          
          if (element) {
            const newDimensions = parseDimensions(element);
            setDimensions(newDimensions);
          }
        }
      };
      
      updateDimensions();
      
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateDimensions);
      });
      
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
        const parent = containerRef.current.parentElement;
        if (parent) resizeObserver.observe(parent);
      }
      
      return () => resizeObserver.disconnect();
    }, []);

    const { width = '100%', height = '100%', ...otherProps } = props;
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        <NivoPie 
          {...otherProps} 
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>
    );
  };

  const NivoRadarWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          let element = containerRef.current.closest('[class*="w-"], [style*="--width"]') as HTMLElement;
          if (!element) element = containerRef.current.parentElement as HTMLElement;
          
          if (element) {
            const newDimensions = parseDimensions(element);
            setDimensions(newDimensions);
          }
        }
      };
      
      updateDimensions();
      
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateDimensions);
      });
      
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
        const parent = containerRef.current.parentElement;
        if (parent) resizeObserver.observe(parent);
      }
      
      return () => resizeObserver.disconnect();
    }, []);
    
    const { width = '100%', height = '100%', ...otherProps } = props;
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        <NivoRadar 
          {...otherProps} 
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>
    );
  };

  const NivoHeatMapWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          // Use offsetWidth/Height which ignore CSS transforms (zoom/pinch)
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          // Fallback to computed style if offset dimensions are 0
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      // Initial update
      updateDimensions();
      
      // Watch for container size changes
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateDimensions);
      });
      
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      
      return () => {
        resizeObserver.disconnect();
      };
    }, []);
    
    const { width, height, ...otherProps } = props;
    
    return (
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          minWidth: '200px',
          minHeight: '200px'
        }}
      >
        <NivoHeatMap 
          {...otherProps} 
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>
    );
  };

  const NivoBoxPlotWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          // Use offsetWidth/Height which ignore CSS transforms (zoom/pinch)
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          // Fallback to computed style if offset dimensions are 0
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      // Initial update
      updateDimensions();
      
      // Watch for container size changes
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateDimensions);
      });
      
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      
      return () => {
        resizeObserver.disconnect();
      };
    }, []);
    
    const { width, height, ...otherProps } = props;
    
    return (
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          minWidth: '200px',
          minHeight: '200px'
        }}
      >
        <NivoBoxPlot 
          {...otherProps} 
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>
    );
  };

  const NivoScatterPlotWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          // Use offsetWidth/Height which ignore CSS transforms (zoom/pinch)
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          // Fallback to computed style if offset dimensions are 0
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      // Initial update
      updateDimensions();
      
      // Watch for container size changes
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateDimensions);
      });
      
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      
      return () => {
        resizeObserver.disconnect();
      };
    }, []);
    
    const { width, height, ...otherProps } = props;
    
    return (
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          minWidth: '200px',
          minHeight: '200px'
        }}
      >
        <ResponsiveScatterPlot 
          {...otherProps} 
        />
      </div>
    );
  };

  const NivoAreaBumpWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          // Use offsetWidth/Height which ignore CSS transforms (zoom/pinch)
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          // Fallback to computed style if offset dimensions are 0
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      // Initial update
      updateDimensions();
      
      // Watch for container size changes
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateDimensions);
      });
      
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      
      return () => {
        resizeObserver.disconnect();
      };
    }, []);
    
    const { width, height, ...otherProps } = props;
    
    return (
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          minWidth: '200px',
          minHeight: '200px'
        }}
      >
        <ResponsiveAreaBump 
          {...otherProps} 
        />
      </div>
    );
  };

  const NivoBulletWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          // Use offsetWidth/Height which ignore CSS transforms (zoom/pinch)
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          // Fallback to computed style if offset dimensions are 0
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      // Initial update
      updateDimensions();
      
      // Watch for container size changes
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateDimensions);
      });
      
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      
      return () => {
        resizeObserver.disconnect();
      };
    }, []);
    
    const { width, height, ...otherProps } = props;
    
    return (
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          minWidth: '200px',
          minHeight: '200px'
        }}
      >
        <ResponsiveBullet 
          {...otherProps} 
        />
      </div>
    );
  };

  const NivoCirclePackingWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          // Use offsetWidth/Height which ignore CSS transforms (zoom/pinch)
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          // Fallback to computed style if offset dimensions are 0
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      // Initial update
      updateDimensions();
      
      // Watch for container size changes
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateDimensions);
      });
      
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      
      return () => {
        resizeObserver.disconnect();
      };
    }, []);
    
    const { width, height, ...otherProps } = props;
    
    return (
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          minWidth: '200px',
          minHeight: '200px'
        }}
      >
        <ResponsiveCirclePacking 
          {...otherProps} 
        />
      </div>
    );
  };

  const NivoChordWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          // Use offsetWidth/Height which ignore CSS transforms (zoom/pinch)
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          // Fallback to computed style if offset dimensions are 0
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      // Initial update
      updateDimensions();
      
      // Watch for container size changes
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateDimensions);
      });
      
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      
      return () => {
        resizeObserver.disconnect();
      };
    }, []);
    
    const { width, height, ...otherProps } = props;
    
    return (
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          minWidth: '200px',
          minHeight: '200px'
        }}
      >
        <ResponsiveChord 
          {...otherProps} 
        />
      </div>
    );
  };

  // Add wrapper components for remaining charts
  const NivoTreeMapWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveTreeMap {...props} />
      </div>
    );
  };

  const NivoSunburstWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveSunburst {...props} />
      </div>
    );
  };

  const NivoCalendarWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveCalendar {...props} />
      </div>
    );
  };

  const NivoSwarmPlotWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveSwarmPlot {...props} />
      </div>
    );
  };

  const NivoBumpWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveBump {...props} />
      </div>
    );
  };

  const NivoStreamWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveStream {...props} />
      </div>
    );
  };

  const NivoWaffleWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveWaffle {...props} />
      </div>
    );
  };

  const NivoFunnelWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveFunnel {...props} />
      </div>
    );
  };

  const NivoMarimekkoWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveMarimekko {...props} />
      </div>
    );
  };

  const NivoChoroplethWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveChoropleth {...props} />
      </div>
    );
  };

  const NivoNetworkWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveNetwork {...props} />
      </div>
    );
  };

  const NivoSankeyWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveSankey {...props} />
      </div>
    );
  };

  const NivoParallelCoordinatesWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveParallelCoordinates {...props} />
      </div>
    );
  };

  const NivoRadialBarWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveRadialBar {...props} />
      </div>
    );
  };

  const NivoPolarBarWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsivePolarBar {...props} />
      </div>
    );
  };

  const NivoIcicleWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveIcicle {...props} />
      </div>
    );
  };

  const NivoTreeWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveTree {...props} />
      </div>
    );
  };

  const NivoVoronoiWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveVoronoi {...props} />
      </div>
    );
  };

  const NivoGeoMapWrapper = (props: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth || 800;
          const height = containerRef.current.offsetHeight || 400;
          
          if (width === 0 || height === 0) {
            const computedStyle = getComputedStyle(containerRef.current);
            const fallbackWidth = parseInt(computedStyle.width) || 800;
            const fallbackHeight = parseInt(computedStyle.height) || 400;
            setDimensions({ width: fallbackWidth, height: fallbackHeight });
          } else {
            setDimensions({ width, height });
          }
        }
      };
      
      updateDimensions();
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveGeoMap {...props} />
      </div>
    );
  };

  // Add Nivo components with Nivo prefix
  const NivoComponents = useMemo(
    () => ({
      // Main chart components with proper wrappers
      NivoBar: NivoBarWrapper,
      NivoLine: NivoLineWrapper,
      NivoPie: NivoPieWrapper,
      NivoRadar: NivoRadarWrapper,
      NivoHeatMap: NivoHeatMapWrapper,
      NivoScatterPlot: NivoScatterPlotWrapper,
      NivoTreeMap: NivoTreeMapWrapper,
      NivoSunburst: NivoSunburstWrapper,
      NivoCalendar: NivoCalendarWrapper,
      NivoChoropleth: NivoChoroplethWrapper,
      NivoGeoMap: NivoGeoMapWrapper,
      NivoNetwork: NivoNetworkWrapper,
      NivoSankey: NivoSankeyWrapper,
      NivoSwarmPlot: NivoSwarmPlotWrapper,
      NivoBump: NivoBumpWrapper,
      NivoStream: NivoStreamWrapper,
      NivoWaffle: NivoWaffleWrapper,
      NivoFunnel: NivoFunnelWrapper,
      NivoMarimekko: NivoMarimekkoWrapper,
      NivoBoxPlot: NivoBoxPlotWrapper,
      NivoAreaBump: NivoAreaBumpWrapper,
      NivoBullet: NivoBulletWrapper,
      NivoCirclePacking: NivoCirclePackingWrapper,
      NivoChord: NivoChordWrapper,
      NivoParallelCoordinates: NivoParallelCoordinatesWrapper,
      NivoRadialBar: NivoRadialBarWrapper,
      NivoPolarBar: NivoPolarBarWrapper,
      NivoIcicle: NivoIcicleWrapper,
      NivoTree: NivoTreeWrapper,
      NivoVoronoi: NivoVoronoiWrapper,
    }),
    []
  );

  // Add Chart.js components with ChartJS prefix
  const ChartJSComponents = useMemo(
    () => ({
      // Chart.js components
      ChartJSLine: ChartJSLine,
      ChartJSBar: ChartJSBar,
      ChartJSPie: ChartJSPie,
      ChartJSDoughnut: ChartJSDoughnut,
      ChartJSRadar: ChartJSRadar,
      ChartJSPolarArea: ChartJSPolarArea,
      ChartJSBubble: ChartJSBubble,
      ChartJSScatter: ChartJSScatter,
    }),
    []
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
      // if (clone?.hasOwnProperty('_children_')) {
      //   return props?.meta?.config?.renderChildren?.([]);
      // }

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
  }, [props?.props, props?.meta?.config?.createEventHandler, props?.meta?.meta?.i, id]);

  const bindings = useMemo(() => {
    const eventHandlerPropNames = new Set(Object.keys(genericEventHandlers?.properties));

    const filteredProps = {};
    for (const key in props.props) {
      if (!eventHandlerPropNames.has(key)) {
        filteredProps[key] = props.props[key];
      }
    }

    // Find componentRef values from schema
    const componentRefBindings = {};
    const componentId = props?.meta?.meta?.componentId;
    const allComponentsRaw = props?.allComponentsRaw;
    
    if (componentId && allComponentsRaw) {
      const component = allComponentsRaw.find(comp => comp._id === componentId || comp.id === componentId);
      
      if (component && component.props) {
        try {
          const schema = JSON.parse(component.props);
          const properties = schema?.schema?.properties || {};
          
          // Find properties with config.uiType === "componentRef"
          Object.keys(properties).forEach(key => {
        
            const property = properties[key];
       
                          if (property?.config?.uiType === "componentRef") {
                const value = props?.props?.[key];
             
                if (value !== undefined) {
                  if (typeof value === 'string') {
                    componentRefBindings[key] = value;
                  } else {
                    componentRefBindings[key] = props?.meta?.config?.renderChildren?.(value||[]);
                  }
                }
            }
          });
        } catch (error) {
          
        }
      }
    }

    return {
      ...props.props,
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
      id: props?.meta?.meta?.i,
      ...componentRefBindings,
      // _breakpoint_: props.breakpoint,
      // _gridLayout_: props.gridLayout,
      // _allComponents_: props.allComponents,
      // children: props?.meta?.config?.renderChildren?.([]),
    };
  }, [
    props.props,
    propsData,
    eventHandlerProps,
    props?.meta?.layout,
    props?.meta?.i,
    props.setItemToEdit,
    props.allComponentsRaw,
    props.currentItem,
    props.renderComponent,
    props.checked,
    props.width,
    props?.meta?.config?.renderChildren,
    component?.children, // Add children to force bindings update
  ]);


  

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.pointerEvents = props.editMode ? 'none' : 'auto';
    }
  }, [props.editMode]);


  const pieData = [
    { name: 'Category A', value: 400, fill: '#0088FE' },
    { name: 'Category B', value: 300, fill: '#00C49F' },
    { name: 'Category C', value: 300, fill: '#FFBB28' },
    { name: 'Category D', value: 200, fill: '#FF8042' }
  ];

  // Nivo Chart Sample Data
  const nivoBarData = [
    { country: 'AD', 'hot dog': 137, burger: 96, sandwich: 72, kebab: 140, fries: 90, donut: 13 },
    { country: 'AE', 'hot dog': 55, burger: 28, sandwich: 58, kebab: 29, fries: 69, donut: 42 },
    { country: 'AF', 'hot dog': 109, burger: 23, sandwich: 53, kebab: 81, fries: 91, donut: 18 },
    { country: 'AG', 'hot dog': 133, burger: 52, sandwich: 43, kebab: 87, fries: 72, donut: 5 },
    { country: 'AI', 'hot dog': 81, burger: 80, sandwich: 112, kebab: 35, fries: 79, donut: 40 }
  ];

  const nivoLineData = [
    {
      id: 'japan',
      color: 'hsl(56, 70%, 50%)',
      data: [
        { x: 'plane', y: 183 },
        { x: 'helicopter', y: 150 },
        { x: 'boat', y: 7 },
        { x: 'train', y: 285 },
        { x: 'subway', y: 282 },
        { x: 'bus', y: 73 },
        { x: 'car', y: 146 },
        { x: 'moto', y: 31 },
        { x: 'bicycle', y: 257 }
      ]
    },
    {
      id: 'france',
      color: 'hsl(325, 70%, 50%)',
      data: [
        { x: 'plane', y: 107 },
        { x: 'helicopter', y: 89 },
        { x: 'boat', y: 226 },
        { x: 'train', y: 34 },
        { x: 'subway', y: 190 },
        { x: 'bus', y: 189 },
        { x: 'car', y: 20 },
        { x: 'moto', y: 134 },
        { x: 'bicycle', y: 204 }
      ]
    }
  ];

  const nivoPieData = [
    { id: 'rust', label: 'rust', value: 592, color: 'hsl(103, 70%, 50%)' },
    { id: 'javascript', label: 'javascript', value: 233, color: 'hsl(317, 70%, 50%)' },
    { id: 'go', label: 'go', value: 452, color: 'hsl(88, 70%, 50%)' },
    { id: 'python', label: 'python', value: 321, color: 'hsl(340, 70%, 50%)' },
    { id: 'java', label: 'java', value: 117, color: 'hsl(26, 70%, 50%)' }
  ];

  const nivoRadarData = [
    { subject: 'Math', A: 120, B: 110 },
    { subject: 'Chinese', A: 98, B: 130 },
    { subject: 'English', A: 86, B: 130 },
    { subject: 'Geography', A: 99, B: 100 },
    { subject: 'Physics', A: 85, B: 90 },
    { subject: 'History', A: 65, B: 85 }
  ];

  // External Library Wrapper Components
  
  // Rich Text Editor Wrapper
  const RichTextEditorWrapper = (props: any) => {
    if (!ReactQuill) {
      return <div style={{ padding: '20px', border: '1px dashed #ccc', textAlign: 'center' }}>
        Rich Text Editor (react-quill not installed)
      </div>;
    }

    const { 
      value, 
      defaultValue, 
      onChange, 
      onChangeSelection, 
      onFocus, 
      onBlur, 
      theme = 'snow',
      modules,
      formats,
      ...otherProps 
    } = props;
    
    const handleChange = (content: string, delta: any, source: any, editor: any) => {
      if (onChange) {
        onChange(content, delta, source, editor);
      }
    };
    
    return (
      <div style={{ minHeight: '200px' }}>
        <ReactQuill
          value={value || defaultValue || ''}
          onChange={handleChange}
          onChangeSelection={onChangeSelection}
          onFocus={onFocus}
          onBlur={onBlur}
          theme={theme}
          modules={modules}
          formats={formats}
          {...otherProps}
        />
      </div>
    );
  };

  // Leaflet Map Wrapper
  const LeafletMapWrapper = (props: any) => {
    if (!MapContainer || !TileLayer || !Marker || !Popup) {
      return <div style={{ padding: '20px', border: '1px dashed #ccc', textAlign: 'center', height: '400px' }}>
        Map Component (react-leaflet not installed)
      </div>;
    }

    const {
      center = [51.505, -0.09],
      zoom = 13,
      markers = [],
      tileLayer = {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      },
      style = { height: '400px', width: '100%' },
      ...otherProps
    } = props;

    return (
      <div style={style}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          {...otherProps}
        >
          <TileLayer
            url={tileLayer.url}
            attribution={tileLayer.attribution}
          />
          {markers.map((marker: any, index: number) => (
            <Marker key={index} position={marker.position || center}>
              {marker.popup && <Popup>{marker.popup}</Popup>}
            </Marker>
          ))}
        </MapContainer>
      </div>
    );
  };

  // React Video Player Wrapper
  const ReactVideoPlayerWrapper = (props: any) => {
    if (!VideoPlayer) {
      return <div style={{ padding: '20px', border: '1px dashed #ccc', textAlign: 'center', height: '300px' }}>
        Video Player (video-react not installed)
      </div>;
    }

    const {
      src,
      poster,
      width,
      height,
      fluid = true,
      responsive = true,
      onReady,
      onPlay,
      onPause,
      onTimeUpdate,
      onEnd,
      onError,
      ...otherProps
    } = props;

    const playerProps = {
      src,
      poster,
      fluid,
      responsive,
      ...otherProps
    };

    if (width) playerProps.width = width;
    if (height) playerProps.height = height;

    return (
      <div style={{ width: '100%' }}>
        <VideoPlayer
          {...playerProps}
          onLoadedData={onReady}
          onPlay={onPlay}
          onPause={onPause}
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnd}
          onError={onError}
        />
      </div>
    );
  };

  // WaveSurfer Audio Wrapper
  const WaveSurferAudioWrapper = (props: any) => {
    if (!useWavesurfer) {
      return <div style={{ padding: '20px', border: '1px dashed #ccc', textAlign: 'center' }}>
        Audio Waveform (@wavesurfer/react not installed)
      </div>;
    }

    const containerRef = useRef<HTMLDivElement>(null);
    const {
      url,
      height = 128,
      waveColor = '#ff4e00',
      progressColor = '#dd5e98',
      cursorColor = '#ddd5e9',
      barWidth = 2,
      barRadius = 2,
      barGap = 1,
      normalize = true,
      interact = true,
      autoplay = false,
      onReady,
      onPlay,
      onPause,
      onFinish,
      onError,
      // ...otherProps
    } = props;

    const options: any = {
      height,
      waveColor,
      progressColor,
      cursorColor,
      barWidth,
      barRadius,
      barGap,
      normalize,
      interact,
      autoplay,
      url,
      // ...otherProps
    };

    const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
      container: containerRef,
      ...options
    });

    useEffect(() => {
      if (!wavesurfer) return;

      const subscriptions = [
        onReady && wavesurfer.on('ready', onReady),
        onPlay && wavesurfer.on('play', onPlay), 
        onPause && wavesurfer.on('pause', onPause),
        onFinish && wavesurfer.on('finish', onFinish),
        onError && wavesurfer.on('error', onError),
      ].filter(Boolean);

      return () => {
        subscriptions.forEach(unsub => unsub?.());
      };
    }, [wavesurfer, onReady, onPlay, onPause, onFinish, onError]);

    return (
      <div>
        <WaveSurfer {...props}/>
        
      </div>
    );
  };

  // Add External Library Components
  const ExternalComponents = useMemo(
    () => ({
      RichTextEditor: RichTextEditorWrapper,
      LeafletMap: LeafletMapWrapper,
      ReactVideoPlayer: ReactVideoPlayerWrapper,
      WaveSurferAudio: WaveSurferAudioWrapper,
    }),
    []
  );

  return (
    <>
      {/* Nivo Chart Examples */}
      {/* 
      Example usage:
      
      <NivoBar
        data={nivoBarData}
        keys={['hot dog', 'burger', 'sandwich', 'kebab', 'fries', 'donut']}
        indexBy="country"
        width="100%"
        height="400px"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        colors={{ scheme: 'nivo' }}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'country',
          legendPosition: 'middle',
          legendOffset: 32
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'food',
          legendPosition: 'middle',
          legendOffset: -40
        }}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 20
          }
        ]}
      />

      <NivoLine
        data={nivoLineData}
        width="100%"
        height="400px"
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
        curve="cardinal"
        colors={{ scheme: 'category10' }}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        enableGridX={true}
        enableGridY={true}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12
          }
        ]}
      />

      <NivoPie
        data={nivoPieData}
        width="100%"
        height="400px"
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        colors={{ scheme: 'nivo' }}
        borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#333333"
        arcLabelsSkipAngle={10}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 18
          }
        ]}
      />

      <NivoRadar
        data={nivoRadarData}
        keys={['A', 'B']}
        indexBy="subject"
        width="100%"
        height="400px"
        margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
        borderColor={{ from: 'color' }}
        gridLevels={5}
        gridShape="circular"
        gridLabelOffset={36}
        enableDots={true}
        dotSize={8}
        dotColor={{ theme: 'background' }}
        dotBorderWidth={2}
        colors={{ scheme: 'nivo' }}
        blendMode="multiply"
        legends={[
          {
            anchor: 'top-left',
            direction: 'column',
            translateX: -50,
            translateY: -40,
            itemWidth: 80,
            itemHeight: 20,
            itemsSpacing: 2,
            symbolSize: 12,
            symbolShape: 'circle'
          }
        ]}
      />
      */}
   

             <>
      
       </>
      {err ? (
        <div className="text-red-500">{JSON.stringify(err)}</div>
      ) : (
        <ConfigProvider
          theme={{
            token: {
              // Base color tokens to override dark theme
              colorBgBase: '#ffffff',
              colorBgContainer: '#ffffff',
              colorBgElevated: '#ffffff',
              colorBgLayout: '#f5f5f5',
              colorBgSpotlight: '#ffffff',
              colorBorder: '#d9d9d9',
              colorBorderSecondary: '#f0f0f0',
              colorFill: '#f5f5f5',
              colorFillSecondary: '#fafafa',
              colorFillTertiary: '#f0f0f0',
              colorFillQuaternary: '#f5f5f5',
              
              // Text colors
              colorText: 'rgba(0, 0, 0, 0.88)',
              colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
              colorTextTertiary: 'rgba(0, 0, 0, 0.45)',
              colorTextQuaternary: 'rgba(0, 0, 0, 0.25)',
              colorTextDescription: 'rgba(0, 0, 0, 0.45)',
              colorTextDisabled: 'rgba(0, 0, 0, 0.25)',
              colorTextHeading: 'rgba(0, 0, 0, 0.88)',
              colorTextLabel: 'rgba(0, 0, 0, 0.65)',
              colorTextPlaceholder: 'rgba(0, 0, 0, 0.25)',
              
              // Primary colors
              colorPrimary: '#1677ff',
              colorPrimaryBg: '#e6f4ff',
              colorPrimaryBgHover: '#bae0ff',
              colorPrimaryBorder: '#91caff',
              colorPrimaryBorderHover: '#69b1ff',
              colorPrimaryHover: '#4096ff',
              colorPrimaryActive: '#0958d9',
              colorPrimaryTextHover: '#4096ff',
              colorPrimaryText: '#1677ff',
              colorPrimaryTextActive: '#0958d9',
              
              // Success colors
              colorSuccess: '#52c41a',
              colorSuccessBg: '#f6ffed',
              colorSuccessBorder: '#b7eb8f',
              
              // Warning colors
              colorWarning: '#faad14',
              colorWarningBg: '#fffbe6',
              colorWarningBorder: '#ffe58f',
              
              // Error colors
              colorError: '#ff4d4f',
              colorErrorBg: '#fff2f0',
              colorErrorBorder: '#ffccc7',
              
              // Info colors
              colorInfo: '#1677ff',
              colorInfoBg: '#e6f4ff',
              colorInfoBorder: '#91caff',
              
              // Typography
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
              fontSize: 14,
              fontSizeHeading1: 38,
              fontSizeHeading2: 30,
              fontSizeHeading3: 24,
              fontSizeHeading4: 20,
              fontSizeHeading5: 16,
              fontSizeLG: 16,
              fontSizeSM: 12,
              fontSizeXL: 20,
              lineHeight: 1.5714285714285714,
              lineHeightHeading1: 1.2105263157894737,
              lineHeightHeading2: 1.2666666666666666,
              lineHeightHeading3: 1.3333333333333333,
              lineHeightHeading4: 1.4,
              lineHeightHeading5: 1.5,
              
              // Layout
              borderRadius: 6,
              borderRadiusLG: 8,
              borderRadiusSM: 4,
              borderRadiusXS: 2,
              
              // Control
              controlHeight: 32,
              controlHeightLG: 40,
              controlHeightSM: 24,
              controlHeightXS: 16,
              
              // Motion
              motionDurationFast: '0.1s',
              motionDurationMid: '0.2s',
              motionDurationSlow: '0.3s',
            },
            algorithm: AntDesign.theme?.defaultAlgorithm,
          }}
          componentSize="middle"
        >
                    <div
            style={{
              isolation: 'isolate',
              position: 'relative',
              backgroundColor: 'transparent',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
              fontSize: '14px',
              lineHeight: 1.5714285714285714,
              color: 'rgba(0, 0, 0, 0.88)',
              boxSizing: 'border-box',
              minHeight: props.editMode ? '100vh' : 'auto',
              width: '100%'
            }}
            className="jsx-parser-ant-default-wrapper"
          >
            <style>
              {`
                                 .jsx-parser-ant-default-wrapper {
                   background-color: transparent !important;
                   font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif !important;
                   font-size: 14px !important;
                   line-height: 1.5714285714285714 !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   box-sizing: border-box !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper * {
                   color: inherit !important;
                   font-family: inherit !important;
                 }
                
                /* Button Overrides */
                .jsx-parser-ant-default-wrapper .ant-btn {
                  background-color: #ffffff !important;
                  border: 1px solid #d9d9d9 !important;
                  color: rgba(0, 0, 0, 0.88) !important;
                  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.02) !important;
                  border-radius: 6px !important;
                  font-weight: 400 !important;
                  font-size: 14px !important;
                  height: 32px !important;
                  padding: 4px 15px !important;
                  line-height: 1.5714285714285714 !important;
                  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1) !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-btn:hover {
                  background-color: #ffffff !important;
                  border-color: #4096ff !important;
                  color: #4096ff !important;
                  transform: none !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-btn:active {
                  background-color: #ffffff !important;
                  border-color: #0958d9 !important;
                  color: #0958d9 !important;
                  transform: none !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-btn-primary {
                  background-color: #1677ff !important;
                  border-color: #1677ff !important;
                  color: #ffffff !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-btn-primary:hover {
                  background-color: #4096ff !important;
                  border-color: #4096ff !important;
                  color: #ffffff !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-btn-primary:active {
                  background-color: #0958d9 !important;
                  border-color: #0958d9 !important;
                  color: #ffffff !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-btn-text {
                  background-color: transparent !important;
                  border: none !important;
                  color: rgba(0, 0, 0, 0.88) !important;
                  padding: 4px 8px !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-btn-text:hover {
                  background-color: rgba(0, 0, 0, 0.06) !important;
                  color: rgba(0, 0, 0, 0.88) !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-btn-link {
                  background-color: transparent !important;
                  border: none !important;
                  color: #1677ff !important;
                  padding: 4px 8px !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-btn-link:hover {
                  background-color: transparent !important;
                  color: #4096ff !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-btn:disabled {
                  background-color: #f5f5f5 !important;
                  border-color: #d9d9d9 !important;
                  color: rgba(0, 0, 0, 0.25) !important;
                  cursor: not-allowed !important;
                  opacity: 1 !important;
                }
                
                /* Input Overrides */
                .jsx-parser-ant-default-wrapper .ant-input {
                  background-color: #ffffff !important;
                  border: 1px solid #d9d9d9 !important;
                  border-radius: 6px !important;
                  color: rgba(0, 0, 0, 0.88) !important;
                  font-size: 14px !important;
                  line-height: 1.5714285714285714 !important;
                  padding: 4px 11px !important;
                  transition: all 0.2s !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-input:hover {
                  border-color: #4096ff !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-input:focus {
                  border-color: #4096ff !important;
                  box-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1) !important;
                  outline: 0 !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-input::placeholder {
                  color: rgba(0, 0, 0, 0.25) !important;
                }
                
                /* Typography Overrides */
                .jsx-parser-ant-default-wrapper .ant-typography {
                  color: rgba(0, 0, 0, 0.88) !important;
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-typography-title {
                  color: rgba(0, 0, 0, 0.88) !important;
                  font-weight: 600 !important;
                  margin-bottom: 0.5em !important;
                  margin-top: 0 !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-typography-paragraph {
                  color: rgba(0, 0, 0, 0.88) !important;
                  margin-bottom: 1em !important;
                }
                
                /* Select Overrides */
                .jsx-parser-ant-default-wrapper .ant-select {
                  font-size: 14px !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-select-selector {
                  background-color: #ffffff !important;
                  border: 1px solid #d9d9d9 !important;
                  border-radius: 6px !important;
                  padding: 0 11px !important;
                  transition: all 0.2s !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-select-selection-item {
                  color: rgba(0, 0, 0, 0.88) !important;
                  line-height: 30px !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-select-selection-placeholder {
                  color: rgba(0, 0, 0, 0.25) !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-select:hover .ant-select-selector {
                  border-color: #4096ff !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-select-focused .ant-select-selector {
                  border-color: #4096ff !important;
                  box-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1) !important;
                }
                
                /* Card Overrides */
                .jsx-parser-ant-default-wrapper .ant-card {
                  background-color: #ffffff !important;
                  border: 1px solid #f0f0f0 !important;
                  border-radius: 8px !important;
                  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02) !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-card-head {
                  background-color: transparent !important;
                  border-bottom: 1px solid #f0f0f0 !important;
                  color: rgba(0, 0, 0, 0.88) !important;
                  padding: 16px 24px !important;
                  min-height: 56px !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-card-head-title {
                  color: rgba(0, 0, 0, 0.88) !important;
                  font-weight: 600 !important;
                  font-size: 16px !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-card-body {
                  background-color: transparent !important;
                  color: rgba(0, 0, 0, 0.88) !important;
                  padding: 24px !important;
                }
                
                /* Table Overrides */
                .jsx-parser-ant-default-wrapper .ant-table {
                  background-color: #ffffff !important;
                  color: rgba(0, 0, 0, 0.88) !important;
                  font-size: 14px !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-table-thead > tr > th {
                  background-color: #fafafa !important;
                  border-bottom: 1px solid #f0f0f0 !important;
                  border-right: 1px solid #f0f0f0 !important;
                  color: rgba(0, 0, 0, 0.88) !important;
                  font-weight: 600 !important;
                  padding: 16px !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-table-tbody > tr > td {
                  background-color: #ffffff !important;
                  border-bottom: 1px solid #f0f0f0 !important;
                  border-right: 1px solid #f0f0f0 !important;
                  color: rgba(0, 0, 0, 0.88) !important;
                  padding: 16px !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-table-tbody > tr:hover > td {
                  background-color: #fafafa !important;
                }
                
                /* Form Overrides */
                .jsx-parser-ant-default-wrapper .ant-form-item-label > label {
                  color: rgba(0, 0, 0, 0.88) !important;
                  font-weight: 400 !important;
                  font-size: 14px !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-form-item-explain-error {
                  color: #ff4d4f !important;
                  font-size: 14px !important;
                }
                
                /* Dropdown Overrides */
                .jsx-parser-ant-default-wrapper .ant-dropdown {
                  background-color: #ffffff !important;
                  border: 1px solid #f0f0f0 !important;
                  border-radius: 8px !important;
                  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05) !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-dropdown-menu {
                  background-color: #ffffff !important;
                  border: none !important;
                  border-radius: 8px !important;
                  padding: 4px !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-dropdown-menu-item {
                  color: rgba(0, 0, 0, 0.88) !important;
                  border-radius: 6px !important;
                  margin: 0 !important;
                  padding: 5px 12px !important;
                  transition: all 0.2s !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-dropdown-menu-item:hover {
                  background-color: #f5f5f5 !important;
                  color: rgba(0, 0, 0, 0.88) !important;
                }
                
                /* Notification Overrides */
                .jsx-parser-ant-default-wrapper .ant-notification {
                  background-color: #ffffff !important;
                  border: 1px solid #f0f0f0 !important;
                  border-radius: 8px !important;
                  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05) !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-notification-notice {
                  background-color: #ffffff !important;
                  border-radius: 8px !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-notification-notice-message {
                  color: rgba(0, 0, 0, 0.88) !important;
                  font-weight: 600 !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-notification-notice-description {
                  color: rgba(0, 0, 0, 0.65) !important;
                }
                
                /* Tooltip Overrides */
                .jsx-parser-ant-default-wrapper .ant-tooltip-inner {
                  background-color: rgba(0, 0, 0, 0.85) !important;
                  border: none !important;
                  border-radius: 6px !important;
                  color: #ffffff !important;
                  font-size: 14px !important;
                  line-height: 1.5714285714285714 !important;
                  min-height: 32px !important;
                  padding: 6px 8px !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-tooltip-arrow::before {
                  background-color: rgba(0, 0, 0, 0.85) !important;
                  border: none !important;
                }
                
                /* Message Overrides */
                .jsx-parser-ant-default-wrapper .ant-message {
                  color: rgba(0, 0, 0, 0.88) !important;
                  font-size: 14px !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-message-notice-content {
                  background-color: #ffffff !important;
                  border: 1px solid #f0f0f0 !important;
                  border-radius: 8px !important;
                  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05) !important;
                  padding: 10px 16px !important;
                }
                
                /* Pagination Overrides */
                .jsx-parser-ant-default-wrapper .ant-pagination {
                  color: rgba(0, 0, 0, 0.88) !important;
                  font-size: 14px !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-pagination-item {
                  background-color: #ffffff !important;
                  border: 1px solid #d9d9d9 !important;
                  border-radius: 6px !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-pagination-item a {
                  color: rgba(0, 0, 0, 0.88) !important;
                  transition: all 0.2s !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-pagination-item:hover {
                  background-color: #ffffff !important;
                  border-color: #4096ff !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-pagination-item:hover a {
                  color: #4096ff !important;
                }
                
                .jsx-parser-ant-default-wrapper .ant-pagination-item-active {
                  background-color: #ffffff !important;
                  border-color: #1677ff !important;
                }
                
                                 .jsx-parser-ant-default-wrapper .ant-pagination-item-active a {
                   color: #1677ff !important;
                 }
                 
                 /* Tabs Overrides */
                 .jsx-parser-ant-default-wrapper .ant-tabs {
                   color: rgba(0, 0, 0, 0.88) !important;
                   font-size: 14px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-tabs-nav {
                   background-color: transparent !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-tabs-nav-wrap {
                   background-color: transparent !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-tabs-nav-list {
                   background-color: transparent !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-tabs-tab {
                   background-color: transparent !important;
                   border: none !important;
                   color: rgba(0, 0, 0, 0.65) !important;
                   padding: 12px 16px !important;
                   margin: 0 !important;
                   transition: all 0.2s !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-tabs-tab:hover {
                   color: #4096ff !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-tabs-tab-active {
                   color: #1677ff !important;
                   background-color: transparent !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-tabs-tab-btn {
                   color: inherit !important;
                   font-size: 14px !important;
                   font-weight: 400 !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-tabs-ink-bar {
                   background-color: #1677ff !important;
                   height: 2px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-tabs-content-holder {
                   background-color: transparent !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-tabs-tabpane {
                   background-color: transparent !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   padding: 16px 0 !important;
                 }
                 
                 /* Additional Border Radius Fixes */
                 .jsx-parser-ant-default-wrapper .ant-btn,
                 .jsx-parser-ant-default-wrapper .ant-input,
                 .jsx-parser-ant-default-wrapper .ant-select-selector,
                 .jsx-parser-ant-default-wrapper .ant-card,
                 .jsx-parser-ant-default-wrapper .ant-modal-content,
                 .jsx-parser-ant-default-wrapper .ant-drawer-content,
                 .jsx-parser-ant-default-wrapper .ant-popover-inner,
                 .jsx-parser-ant-default-wrapper .ant-checkbox,
                 .jsx-parser-ant-default-wrapper .ant-radio,
                 .jsx-parser-ant-default-wrapper .ant-switch {
                   border-radius: 6px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-card {
                   border-radius: 8px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-dropdown,
                 .jsx-parser-ant-default-wrapper .ant-tooltip-inner,
                 .jsx-parser-ant-default-wrapper .ant-popover-inner {
                   border-radius: 8px !important;
                 }
                 
                 /* Modal Overrides */
                 .jsx-parser-ant-default-wrapper .ant-modal-content {
                   background-color: #ffffff !important;
                   border-radius: 8px !important;
                   box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05) !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-modal-header {
                   background-color: #ffffff !important;
                   border-bottom: 1px solid #f0f0f0 !important;
                   border-radius: 8px 8px 0 0 !important;
                   padding: 16px 24px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-modal-title {
                   color: rgba(0, 0, 0, 0.88) !important;
                   font-size: 16px !important;
                   font-weight: 600 !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-modal-body {
                   background-color: #ffffff !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   padding: 24px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-modal-footer {
                   background-color: #ffffff !important;
                   border-top: 1px solid #f0f0f0 !important;
                   border-radius: 0 0 8px 8px !important;
                   padding: 10px 16px !important;
                 }
                 
                 /* Drawer Overrides */
                 .jsx-parser-ant-default-wrapper .ant-drawer-content {
                   background-color: #ffffff !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-drawer-header {
                   background-color: #ffffff !important;
                   border-bottom: 1px solid #f0f0f0 !important;
                   padding: 16px 24px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-drawer-title {
                   color: rgba(0, 0, 0, 0.88) !important;
                   font-size: 16px !important;
                   font-weight: 600 !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-drawer-body {
                   background-color: #ffffff !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   padding: 24px !important;
                 }
                 
                 /* Popover Overrides */
                 .jsx-parser-ant-default-wrapper .ant-popover-inner {
                   background-color: #ffffff !important;
                   border-radius: 8px !important;
                   box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05) !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-popover-title {
                   color: rgba(0, 0, 0, 0.88) !important;
                   font-weight: 600 !important;
                   border-bottom: 1px solid #f0f0f0 !important;
                   padding: 5px 16px 4px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-popover-inner-content {
                   color: rgba(0, 0, 0, 0.88) !important;
                   padding: 12px 16px !important;
                 }
                 
                 /* Checkbox and Radio Overrides */
                 .jsx-parser-ant-default-wrapper .ant-checkbox-wrapper {
                   color: rgba(0, 0, 0, 0.88) !important;
                   font-size: 14px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-checkbox {
                   border-radius: 2px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-checkbox-inner {
                   background-color: #ffffff !important;
                   border: 1px solid #d9d9d9 !important;
                   border-radius: 2px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-checkbox-checked .ant-checkbox-inner {
                   background-color: #1677ff !important;
                   border-color: #1677ff !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-radio-wrapper {
                   color: rgba(0, 0, 0, 0.88) !important;
                   font-size: 14px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-radio {
                   border-radius: 50% !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-radio-inner {
                   background-color: #ffffff !important;
                   border: 1px solid #d9d9d9 !important;
                   border-radius: 50% !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-radio-checked .ant-radio-inner {
                   border-color: #1677ff !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-radio-checked .ant-radio-inner::after {
                   background-color: #1677ff !important;
                 }
                 
                 /* Switch Overrides */
                 .jsx-parser-ant-default-wrapper .ant-switch {
                   background-color: rgba(0, 0, 0, 0.25) !important;
                   border-radius: 100px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-switch-checked {
                   background-color: #1677ff !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-switch-handle {
                   background-color: #ffffff !important;
                   border-radius: 50% !important;
                   box-shadow: 0 2px 4px 0 rgba(0, 35, 11, 0.2) !important;
                 }
                 
                 /* Slider Overrides */
                 .jsx-parser-ant-default-wrapper .ant-slider-rail {
                   background-color: #f5f5f5 !important;
                   border-radius: 2px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-slider-track {
                   background-color: #91caff !important;
                   border-radius: 2px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-slider-handle {
                   background-color: #ffffff !important;
                   border: 2px solid #91caff !important;
                   border-radius: 50% !important;
                   box-shadow: 0 0 0 2px rgba(5, 145, 255, 0.2) !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-slider-handle:hover {
                   border-color: #4096ff !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-slider-handle-dragging {
                   border-color: #4096ff !important;
                   box-shadow: 0 0 0 5px rgba(5, 145, 255, 0.12) !important;
                 }
                 
                 /* Progress Overrides */
                 .jsx-parser-ant-default-wrapper .ant-progress-line .ant-progress-bg {
                   background-color: #1677ff !important;
                   border-radius: 100px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-progress-inner {
                   background-color: #f5f5f5 !important;
                   border-radius: 100px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-progress-text {
                   color: rgba(0, 0, 0, 0.88) !important;
                 }
                 
                 /* Badge Overrides */
                 .jsx-parser-ant-default-wrapper .ant-badge-count {
                   background-color: #ff4d4f !important;
                   border-radius: 10px !important;
                   color: #ffffff !important;
                   font-size: 12px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-badge-dot {
                   background-color: #ff4d4f !important;
                   border-radius: 50% !important;
                 }
                 
                 /* Tag Overrides */
                 .jsx-parser-ant-default-wrapper .ant-tag {
                   background-color: #fafafa !important;
                   border: 1px solid #d9d9d9 !important;
                   border-radius: 6px !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   font-size: 12px !important;
                   padding: 0 7px !important;
                 }
                 
                 /* Alert Overrides */
                 .jsx-parser-ant-default-wrapper .ant-alert {
                   border-radius: 6px !important;
                   font-size: 14px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-alert-info {
                   background-color: #e6f4ff !important;
                   border: 1px solid #91caff !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-alert-success {
                   background-color: #f6ffed !important;
                   border: 1px solid #b7eb8f !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-alert-warning {
                   background-color: #fffbe6 !important;
                   border: 1px solid #ffe58f !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-alert-error {
                   background-color: #fff2f0 !important;
                   border: 1px solid #ffccc7 !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                 }
                 
                 /* Timeline Overrides */
                 .jsx-parser-ant-default-wrapper .ant-timeline-item-tail {
                   border-left: 2px solid #f0f0f0 !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-timeline-item-head {
                   background-color: #ffffff !important;
                   border: 2px solid #1677ff !important;
                   border-radius: 50% !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-timeline-item-content {
                   color: rgba(0, 0, 0, 0.88) !important;
                 }
                 
                 /* Steps Overrides */
                 .jsx-parser-ant-default-wrapper .ant-steps-item-title {
                   color: rgba(0, 0, 0, 0.88) !important;
                   font-size: 16px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-steps-item-description {
                   color: rgba(0, 0, 0, 0.65) !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-steps-item-icon {
                   background-color: #ffffff !important;
                   border: 1px solid #d9d9d9 !important;
                   border-radius: 50% !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-steps-item-process .ant-steps-item-icon {
                   background-color: #1677ff !important;
                   border-color: #1677ff !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-steps-item-finish .ant-steps-item-icon {
                   background-color: #ffffff !important;
                   border-color: #1677ff !important;
                 }
                 
                 /* DatePicker Overrides */
                 .jsx-parser-ant-default-wrapper .ant-picker {
                   background-color: #ffffff !important;
                   border: 1px solid #d9d9d9 !important;
                   border-radius: 6px !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-picker:hover {
                   border-color: #4096ff !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-picker-focused {
                   border-color: #4096ff !important;
                   box-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1) !important;
                 }
                 
                 /* Enhanced Card Overrides */
                 .jsx-parser-ant-default-wrapper .ant-card,
                 .jsx-parser-ant-default-wrapper .ant-card-small,
                 .jsx-parser-ant-default-wrapper .ant-card-bordered {
                   background-color: #ffffff !important;
                   border: 1px solid #f0f0f0 !important;
                   border-radius: 8px !important;
                   box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02) !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-card-meta-title {
                   color: rgba(0, 0, 0, 0.88) !important;
                   font-size: 16px !important;
                   font-weight: 500 !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-card-meta-description {
                   color: rgba(0, 0, 0, 0.65) !important;
                 }
                 
                 /* Enhanced Input Overrides */
                 .jsx-parser-ant-default-wrapper .ant-input,
                 .jsx-parser-ant-default-wrapper .ant-input-affix-wrapper,
                 .jsx-parser-ant-default-wrapper .ant-input-number,
                 .jsx-parser-ant-default-wrapper .ant-input-password,
                 .jsx-parser-ant-default-wrapper .ant-input-search,
                 .jsx-parser-ant-default-wrapper .ant-input-group,
                 .jsx-parser-ant-default-wrapper .ant-mentions,
                 .jsx-parser-ant-default-wrapper .ant-input-number-input {
                   background-color: #ffffff !important;
                   border: 1px solid #d9d9d9 !important;
                   border-radius: 6px !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   font-size: 14px !important;
                   line-height: 1.5714285714285714 !important;
                   transition: all 0.2s !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-input:hover,
                 .jsx-parser-ant-default-wrapper .ant-input-affix-wrapper:hover,
                 .jsx-parser-ant-default-wrapper .ant-input-number:hover,
                 .jsx-parser-ant-default-wrapper .ant-input-password:hover,
                 .jsx-parser-ant-default-wrapper .ant-input-search:hover {
                   border-color: #4096ff !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-input:focus,
                 .jsx-parser-ant-default-wrapper .ant-input-affix-wrapper-focused,
                 .jsx-parser-ant-default-wrapper .ant-input-number-focused,
                 .jsx-parser-ant-default-wrapper .ant-input-password:focus,
                 .jsx-parser-ant-default-wrapper .ant-input-search:focus {
                   border-color: #4096ff !important;
                   box-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1) !important;
                   outline: 0 !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-input::placeholder,
                 .jsx-parser-ant-default-wrapper .ant-input-affix-wrapper input::placeholder,
                 .jsx-parser-ant-default-wrapper .ant-input-number input::placeholder {
                   color: rgba(0, 0, 0, 0.25) !important;
                 }
                 
                 /* Textarea Overrides */
                 .jsx-parser-ant-default-wrapper .ant-input,
                 .jsx-parser-ant-default-wrapper textarea.ant-input {
                   background-color: #ffffff !important;
                   border: 1px solid #d9d9d9 !important;
                   border-radius: 6px !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   resize: vertical !important;
                 }
                 
                 /* List Overrides */
                 .jsx-parser-ant-default-wrapper .ant-list {
                   background-color: transparent !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   font-size: 14px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-list-item {
                   background-color: transparent !important;
                   border-bottom: 1px solid #f0f0f0 !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   padding: 12px 0 !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-list-item:last-child {
                   border-bottom: none !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-list-item-meta-title {
                   color: rgba(0, 0, 0, 0.88) !important;
                   font-size: 14px !important;
                   font-weight: 400 !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-list-item-meta-description {
                   color: rgba(0, 0, 0, 0.65) !important;
                   font-size: 14px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-list-header {
                   background-color: transparent !important;
                   border-bottom: 1px solid #f0f0f0 !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   padding: 12px 0 !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-list-footer {
                   background-color: transparent !important;
                   border-top: 1px solid #f0f0f0 !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   padding: 12px 0 !important;
                 }
                 
                 /* Enhanced Table Overrides */
                 .jsx-parser-ant-default-wrapper .ant-table,
                 .jsx-parser-ant-default-wrapper .ant-table-small,
                 .jsx-parser-ant-default-wrapper .ant-table-middle {
                   background-color: #ffffff !important;
                   border: 1px solid #f0f0f0 !important;
                   border-radius: 8px !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   font-size: 14px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-table-container {
                   border: 1px solid #f0f0f0 !important;
                   border-radius: 8px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-table-thead > tr > th,
                 .jsx-parser-ant-default-wrapper .ant-table-thead > tr > th.ant-table-column-sort {
                   background-color: #fafafa !important;
                   border-bottom: 1px solid #f0f0f0 !important;
                   border-right: 1px solid #f0f0f0 !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   font-weight: 600 !important;
                   padding: 16px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-table-thead > tr > th:last-child {
                   border-right: none !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-table-tbody > tr > td {
                   background-color: #ffffff !important;
                   border-bottom: 1px solid #f0f0f0 !important;
                   border-right: 1px solid #f0f0f0 !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   padding: 16px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-table-tbody > tr > td:last-child {
                   border-right: none !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-table-tbody > tr:hover > td {
                   background-color: #fafafa !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-table-tbody > tr.ant-table-row-selected > td {
                   background-color: #e6f4ff !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-table-small .ant-table-thead > tr > th,
                 .jsx-parser-ant-default-wrapper .ant-table-small .ant-table-tbody > tr > td {
                   padding: 8px !important;
                 }
                 
                 /* Menu Overrides */
                 .jsx-parser-ant-default-wrapper .ant-menu {
                   background-color: #ffffff !important;
                   border: 1px solid #f0f0f0 !important;
                   border-radius: 8px !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-menu-item {
                   background-color: transparent !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   margin: 4px 0 !important;
                   padding: 0 12px !important;
                   border-radius: 6px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-menu-item:hover {
                   background-color: #f5f5f5 !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-menu-item-selected {
                   background-color: #e6f4ff !important;
                   color: #1677ff !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-menu-submenu-title {
                   background-color: transparent !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   padding: 0 12px !important;
                   border-radius: 6px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-menu-submenu-title:hover {
                   background-color: #f5f5f5 !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                 }
                 
                 /* Collapse Overrides */
                 .jsx-parser-ant-default-wrapper .ant-collapse {
                   background-color: #fafafa !important;
                   border: 1px solid #d9d9d9 !important;
                   border-radius: 8px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-collapse-item {
                   background-color: #ffffff !important;
                   border-bottom: 1px solid #f0f0f0 !important;
                   border-radius: 8px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-collapse-header {
                   background-color: #ffffff !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   padding: 12px 16px !important;
                   border-radius: 8px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-collapse-content {
                   background-color: #ffffff !important;
                   border-top: 1px solid #f0f0f0 !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-collapse-content-box {
                   padding: 16px !important;
                 }
                 
                 /* Tree Overrides */
                 .jsx-parser-ant-default-wrapper .ant-tree {
                   background-color: transparent !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-tree-node-content-wrapper {
                   background-color: transparent !important;
                   border-radius: 4px !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   padding: 1px 4px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-tree-node-content-wrapper:hover {
                   background-color: #f5f5f5 !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-tree-node-selected {
                   background-color: #e6f4ff !important;
                   color: #1677ff !important;
                 }
                 
                 /* Transfer Overrides */
                 .jsx-parser-ant-default-wrapper .ant-transfer {
                   color: rgba(0, 0, 0, 0.88) !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-transfer-list {
                   background-color: #ffffff !important;
                   border: 1px solid #d9d9d9 !important;
                   border-radius: 8px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-transfer-list-header {
                   background-color: #fafafa !important;
                   border-bottom: 1px solid #f0f0f0 !important;
                   border-radius: 8px 8px 0 0 !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   padding: 12px 16px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-transfer-list-content-item {
                   background-color: transparent !important;
                   border-bottom: 1px solid #f0f0f0 !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   padding: 8px 16px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-transfer-list-content-item:hover {
                   background-color: #f5f5f5 !important;
                 }
                 
                 /* Upload Overrides */
                 .jsx-parser-ant-default-wrapper .ant-upload {
                   background-color: transparent !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-upload-drag {
                   background-color: #fafafa !important;
                   border: 1px dashed #d9d9d9 !important;
                   border-radius: 8px !important;
                   padding: 16px !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-upload-drag:hover {
                   border-color: #4096ff !important;
                 }
                 
                 .jsx-parser-ant-default-wrapper .ant-upload-list-item {
                   background-color: #fafafa !important;
                   border: 1px solid #f0f0f0 !important;
                   border-radius: 6px !important;
                   color: rgba(0, 0, 0, 0.88) !important;
                   padding: 8px 16px !important;
                 }
              `}
            </style>
            <ErrorBoundary fallbackRender={fallbackRender}>
              <Suspense fallback={<div>{}</div>}>
                <JsxParser
                  key={`jsx-parser-${props?.meta?.meta?.i}-${JSON.stringify(component?.children || [])}`}
                  id={props?.meta?.meta?.i}
                  renderInWrapper={false}
                  className={'w-full  ' + (component?.isContainer ? ' h-full' : '')}
                  renderError={setErr}
                  jsx={props.jsx}
                  components={{
                    ...AntComponents,
                    ...AntDCharts,
                    ...MuiComponents,
                    ...ApexComponents,
                    ...RechartsComponents,
                    ...NivoComponents,
                    ...ChartJSComponents,
                    AntSchemaForm: FormSc,
                   
                    ...ExternalComponents,
                  }}
                  blacklistedAttrs={[]}
                  bindings={bindings}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        </ConfigProvider>
      )}
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  // Only re-render if these specific props have actually changed
  if (prevProps.jsx !== nextProps.jsx) return false;
  if (prevProps.editMode !== nextProps.editMode) return false;
  if (prevProps?.meta?.i !== nextProps?.meta?.i) return false;
  if (prevProps?.meta?.componentId !== nextProps?.meta?.componentId) return false;
  
  // Compare props object shallowly
  if (JSON.stringify(prevProps.props) !== JSON.stringify(nextProps.props)) return false;
  
  // Check key meta properties
  if (prevProps?.meta?.config?.id !== nextProps?.meta?.config?.id) return false;
  
  // If none of the important props changed, prevent re-render
  return true;
});
export default MyComponent;