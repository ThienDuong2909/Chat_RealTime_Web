// components/ZegoVideoCall.tsx
import React, { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

function randomID(len = 5) {
  const chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP';
  let result = '';
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const ZegoVideoCall = ({ roomID, onClose }: { roomID: string, onClose: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const appID = 579821707;
const serverSecret = "a6bbe9a57f0dd323f8fdd02932a3822c";

;
    const userID = randomID();
    const userName = `User-${userID}`;
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, userID, userName);

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: containerRef.current!,
      sharedLinks: [
        {
          name: 'Personal link',
          url: `${window.location.protocol}//${window.location.host}${window.location.pathname}?roomID=${roomID}`,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall, // hoặc GroupCall nếu cần
      },
      onLeaveRoom: onClose,
    });
  }, [roomID]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default ZegoVideoCall;
