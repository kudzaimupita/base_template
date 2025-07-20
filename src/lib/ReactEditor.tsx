

import * as AntCharts from '@ant-design/plots';
import * as AntDesign from 'antd';
import * as MUI from '@mui/material';
import * as MuiIcons from '@mui/icons-material';

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

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../../../components/shadcn/accordion';
import { Alert, AlertDescription, AlertTitle } from '../../../../../components/shadcn/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../../../components/shadcn/alert-dialog';
import { AspectRatio } from '../../../../../components/shadcn/aspect-ratio';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../../components/shadcn/avatar';
import { Badge } from '../../../../../components/shadcn/badge';
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../../components/shadcn/breadcrumb';
import { Button, buttonVariants } from '../../../../../components/shadcn/button';
import { Calendar } from '../../../../../components/shadcn/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../../components/shadcn/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../../../../components/shadcn/carousel';
import { Checkbox } from '../../../../../components/shadcn/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../../../components/shadcn/collapsible';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '../../../../../components/shadcn/command';
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '../../../../../components/shadcn/context-menu';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from '../../../../../components/shadcn/dialog';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerTitle, DrawerTrigger } from '../../../../../components/shadcn/drawer';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../../../../../components/shadcn/dropdown-menu';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../../../../components/shadcn/form';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../../../../../components/shadcn/hover-card';
import { Input } from '../../../../../components/shadcn/input';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../../../../../components/shadcn/input-otp';
import { Label } from '../../../../../components/shadcn/label';
import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from '../../../../../components/shadcn/menubar';
import { NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport, navigationMenuTriggerStyle } from '../../../../../components/shadcn/navigation-menu';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../../../../components/shadcn/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../../components/shadcn/popover';
import { Progress } from '../../../../../components/shadcn/progress';
import { RadioGroup, RadioGroupItem } from '../../../../../components/shadcn/radio-group';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../../../../../components/shadcn/resizable';
import { ScrollArea, ScrollBar } from '../../../../../components/shadcn/scroll-area';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue } from '../../../../../components/shadcn/select';
import { Separator } from '../../../../../components/shadcn/separator';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger } from '../../../../../components/shadcn/sheet';
import { Skeleton } from '../../../../../components/shadcn/skeleton';
import { Slider } from '../../../../../components/shadcn/slider';
import { Switch } from '../../../../../components/shadcn/switch';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '../../../../../components/shadcn/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../components/shadcn/tabs';
import { Textarea } from '../../../../../components/shadcn/textarea';
import { Toggle, toggleVariants } from '../../../../../components/shadcn/toggle';
import { ToggleGroup, ToggleGroupItem } from '../../../../../components/shadcn/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../../../components/shadcn/tooltip';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../../../../../components/shadcn/sidebar"

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
      RechartsTooltip: Tooltip,
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
      // Accordion components
      ShadcnAccordion: Accordion,
      ShadcnAccordionContent: AccordionContent,
      ShadcnAccordionItem: AccordionItem,
      ShadcnAccordionTrigger: AccordionTrigger,
      // Alert components
      ShadcnAlert: Alert,
      ShadcnAlertDescription: AlertDescription,
      ShadcnAlertTitle: AlertTitle,
      // Alert Dialog components
      ShadcnAlertDialog: AlertDialog,
      ShadcnAlertDialogAction: AlertDialogAction,
      ShadcnAlertDialogCancel: AlertDialogCancel,
      ShadcnAlertDialogContent: AlertDialogContent,
      ShadcnAlertDialogDescription: AlertDialogDescription,
      ShadcnAlertDialogFooter: AlertDialogFooter,
      ShadcnAlertDialogHeader: AlertDialogHeader,
      ShadcnAlertDialogTitle: AlertDialogTitle,
      ShadcnAlertDialogTrigger: AlertDialogTrigger,
      // Aspect Ratio
      ShadcnAspectRatio: AspectRatio,
      // Avatar components
      ShadcnAvatar: Avatar,
      ShadcnAvatarFallback: AvatarFallback,
      ShadcnAvatarImage: AvatarImage,
      // Badge
      ShadcnBadge: Badge,
      // Breadcrumb components
      ShadcnBreadcrumb: Breadcrumb,
      ShadcnBreadcrumbEllipsis: BreadcrumbEllipsis,
      ShadcnBreadcrumbItem: BreadcrumbItem,
      ShadcnBreadcrumbLink: BreadcrumbLink,
      ShadcnBreadcrumbList: BreadcrumbList,
      ShadcnBreadcrumbPage: BreadcrumbPage,
      ShadcnBreadcrumbSeparator: BreadcrumbSeparator,
      // Button components
      ShadcnButton: Button,
      ShadcnButtonVariants: buttonVariants,
      // Calendar
      ShadcnCalendar: Calendar,
      // Card components
      ShadcnCard: Card,
      ShadcnCardContent: CardContent,
      ShadcnCardDescription: CardDescription,
      ShadcnCardFooter: CardFooter,
      ShadcnCardHeader: CardHeader,
      ShadcnCardTitle: CardTitle,
      // Carousel components
      ShadcnCarousel: Carousel,
      ShadcnCarouselContent: CarouselContent,
      ShadcnCarouselItem: CarouselItem,
      ShadcnCarouselNext: CarouselNext,
      ShadcnCarouselPrevious: CarouselPrevious,
      // Checkbox
      ShadcnCheckbox: Checkbox,
      // Collapsible components
      ShadcnCollapsible: Collapsible,
      ShadcnCollapsibleContent: CollapsibleContent,
      ShadcnCollapsibleTrigger: CollapsibleTrigger,
      // Command components
      ShadcnCommand: Command,
      ShadcnCommandDialog: CommandDialog,
      ShadcnCommandEmpty: CommandEmpty,
      ShadcnCommandGroup: CommandGroup,
      ShadcnCommandInput: CommandInput,
      ShadcnCommandItem: CommandItem,
      ShadcnCommandList: CommandList,
      ShadcnCommandSeparator: CommandSeparator,
      ShadcnCommandShortcut: CommandShortcut,
      // Context Menu components
      ShadcnContextMenu: ContextMenu,
      ShadcnContextMenuCheckboxItem: ContextMenuCheckboxItem,
      ShadcnContextMenuContent: ContextMenuContent,
      ShadcnContextMenuItem: ContextMenuItem,
      ShadcnContextMenuLabel: ContextMenuLabel,
      ShadcnContextMenuRadioGroup: ContextMenuRadioGroup,
      ShadcnContextMenuRadioItem: ContextMenuRadioItem,
      ShadcnContextMenuSeparator: ContextMenuSeparator,
      ShadcnContextMenuShortcut: ContextMenuShortcut,
      ShadcnContextMenuSub: ContextMenuSub,
      ShadcnContextMenuSubContent: ContextMenuSubContent,
      ShadcnContextMenuSubTrigger: ContextMenuSubTrigger,
      ShadcnContextMenuTrigger: ContextMenuTrigger,
      // Dialog components
      ShadcnDialog: Dialog,
      ShadcnDialogClose: DialogClose,
      ShadcnDialogContent: DialogContent,
      ShadcnDialogDescription: DialogDescription,
      ShadcnDialogFooter: DialogFooter,
      ShadcnDialogHeader: DialogHeader,
      ShadcnDialogOverlay: DialogOverlay,
      ShadcnDialogPortal: DialogPortal,
      ShadcnDialogTitle: DialogTitle,
      ShadcnDialogTrigger: DialogTrigger,
      // Drawer components
      ShadcnDrawer: Drawer,
      ShadcnDrawerClose: DrawerClose,
      ShadcnDrawerContent: DrawerContent,
      ShadcnDrawerDescription: DrawerDescription,
      ShadcnDrawerFooter: DrawerFooter,
      ShadcnDrawerHeader: DrawerHeader,
      ShadcnDrawerOverlay: DrawerOverlay,
      ShadcnDrawerPortal: DrawerPortal,
      ShadcnDrawerTitle: DrawerTitle,
      ShadcnDrawerTrigger: DrawerTrigger,
      // Dropdown Menu components
      ShadcnDropdownMenu: DropdownMenu,
      ShadcnDropdownMenuCheckboxItem: DropdownMenuCheckboxItem,
      ShadcnDropdownMenuContent: DropdownMenuContent,
      ShadcnDropdownMenuGroup: DropdownMenuGroup,
      ShadcnDropdownMenuItem: DropdownMenuItem,
      ShadcnDropdownMenuLabel: DropdownMenuLabel,
      ShadcnDropdownMenuPortal: DropdownMenuPortal,
      ShadcnDropdownMenuRadioGroup: DropdownMenuRadioGroup,
      ShadcnDropdownMenuRadioItem: DropdownMenuRadioItem,
      ShadcnDropdownMenuSeparator: DropdownMenuSeparator,
      ShadcnDropdownMenuShortcut: DropdownMenuShortcut,
      ShadcnDropdownMenuSub: DropdownMenuSub,
      ShadcnDropdownMenuSubContent: DropdownMenuSubContent,
      ShadcnDropdownMenuSubTrigger: DropdownMenuSubTrigger,
      ShadcnDropdownMenuTrigger: DropdownMenuTrigger,
      // Form components
      ShadcnForm: Form,
      ShadcnFormControl: FormControl,
      ShadcnFormDescription: FormDescription,
      ShadcnFormField: FormField,
      ShadcnFormItem: FormItem,
      ShadcnFormLabel: FormLabel,
      ShadcnFormMessage: FormMessage,
      // Hover Card components
      ShadcnHoverCard: HoverCard,
      ShadcnHoverCardContent: HoverCardContent,
      ShadcnHoverCardTrigger: HoverCardTrigger,
      // Input components
      ShadcnInput: Input,
      ShadcnInputOTP: InputOTP,
      ShadcnInputOTPGroup: InputOTPGroup,
      ShadcnInputOTPSeparator: InputOTPSeparator,
      ShadcnInputOTPSlot: InputOTPSlot,
      // Label
      ShadcnLabel: Label,
      // Menubar components
      ShadcnMenubar: Menubar,
      ShadcnMenubarCheckboxItem: MenubarCheckboxItem,
      ShadcnMenubarContent: MenubarContent,
      ShadcnMenubarItem: MenubarItem,
      ShadcnMenubarLabel: MenubarLabel,
      ShadcnMenubarMenu: MenubarMenu,
      ShadcnMenubarRadioGroup: MenubarRadioGroup,
      ShadcnMenubarRadioItem: MenubarRadioItem,
      ShadcnMenubarSeparator: MenubarSeparator,
      ShadcnMenubarShortcut: MenubarShortcut,
      ShadcnMenubarSub: MenubarSub,
      ShadcnMenubarSubContent: MenubarSubContent,
      ShadcnMenubarSubTrigger: MenubarSubTrigger,
      ShadcnMenubarTrigger: MenubarTrigger,
      // Navigation Menu components
      ShadcnNavigationMenu: NavigationMenu,
      ShadcnNavigationMenuContent: NavigationMenuContent,
      ShadcnNavigationMenuIndicator: NavigationMenuIndicator,
      ShadcnNavigationMenuItem: NavigationMenuItem,
      ShadcnNavigationMenuLink: NavigationMenuLink,
      ShadcnNavigationMenuList: NavigationMenuList,
      ShadcnNavigationMenuTrigger: NavigationMenuTrigger,
      ShadcnNavigationMenuViewport: NavigationMenuViewport,
      ShadcnNavigationMenuTriggerStyle: navigationMenuTriggerStyle,
      // Pagination components
      ShadcnPagination: Pagination,
      ShadcnPaginationContent: PaginationContent,
      ShadcnPaginationEllipsis: PaginationEllipsis,
      ShadcnPaginationItem: PaginationItem,
      ShadcnPaginationLink: PaginationLink,
      ShadcnPaginationNext: PaginationNext,
      ShadcnPaginationPrevious: PaginationPrevious,
      // Popover components
      ShadcnPopover: Popover,
      ShadcnPopoverContent: PopoverContent,
      ShadcnPopoverTrigger: PopoverTrigger,
      // Progress
      ShadcnProgress: Progress,
      // Radio Group components
      ShadcnRadioGroup: RadioGroup,
      ShadcnRadioGroupItem: RadioGroupItem,
      // Resizable components
      ShadcnResizableHandle: ResizableHandle,
      ShadcnResizablePanel: ResizablePanel,
      ShadcnResizablePanelGroup: ResizablePanelGroup,
      // Scroll Area components
      ShadcnScrollArea: ScrollArea,
      ShadcnScrollBar: ScrollBar,
      // Select components
      ShadcnSelect: Select,
      ShadcnSelectContent: SelectContent,
      ShadcnSelectGroup: SelectGroup,
      ShadcnSelectItem: SelectItem,
      ShadcnSelectLabel: SelectLabel,
      ShadcnSelectScrollDownButton: SelectScrollDownButton,
      ShadcnSelectScrollUpButton: SelectScrollUpButton,
      ShadcnSelectSeparator: SelectSeparator,
      ShadcnSelectTrigger: SelectTrigger,
      ShadcnSelectValue: SelectValue,
      // Separator
      ShadcnSeparator: Separator,
      // Sheet components
      ShadcnSheet: Sheet,
      ShadcnSheetClose: SheetClose,
      ShadcnSheetContent: SheetContent,
      ShadcnSheetDescription: SheetDescription,
      ShadcnSheetFooter: SheetFooter,
      ShadcnSheetHeader: SheetHeader,
      ShadcnSheetOverlay: SheetOverlay,
      ShadcnSheetPortal: SheetPortal,
      ShadcnSheetTitle: SheetTitle,
      ShadcnSheetTrigger: SheetTrigger,
      // Sidebar components
      // ShadcnSidebar: Sidebar,
      // ShadcnSidebarContent: SidebarContent,
      // ShadcnSidebarFooter: SidebarFooter,
      // ShadcnSidebarHeader: SidebarHeader,
      // ShadcnSidebarProvider: SidebarProvider,
      // ShadcnSidebarTrigger: SidebarTrigger,
      // ShadcnAppSidebar: AppSidebar,
      // Skeleton
      ShadcnSkeleton: Skeleton,
      // Slider
      ShadcnSlider: Slider,
      // Switch
      ShadcnSwitch: Switch,
      // Table components
      ShadcnTable: Table,
      ShadcnTableBody: TableBody,
      ShadcnTableCaption: TableCaption,
      ShadcnTableCell: TableCell,
      ShadcnTableFooter: TableFooter,
      ShadcnTableHead: TableHead,
      ShadcnTableHeader: TableHeader,
      ShadcnTableRow: TableRow,
      // Tabs components

      // Sidebar:ShadcnSidebar,
      // SidebarContent,
      // SidebarGroup,
      // SidebarGroupContent,
      // SidebarGroupLabel,
      // SidebarHeader,
      // SidebarMenu,
      // SidebarMenuButton,
      // SidebarMenuItem,
      // SidebarRail,
      ShadcnTabs: Tabs,
      ShadcnTabsContent: TabsContent,
      ShadcnTabsList: TabsList,
      ShadcnTabsTrigger: TabsTrigger,
      // Textarea
      ShadcnTextarea: Textarea,
      // Toggle components
      ShadcnToggle: Toggle,
      ShadcnToggleVariants: toggleVariants,
      ShadcnToggleGroup: ToggleGroup,
      ShadcnToggleGroupItem: ToggleGroupItem,
      // Tooltip components
      ShadcnTooltip: Tooltip,
      ShadcnTooltipContent: TooltipContent,
      ShadcnTooltipProvider: TooltipProvider,
      ShadcnTooltipTrigger: TooltipTrigger,
      // Additional components (these might not exist in your setup, remove if not available)
      // ShadcnDataTable: DataTable,
      // ShadcnDatePicker: DatePicker,
      // ShadcnComboBox: ComboBox,
      // ShadcnMultiSelect: MultiSelect,
      // ShadcnFileUpload: FileUpload,
      // ShadcnRichTextEditor: RichTextEditor,
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