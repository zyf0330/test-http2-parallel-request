import { get, Agent, IncomingMessage } from "http";
import * as http2 from "http2";
import { ClientHttp2Session } from "http2";

const agent = new Agent({ keepAlive: true, keepAliveMsecs: 60000, maxSockets: 1 });

enum Protocol {
    http1 = 0,
    http2 = 1
}

let http2Client: ClientHttp2Session;
let flyingRequest: number = 0;

function doRequest(protocol: Protocol, isSlow: boolean) {
    const requestUrl = isSlow ? "/slow" : "/fast";
    const serverPort = protocol === Protocol.http1 ? 3000 : 3001;
    const now = Date.now();
    console.log(now, `request ${requestUrl} start`);

    flyingRequest++;
    if (protocol === Protocol.http1) {
        get(`http://localhost:${serverPort}${requestUrl}`, { agent }, (res: IncomingMessage) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                flyingRequest--;
                console.log(Date.now(), `request ${requestUrl} end, elapsed ${Date.now() - now} ms`);
            });
        });
    } else {
        http2Client = http2Client ?? http2.connect(`http://localhost:${serverPort}`);

        const req = http2Client.request({ ':path': `${requestUrl}` });
        req.setEncoding('utf8');
        let data = '';
        req.on('data', (chunk) => { data += chunk; });
        req.on('end', () => {
            flyingRequest--;
            if (flyingRequest === 0) {
                http2Client.close();
            }
            console.log(Date.now(), `request ${requestUrl} end, elapsed ${Date.now() - now} ms`);
        });
        req.end();
    }
}

function doParallelRequests(protocol: Protocol) {
    console.log(`do request by protocol ${Protocol[protocol]}`);
    // fast
    doRequest(protocol, false);
    // slow
    doRequest(protocol, true);
    // fast
    doRequest(protocol, false);
}

// http1
doParallelRequests(Protocol.http1);
// http2
// doParallelRequests(Protocol.http2);
