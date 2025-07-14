import React, { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

function randomID(len = 5) {
  const chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP';
  let result = '';
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const appID = 579821707;
const serverSecret = "a6bbe9a57f0dd323f8fdd02932a3822c";

const VideoCallPage = () => {
  const [searchParams] = useSearchParams();
  const roomID = searchParams.get("roomID") || randomID();
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userID = randomID();
    const userName = `User-${userID}`;
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userID,
      userName
    );
    console.log("Room ID: ", roomID)

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: containerRef.current!,
      sharedLinks: [
        {
          name: "Personal link",
          url: `${window.location.protocol}//${window.location.host}${window.location.pathname}?roomID=${roomID}`,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      onLeaveRoom: () => {
        navigate("/"); 
      },
    });

    return () => {
      zp.destroy();
    };
  }, [roomID]);

  return <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default VideoCallPage;
