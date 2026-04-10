import AgoraRTC from "agora-rtc-sdk-ng";

let client = null;
let localAudioTrack = null;

export async function joinChannel(channelName, uid) {
  // Fetch token + appId from backend (proxied via Vite)
  const res = await fetch(
    `/generate-token?channelName=${channelName}&uid=${uid}`
  );
  const { token, appId } = await res.json();

  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  // Subscribe to remote users BEFORE joining
  client.on("user-published", async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    if (mediaType === "audio") {
      user.audioTrack?.play();
    }
  });

  await client.join(appId, channelName, token, uid);

  localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  await client.publish([localAudioTrack]);

  return { client, localAudioTrack };
}

export async function leaveChannel() {
  if (localAudioTrack) {
    localAudioTrack.stop();
    localAudioTrack.close();
    localAudioTrack = null;
  }
  if (client) {
    await client.leave();
    client = null;
  }
}

export function toggleMute(muted) {
  if (localAudioTrack) {
    localAudioTrack.setEnabled(!muted);
  }
}
