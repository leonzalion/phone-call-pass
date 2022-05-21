import getPort from 'get-port';
import ngrok from 'ngrok';
import { makeCall } from './call.js';
import { startNgrokServer } from './ngrok.js';
import { startAppServer } from './server.js';
export async function phoneCallInput({ destinationPhoneNumber, originPhoneNumber, twilioAccountSid, twilioAuthToken, ngrokBinPath, }) {
    try {
        const port = await getPort();
        const passcode = await new Promise((resolve, reject) => {
            startAppServer({ port, shouldAutoInputPasscode: false })
                .then(resolve)
                .catch(reject);
            startNgrokServer({
                port,
                binPath: ngrokBinPath,
            })
                .then(async (ngrokServerUrl) => makeCall({
                ngrokServerUrl,
                destinationPhoneNumber,
                originPhoneNumber,
                twilioAccountSid,
                twilioAuthToken,
            }))
                .catch(reject);
        });
        return passcode;
    }
    catch (error) {
        const err = error;
        // Replace all numeric characters with asterisks to prevent leaking
        // the password
        err.name = err.name.replace(/\d/g, '*');
        err.message = err.message.replace(/\d/g, '*');
        throw err;
    }
    finally {
        await ngrok.kill();
    }
}
