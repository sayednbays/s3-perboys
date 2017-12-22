import { NetworkError, persistent } from "./index";

export async function post(endPoint, postData) {
    let resp = await fetch(endPoint, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': '' + persistent.get('idToken')
        },
        body: JSON.stringify(postData)
    });

    if (resp.ok) {
        let data = await resp.json();
        return data;
    }
    else {
        throw new NetworkError(resp.status, resp.statusText);
    }
}