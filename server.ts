import { createServer, Server, ServerResponse, IncomingMessage } from "http";
import { AddressInfo } from "net";

function requestListener(request: IncomingMessage, response: ServerResponse) {
    function start() {
        console.log(Date.now(), `request ${requestLabel} at port ${port} come in`);
    }

    function end() {
        response.end(`${requestLabel} request finish`);
        console.log(Date.now(), `request ${requestLabel} at port ${port} end`);
    }

    const { port } = (this as Server).address() as AddressInfo;
    const { url } = request;
    const isSlow = url.includes("slow");
    const requestLabel = isSlow ? "slow" : "fast";

    start();
    setTimeout(() => {
        end();
    }, isSlow ? 3000 : 0);
}

createServer(requestListener).listen(3002, () => console.log("listening on 3001"));
createServer(requestListener).listen(3003, () => console.log("listening on 3002"));
