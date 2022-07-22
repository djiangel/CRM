import store from '../redux/store';

const baseURL = process.env.REACT_APP_URL

class WebSocketService {
    static instance = null;

    static getInstance() {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    constructor() {
        this.socketRef = null;
        this.state = {
            notification: '',
        }
    }

    connect() {
        var loc = window.location
        var wsStart = 'ws://'
        if (loc.protocol === 'https') {
            wsStart = 'wss://'
        }
        const token = localStorage.getItem('access_token')
        const path = wsStart + baseURL + loc.pathname + "?token=" + token

        this.socketRef = new WebSocket(path)

        this.socketRef.onmessage = e => {
            this.socketNewNotification(e.data);
        };

        this.socketRef.onopen = () => {
            console.log("WebSocket open");
        };

        this.socketRef.onerror = e => {
            console.log('Error occured')
        }

        this.socketRef.onclose = () => {
            store.dispatch({ type: "AUTH_INACTIVE" });
        }
    }

    socketNewNotification(indata) {
        const parsedData = JSON.parse(indata);
        store.dispatch({ type: 'LOAD_NEW_NOTIFICATION', data: parsedData })
    }

    state() {
        return this.socketRef.readyState;
    }
}

let WebSocketInstance = WebSocketService.getInstance();

export default WebSocketInstance;
