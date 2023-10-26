import Markup from '@components/Shared/Markup';
import getMentions from '@hey/lib/getMentions';
import type { DecodedMessage } from '@xmtp/xmtp-js';
import type { FC, ReactNode } from 'react';
import { useRef } from 'react';
import {
  type FailedMessage,
  isQueuedMessage,
  type PendingMessage
} from 'src/hooks/useSendOptimisticMessage';

interface MessageContentProps {
  message: DecodedMessage | PendingMessage | FailedMessage;
}

const MessageContent: FC<MessageContentProps> = ({ message }) => {
  const previewRef = useRef<ReactNode | undefined>();

  if (message.error) {
    return <span>Error: {`${message.error}`}</span>;
  }

  const hasQueuedMessagePreview = isQueuedMessage(message);

  // if message is pending, render a custom preview if available
  if (hasQueuedMessagePreview && message.render) {
    if (!previewRef.current) {
      // store the message preview so that RemoteAttachmentPreview
      // has access to it
      previewRef.current = message.render;
    }
    return previewRef.current;
  }

  return (
    <Markup mentions={getMentions(message.content)}>{message.content}</Markup>
  );
};

export default MessageContent;
