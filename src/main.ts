import {IgApiClient} from "instagram-private-api";
import {GraphQLSubscription} from "./realtime/subscriptions/graphql.subscription";
import {RealtimeClient} from "./realtime/realtime.client";
import {Topic} from "./topic";
import {ParsedMessage} from "./realtime/parsers/parser";
import {FbnsClient} from "./fbns/fbns.client";

const ig = new IgApiClient();
ig.state.generateDevice(process.env.IG_USERNAME);

(async () => {

    await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

   const realtimeClient = new RealtimeClient(ig, [
        GraphQLSubscription.getAppPresenceSubscription(),
        GraphQLSubscription.getClientConfigUpdateSubscription(),
        GraphQLSubscription.getZeroProvisionSubscription(ig.state.deviceId),
        GraphQLSubscription.getDirectTypingSubscription(ig.state.cookieUserId),
        GraphQLSubscription.getAsyncAdSubscription(ig.state.cookieUserId),
    ]);
    realtimeClient.on('receive', (topic: Topic, messages: ParsedMessage[]) => {
        console.log(`${topic.path}\n${JSON.stringify(messages.map(msg => msg.data), undefined, 4)}\n`);
    });
    realtimeClient.on('error', console.error);
    realtimeClient.on('close', () => console.error('RealtimeClient closed'));

})();
