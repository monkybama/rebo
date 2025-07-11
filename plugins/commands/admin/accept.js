import moment from "moment-timezone";

const config = {
  name: "فريند", 
  version: "1.0.0",
  credits: "BLACK",
  permissions: [2],
  description: "Make friends via Facebook ID",
  usages: "uid",
  cooldowns: 0,
};

async function handleReply({ eventData, message }) {
  const { body } = message;
  const { listRequest } = eventData;

  const args = body.replace(/ +/g, " ").toLowerCase().split(" ");

  const form = {
    av: global.api.getCurrentUserID(),
    fb_api_caller_class: "RelayModern",
    variables: {
      input: {
        source: "friends_tab",
        actor_id: global.api.getCurrentUserID(),
        client_mutation_id: Math.round(Math.random() * 19).toString(),
      },
      scale: 3,
      refresh_num: 0,
    },
  };

  const success = [];
  const failed = [];

  if (args[0] == "add") {
    form.fb_api_req_friendly_name =
      "FriendingCometFriendRequestConfirmMutation";
    form.doc_id = "3147613905362928";
  } else if (args[0] == "del") {
    form.fb_api_req_friendly_name =
      "FriendingCometFriendRequestDeleteMutation";
    form.doc_id = "4108254489275063";
  } else
    return message.reply(
      'Please select <add | del > <end | order or "all">'
    );

  let targetIDs = args.slice(1);

  if (args[1] == "all") {
    targetIDs = [];
    const lengthList = listRequest.length;
    for (let i = 1; i <= lengthList; i++) targetIDs.push(i);
  }

  const newTargetIDs = [];
  const promiseFriends = [];

  for (const stt of targetIDs) {
    const u = listRequest[parseInt(stt) - 1];
    if (!u) {
      failed.push(`Stt ${stt} was not found in the list`);
      continue;
    }
    form.variables.input.friend_requester_id = u.node.id;
    form.variables = JSON.stringify(form.variables);
    newTargetIDs.push(u);
    promiseFriends.push(
      global.api.httpPost("https://www.facebook.com/api/graphql/", form)
    );
    form.variables = JSON.parse(form.variables);
  }

  const lengthTarget = newTargetIDs.length;
  for (let i = 0; i < lengthTarget; i++) {
    try {
      const friendRequest = await promiseFriends[i];
      if (JSON.parse(friendRequest).errors)
        failed.push(newTargetIDs[i].node.name);
      else success.push(newTargetIDs[i].node.name);
    } catch (e) {
      failed.push(newTargetIDs[i].node.name);
    }
  }

  message.reply(
    `» Already ${args[0] == "add" ? "accepted" : "delete"
    } successfully the friend request of ${success.length
    } person:\n${success.join("\n")}${failed.length > 0
      ? `\n» Failed with ${failed.length} person: ${failed.join("\n")}`
      : ""
    }`
  );
}

async function onCall({ message }) {
  const form = {
    av: global.api.getCurrentUserID(),
    fb_api_req_friendly_name:
      "FriendingCometFriendRequestsRootQueryRelayPreloader",
    fb_api_caller_class: "RelayModern",
    doc_id: "4499164963466303",
    variables: JSON.stringify({ input: { scale: 3 } }),
  };

  const listRequest = JSON.parse(
    await global.api.httpPost("https://www.facebook.com/api/graphql/", form)
  ).data.viewer.friending_possibilities.edges;

  let msg = "";
  let i = 0;
  for (const user of listRequest) {
    i++;
    msg +=
      `\n${i}. 𝐍𝐚𝐦𝐞: ${user.node.name}` +
      `\n𝐈𝐃: ${user.node.id}` +
      `\n𝐔𝐫𝐥: ${user.node.url.replace("www.facebook", "fb")}` +
      `\n𝐓𝐢𝐦𝐞: ${moment(user.time * 1009)
        .tz("Asia/Manila")
        .format("DD/MM/YYYY HH:mm:ss")}\n`;
  }

  message
    .reply(
      `${msg}\nReply this message reads: <add | del> <the order of | or \"all\"> to take action`
    )
    .then((d) =>
      d.addReplyEvent({
        callback: handleReply,
        listRequest,
      })
    );
}

export { onCall, config };
