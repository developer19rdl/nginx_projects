import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Socket is created once at module level — survives React re-renders and StrictMode
let _socket = null;

const getSocket = () => {
    if (!_socket || _socket.disconnected) {
        _socket = io(
            process.env.REACT_APP_SCADA_SOCKET_URL ||
            process.env.REACT_APP_API_URL ||
            process.env.REACT_APP_EMS_API_URL?.replace(/\/api\/?$/, ""),
        {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 3000,
            reconnectionDelayMax: 10000,
        });
    }
    return _socket;
};

const useSocket = () => {
    const [liveData, setLiveData] = useState({});
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        const socket = getSocket();

        const onConnect    = () => console.log("SCADA Socket:", socket.id);
        const onDisconnect = () => console.log("SCADA Socket disconnected");
        const onError      = (err) => console.warn("SCADA Socket error:", err.message);
        const onLiveData   = (records) => {
            if (!Array.isArray(records) || !mountedRef.current) return;
            setLiveData(prev => {
                const next = { ...prev };
                for (const { tagId, tagValue } of records) {
                    if (tagId !== undefined && tagValue !== undefined) {
                        next[tagId] = tagValue;
                    }
                }
                return next;
            });
        };

        socket.on("connect",      onConnect);
        socket.on("disconnect",   onDisconnect);
        socket.on("connect_error",onError);
        socket.on("livedata",     onLiveData);

        return () => {
            mountedRef.current = false;
            socket.off("connect",      onConnect);
            socket.off("disconnect",   onDisconnect);
            socket.off("connect_error",onError);
            socket.off("livedata",     onLiveData);
            // Do NOT disconnect — socket is shared across re-renders
        };
    }, []);

    return liveData;
};

export default useSocket;
