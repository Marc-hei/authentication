registerKey = document.getElementById('register');
loginKey = document.getElementById('login');

let rawId = null

registerKey.addEventListener('click', async () => {
  let credential = await navigator.credentials.create({
  publicKey: {
    challenge: new Uint8Array([117, 61, 252, 231, 191, 241 /* … */]),
    rp: { id: "localhost", name: "localhost" },
    user: {
      id: new Uint8Array([79, 252, 83, 72, 214, 7, 89, 26]),
      name: "jamiedoe",
      displayName: "Jamie Doe",
    },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
  },
  });
  console.log(credential)
  rawId = credential.rawId
  console.log("Raw ID:", rawId);
})


loginKey.addEventListener('click', async () => {
  let credential = await navigator.credentials.get({
  publicKey: {
    challenge: new Uint8Array([139, 66, 181, 87, 7, 203 /* … */]),
    // rpId: "localhost",
    // allowCredentials: [
    //   {
    //     type: "public-key",
    //     id: rawId,
    //   },
    // ],
    userVerification: "required",
  },
  });
  console.log(credential)
})