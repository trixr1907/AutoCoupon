import {
  CONTENT_COMMAND_TYPE,
  CONTENT_EVENT_TYPE,
  POPUP_MESSAGE_TYPE,
  type BackgroundUiResponse,
  type ContentCommand,
  type ContentCommandResponse,
  type ContentEvent,
  type PopupRequest,
} from '../../shared/contracts/messages';
import type {
  ActiveTabContext,
  Settings,
  UiNotification,
} from '../../shared/contracts/models';

const popupMessageTypes = new Set<string>(Object.values(POPUP_MESSAGE_TYPE));
const contentCommandTypes = new Set<string>(Object.values(CONTENT_COMMAND_TYPE));
const contentEventTypes = new Set<string>(Object.values(CONTENT_EVENT_TYPE));

export function isPopupRequest(message: unknown): message is PopupRequest {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    popupMessageTypes.has((message as { type: string }).type)
  );
}

export function isContentCommand(message: unknown): message is ContentCommand {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    contentCommandTypes.has((message as { type: string }).type)
  );
}

export function isContentEvent(message: unknown): message is ContentEvent {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    contentEventTypes.has((message as { type: string }).type)
  );
}

export function createUiResponse(input: {
  ok: boolean;
  context?: ActiveTabContext;
  settings?: Settings;
  notification?: UiNotification;
}): BackgroundUiResponse {
  return input;
}

export function createContentResponse(input: {
  ok: boolean;
  page?: ContentCommandResponse['page'];
  status?: ContentCommandResponse['status'];
  notification?: UiNotification;
}): ContentCommandResponse {
  return input;
}
