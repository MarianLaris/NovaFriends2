import { CapacitorConfig } from '@capacitor/cli';


const ios_public_key = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsaS6xWL8LcCzUYuCkyQC
5VyMddakIUQ1/+nNTEr3fJ+8x11LWUApbbECKf+ADvIUvtHzlEEihEJZr8rsY0Wz
0nd/YSpbtTsikw7MUTIL19pB9J1+mgJ/3K2Zvm39+PMklIl4x/p+SRMNO6E3WxU9
FrrL7dRnqL81G1M7AQ47H1dQ1sfPgHWvHGQRD/f7MXcwe/P6I55O9OOVXY01lAL/
Fw/DtTpRyAQ8SyCSsKbOTXOLxAdXWEUhucU751ZcqzM8fJ94iJtxgsKeIyguAboG
EfooJDVIpZCYZxDu5efXxyqAh/2a6YuSMxx8R3SZbLu/2jJYWHXlUPaKGPU4GZVl
nQIDAQAB
-----END PUBLIC KEY-----`



const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'NovaFriends',
  webDir: 'build',
  bundledWebRuntime: false,
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    "CodePush": {
      //can be found in your appcenter Demo-ios app dashboard
      "IOS_DEPLOY_KEY": "c08e5961-b8ef-4a5e-99d0-e0e41173231a",
      //the content of your publicKey.pem
      "IOS_PUBLIC_KEY": ios_public_key,//(optional)
      //can be found in your appcenter Demo-android app dashboard
      "ANDROID_DEPLOY_KEY": "YOUR_ANDROID_DEPLOYMENT_KEY",
      //the content of your publicKey.pem
      "ANDROID_PUBLIC_KEY": "YOUR_GENERATED_SECRET_KEY",//(optional)
      "SERVER_URL": "https://codepush.appcenter.ms/"
    }
  },
};

export default config;


