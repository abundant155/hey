import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { MIN_WIDTH_DESKTOP } from '@hey/data/constants';
import { MESSAGES } from '@hey/data/tracking';
import { Button, Input } from '@hey/ui';
import { Leafwatch } from '@lib/leafwatch';
import type { ContentTypeId } from '@xmtp/xmtp-js';
import { ContentTypeText } from '@xmtp/xmtp-js';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type {
  AllowedContent,
  SendMessageContent,
  SendMessageOptions
} from 'src/hooks/useSendOptimisticMessage';
import { useMessagePersistStore } from 'src/store/useMessagePersistStore';
import { useWindowSize } from 'usehooks-ts';

interface ComposerProps {
  sendMessage: <T extends AllowedContent = string>(
    content: SendMessageContent<T>,
    contentType: ContentTypeId,
    options?: SendMessageOptions
  ) => Promise<boolean>;
  conversationKey: string;
  disabledInput: boolean;
  listRef: React.RefObject<HTMLDivElement>;
}

const Composer: FC<ComposerProps> = ({
  sendMessage,
  conversationKey,
  disabledInput,
  listRef
}) => {
  const [message, setMessage] = useState<string>('');
  const { width } = useWindowSize();
  const unsentMessage = useMessagePersistStore((state) =>
    state.unsentMessages.get(conversationKey)
  );
  const setUnsentMessage = useMessagePersistStore(
    (state) => state.setUnsentMessage
  );
  const canSendMessage = !disabledInput && message.length > 0;

  const handleSend = async () => {
    if (!canSendMessage) {
      return;
    }

    // a `null` value indicates that a message won't be sent
    let sendText: Promise<boolean | null> = Promise.resolve(null);

    if (message.length > 0) {
      sendText = sendMessage(message, ContentTypeText);
      setMessage('');
      setUnsentMessage(conversationKey, null);
    }

    const sentText = await sendText;

    if (sentText !== null) {
      if (sentText) {
        Leafwatch.track(MESSAGES.SEND);
      } else {
        toast.error('Error sending message');
      }
    }

    listRef.current?.scrollTo({
      left: 0,
      top: listRef.current.scrollHeight,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    setMessage(unsentMessage ?? '');
    // only run this effect when the conversation changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationKey]);

  const onChangeCallback = (value: string) => {
    setUnsentMessage(conversationKey, value);
    setMessage(value);
  };

  const handleKeyDown = (event: { key: string }) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="border-t dark:border-gray-700">
      <div className="flex space-x-4 p-4">
        <Input
          type="text"
          placeholder="Type Something"
          value={message}
          disabled={disabledInput}
          onKeyDown={handleKeyDown}
          onChange={(event) => onChangeCallback(event.target.value)}
        />
        <Button
          disabled={!canSendMessage}
          onClick={handleSend}
          variant="primary"
          aria-label="Send message"
        >
          <div className="flex items-center space-x-2">
            {Number(width) > MIN_WIDTH_DESKTOP ? <span>Send</span> : null}
            <ArrowRightIcon className="h-5 w-5" />
          </div>
        </Button>
      </div>
    </div>
  );
};

export default Composer;
