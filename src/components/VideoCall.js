import React from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useLocation } from "react-router-dom";

export default function VideoCall() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);

    // 🔑 Same room for moderator & client
    const roomID = params.get("room");

    if (!roomID) {
        return <div style={{ padding: 40 }}>❌ Invalid meeting link</div>;
    }

    const myMeeting = (element) => {
        if (!element) return;

        const appID = Number(process.env.REACT_APP_ZEGO_APP_ID);
        const serverSecret = process.env.REACT_APP_ZEGO_SERVER_SECRET;

        // ✅ Generate TEST Kit Token (OFFICIAL METHOD)
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID,
            serverSecret,
            roomID,
            Date.now().toString(),
            "User_" + Math.floor(Math.random() * 100)
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);

        zp.joinRoom({
            container: element,
            maxUsers: 50,
            scenario: {
                mode: ZegoUIKitPrebuilt.GroupCall
            },
            sharedLinks: [
                {
                    name: "Copy Link",
                    url:
                        window.location.origin +
                        "/videocall?room=" +
                        encodeURIComponent(roomID)
                }
            ]
        });
    };

    return (
        <div
            ref={myMeeting}
            style={{ width: "100vw", height: "100vh" }}
        />
    );
}
