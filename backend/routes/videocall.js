const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/generate-token", (req, res) => {
    try {
        const { roomID, userID, userName, role } = req.body;

        if (!roomID || !userID || !userName) {
            return res.status(400).json({
                message: "roomID, userID, userName required"
            });
        }

        const appID = Number(process.env.ZEGO_APP_ID);
        const serverSecret = process.env.ZEGO_SERVER_SECRET;

        if (!appID || !serverSecret) {
            return res.status(500).json({
                message: "Zego credentials missing"
            });
        }

        // ✅ UIKit Kit Token (JWT)
        const payload = {
            app_id: appID,
            user_id: userID,
            room_id: roomID,
            user_name: userName,
            role: role || "Host",
            exp: Math.floor(Date.now() / 1000) + 60 * 60
        };

        const token = jwt.sign(payload, serverSecret);

        res.json({
            token,
            roomID,
            userID,
            userName
        });

    } catch (err) {
        console.error("Token error:", err);
        res.status(500).json({ message: "Token generation failed" });
    }
});

module.exports = router;
