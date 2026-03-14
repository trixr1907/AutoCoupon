import type {
  ActivationMode,
  ActivationStatus,
  ActiveTabContext,
  PageStateResult,
  Settings,
  UiNotification,
} from './models';

export const POPUP_MESSAGE_TYPE = {
  uiBootstrap: 'ui/bootstrap',
  contextRefresh: 'context/refresh',
  activationStart: 'activation/start',
  activationCancel: 'activation/cancel',
  pageOpenCoupons: 'page/open-coupons',
  pageReloadCoupons: 'page/reload-coupons',
  settingsGet: 'settings/get',
  settingsUpdate: 'settings/update',
} as const;

export const CONTENT_COMMAND_TYPE = {
  ping: 'content/ping',
  getPageState: 'page/get-state',
  activationStart: 'activation/start',
  activationCancel: 'activation/cancel',
  overlaySyncSettings: 'overlay/sync-settings',
} as const;

export const CONTENT_EVENT_TYPE = {
  ready: 'content/ready',
  pageStateChanged: 'page/state-changed',
  activationStatusChanged: 'activation/status-changed',
  activationCompleted: 'activation/completed',
} as const;

export interface UiBootstrapRequest {
  type: typeof POPUP_MESSAGE_TYPE.uiBootstrap;
}

export interface ContextRefreshRequest {
  type: typeof POPUP_MESSAGE_TYPE.contextRefresh;
}

export interface ActivationStartRequest {
  type: typeof POPUP_MESSAGE_TYPE.activationStart;
  payload: {
    mode: ActivationMode;
  };
}

export interface ActivationCancelRequest {
  type: typeof POPUP_MESSAGE_TYPE.activationCancel;
}

export interface OpenCouponsPageRequest {
  type: typeof POPUP_MESSAGE_TYPE.pageOpenCoupons;
}

export interface ReloadCouponsPageRequest {
  type: typeof POPUP_MESSAGE_TYPE.pageReloadCoupons;
}

export interface GetSettingsRequest {
  type: typeof POPUP_MESSAGE_TYPE.settingsGet;
}

export interface UpdateSettingsRequest {
  type: typeof POPUP_MESSAGE_TYPE.settingsUpdate;
  payload: {
    patch: Partial<Settings>;
  };
}

export type PopupRequest =
  | UiBootstrapRequest
  | ContextRefreshRequest
  | ActivationStartRequest
  | ActivationCancelRequest
  | OpenCouponsPageRequest
  | ReloadCouponsPageRequest
  | GetSettingsRequest
  | UpdateSettingsRequest;

export interface BackgroundUiResponse {
  ok: boolean;
  context?: ActiveTabContext;
  settings?: Settings;
  notification?: UiNotification;
}

export interface ContentPingRequest {
  type: typeof CONTENT_COMMAND_TYPE.ping;
}

export interface ContentGetPageStateRequest {
  type: typeof CONTENT_COMMAND_TYPE.getPageState;
}

export interface ContentActivationStartRequest {
  type: typeof CONTENT_COMMAND_TYPE.activationStart;
  payload: {
    mode: ActivationMode;
    settings: Settings;
  };
}

export interface ContentActivationCancelRequest {
  type: typeof CONTENT_COMMAND_TYPE.activationCancel;
}

export interface ContentOverlaySyncSettingsRequest {
  type: typeof CONTENT_COMMAND_TYPE.overlaySyncSettings;
  payload: {
    settings: Settings;
  };
}

export type ContentCommand =
  | ContentPingRequest
  | ContentGetPageStateRequest
  | ContentActivationStartRequest
  | ContentActivationCancelRequest
  | ContentOverlaySyncSettingsRequest;

export interface ContentCommandResponse {
  ok: boolean;
  page?: PageStateResult;
  status?: ActivationStatus;
  notification?: UiNotification;
}

export interface ContentReadyEvent {
  type: typeof CONTENT_EVENT_TYPE.ready;
  payload: {
    page: PageStateResult;
  };
}

export interface PageStateChangedEvent {
  type: typeof CONTENT_EVENT_TYPE.pageStateChanged;
  payload: {
    page: PageStateResult;
  };
}

export interface ActivationStatusChangedEvent {
  type: typeof CONTENT_EVENT_TYPE.activationStatusChanged;
  payload: {
    status: ActivationStatus;
  };
}

export interface ActivationCompletedEvent {
  type: typeof CONTENT_EVENT_TYPE.activationCompleted;
  payload: {
    status: ActivationStatus;
  };
}

export type ContentEvent =
  | ContentReadyEvent
  | PageStateChangedEvent
  | ActivationStatusChangedEvent
  | ActivationCompletedEvent;
