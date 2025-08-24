/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 内部主题化组件统一导出
 * 完全替换 Arco Design 组件，实现完全的主题控制
 */

// 布局组件
export { ThemedLayout } from './ThemedLayout';

// 菜单组件
export { ThemedMenu } from './ThemedMenu';

// 基础组件
export { ThemedButton } from './ThemedButton';
export { ThemedInput } from './ThemedInput';
export { ThemedSelect } from './ThemedSelect';

// 容器组件
export { ThemedCard, ThemedCardBody, ThemedCardHeader } from './ThemedCard';

// 对话框组件
export { ThemedModal } from './ThemedModal';

// 其他已创建的组件
export { ThemedAffix } from './ThemedAffix';
export { ThemedAlert } from './ThemedAlert';
export { ThemedAnchor } from './ThemedAnchor';
export { ThemedAvatar } from './ThemedAvatar';
export { ThemedBackTop } from './ThemedBackTop';
export { ThemedBadge } from './ThemedBadge';
export { ThemedBreadcrumb } from './ThemedBreadcrumb';
export { ThemedCarousel } from './ThemedCarousel';
export { ThemedCascader } from './ThemedCascader';
export { ThemedCollapse } from './ThemedCollapse';
export { ThemedColorPicker } from './ThemedColorPicker';
export { ThemedComment } from './ThemedComment';
export { ThemedDatePicker } from './ThemedDatePicker';
export { ThemedDescriptions } from './ThemedDescriptions';
export { ThemedDivider } from './ThemedDivider';
export { ThemedDrawer } from './ThemedDrawer';
export { ThemedDropdown } from './ThemedDropdown';
export { ThemedEmpty } from './ThemedEmpty';
export { ThemedForm } from './ThemedForm';
export { ThemedGrid } from './ThemedGrid';
export { ThemedImage } from './ThemedImage';
export { ThemedNotification } from './ThemedNotification';
export { ThemedPageHeader } from './ThemedPageHeader';
export { ThemedPagination } from './ThemedPagination';
export { ThemedParallax } from './ThemedParallax';
export { ThemedProgress } from './ThemedProgress';
export { ThemedQRCode } from './ThemedQRCode';
export { ThemedRate } from './ThemedRate';
export { ThemedResult } from './ThemedResult';
export { ThemedSkeleton } from './ThemedSkeleton';
export { ThemedSlider } from './ThemedSlider';
export { ThemedSpace } from './ThemedSpace';
export { ThemedSpin } from './ThemedSpin';
export { ThemedStatistic } from './ThemedStatistic';
export { ThemedSteps } from './ThemedSteps';
export { ThemedTable } from './ThemedTable';
export { ThemedTabs } from './ThemedTabs';
export { ThemedTag } from './ThemedTag';
export { ThemedTimeline } from './ThemedTimeline';
export { ThemedTimePicker } from './ThemedTimePicker';
export { ThemedTooltip } from './ThemedTooltip';
export { ThemedTransfer } from './ThemedTransfer';
export { ThemedTypography } from './ThemedTypography';
export { ThemedUpload } from './ThemedUpload';
export { ThemedWatermark } from './ThemedWatermark';

// 布局工具组件
export { default as FlexFullContainer } from './FlexFullContainer';
export { default as IconParkHOC } from './IconParkHOC';

// 组件类型定义
export type { ThemedAffixProps } from './ThemedAffix';
export type { ThemedAlertProps } from './ThemedAlert';
export type { ThemedAnchorProps } from './ThemedAnchor';
export type { ThemedAvatarProps } from './ThemedAvatar';
export type { ThemedBackTopProps } from './ThemedBackTop';
export type { ThemedBadgeProps } from './ThemedBadge';
export type { ThemedBreadcrumbProps } from './ThemedBreadcrumb';
export type { ThemedButtonProps } from './ThemedButton';
export type { ThemedCardBodyProps, ThemedCardHeaderProps, ThemedCardProps } from './ThemedCard';
export type { ThemedCarouselProps } from './ThemedCarousel';
export type { ThemedCascaderProps } from './ThemedCascader';
export type { ThemedCollapseProps } from './ThemedCollapse';
export type { ThemedColorPickerProps } from './ThemedColorPicker';
export type { ThemedCommentProps } from './ThemedComment';
export type { ThemedDatePickerProps } from './ThemedDatePicker';
export type { ThemedDescriptionsProps } from './ThemedDescriptions';
export type { ThemedDividerProps } from './ThemedDivider';
export type { ThemedDrawerProps } from './ThemedDrawer';
export type { ThemedDropdownProps } from './ThemedDropdown';
export type { ThemedEmptyProps } from './ThemedEmpty';
export type { ThemedFormProps } from './ThemedForm';
export type { ThemedGridProps } from './ThemedGrid';
export type { ThemedImageProps } from './ThemedImage';
export type { ThemedInputProps } from './ThemedInput';
export type { ThemedModalProps } from './ThemedModal';
export type { ThemedNotificationProps } from './ThemedNotification';
export type { ThemedPageHeaderProps } from './ThemedPageHeader';
export type { ThemedPaginationProps } from './ThemedPagination';
export type { ThemedParallaxProps } from './ThemedParallax';
export type { ThemedProgressProps } from './ThemedProgress';
export type { ThemedQRCodeProps } from './ThemedQRCode';
export type { ThemedRateProps } from './ThemedRate';
export type { ThemedResultProps } from './ThemedResult';
export type { SelectOption, ThemedSelectProps } from './ThemedSelect';
export type { ThemedSkeletonProps } from './ThemedSkeleton';
export type { ThemedSliderProps } from './ThemedSlider';
export type { ThemedSpaceProps } from './ThemedSpace';
export type { ThemedSpinProps } from './ThemedSpin';
export type { ThemedStatisticProps } from './ThemedStatistic';
export type { ThemedStepsProps } from './ThemedSteps';
export type { ThemedTableProps } from './ThemedTable';
export type { ThemedTabsProps } from './ThemedTabs';
export type { ThemedTagProps } from './ThemedTag';
export type { ThemedTimelineProps } from './ThemedTimeline';
export type { ThemedTimePickerProps } from './ThemedTimePicker';
export type { ThemedTooltipProps } from './ThemedTooltip';
export type { ThemedTransferProps } from './ThemedTransfer';
export type { ThemedTypographyProps } from './ThemedTypography';
export type { ThemedUploadProps } from './ThemedUpload';
export type { ThemedWatermarkProps } from './ThemedWatermark';

// 主题化组件默认导出（兼容性）
export {
  ThemedAffix as Affix,
  ThemedAlert as Alert,
  ThemedAnchor as Anchor,
  ThemedAvatar as Avatar,
  ThemedBackTop as BackTop,
  ThemedBadge as Badge,
  ThemedBreadcrumb as Breadcrumb,
  ThemedButton as Button,
  ThemedCard as Card,
  ThemedCardBody as CardBody,
  ThemedCardHeader as CardHeader,
  ThemedCarousel as Carousel,
  ThemedCascader as Cascader,
  ThemedCollapse as Collapse,
  ThemedColorPicker as ColorPicker,
  ThemedComment as Comment,
  ThemedDatePicker as DatePicker,
  ThemedDescriptions as Descriptions,
  ThemedDivider as Divider,
  ThemedDrawer as Drawer,
  ThemedDropdown as Dropdown,
  ThemedEmpty as Empty,
  ThemedForm as Form,
  ThemedGrid as Grid,
  ThemedImage as Image,
  ThemedInput as Input,
  ThemedLayout as Layout,
  ThemedMenu as Menu,
  ThemedModal as Modal,
  ThemedNotification as Notification,
  ThemedPageHeader as PageHeader,
  ThemedPagination as Pagination,
  ThemedParallax as Parallax,
  ThemedProgress as Progress,
  ThemedQRCode as QRCode,
  ThemedRate as Rate,
  ThemedResult as Result,
  ThemedSelect as Select,
  ThemedSkeleton as Skeleton,
  ThemedSlider as Slider,
  ThemedSpace as Space,
  ThemedSpin as Spin,
  ThemedStatistic as Statistic,
  ThemedSteps as Steps,
  ThemedTable as Table,
  ThemedTabs as Tabs,
  ThemedTag as Tag,
  ThemedTimeline as Timeline,
  ThemedTimePicker as TimePicker,
  ThemedTooltip as Tooltip,
  ThemedTransfer as Transfer,
  ThemedTypography as Typography,
  ThemedUpload as Upload,
  ThemedWatermark as Watermark,
};
