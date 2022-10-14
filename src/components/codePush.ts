
import { Device } from '@capacitor/device'
import environment from '../assets/environment';
import { codePush, InstallMode } from 'capacitor-codepush'
import { ILocalPackage, IRemotePackage } from 'capacitor-codepush/dist/esm/package';
import { SuccessCallback } from 'capacitor-codepush/dist/esm/callbackUtil';


export async function checkUpdate() {
    let deploymentKey;

    const platform = (await Device.getInfo()).platform

    if (platform == 'ios') {
        deploymentKey = environment.codePushIosKey;

    } else if (platform == ('android')) {
        deploymentKey = environment.codePushAndroidKey;

    }
    codePush.checkForUpdate(success, error, deploymentKey);
}
const success: any = async function (remotePackage: IRemotePackage) {
    if (!remotePackage) {
        console.log('App is Up to date');
        codePush.notifyApplicationReady(); // checks if the last update was successful,(if not successful, it will rollback to previous version)
    } else {
        if (!remotePackage.failedInstall) {
            console.log(
                'A CodePush update is available. Package hash: ',
                remotePackage
            );

            // DOWNLOAD UPDATE
            console.log('Downloading =========--=======>');
            const result: ILocalPackage = await remotePackage.download();
            if (result) {
                result.install({
                    installMode: InstallMode.IMMEDIATE,
                    minimumBackgroundDuration: 0,
                    mandatoryInstallMode: InstallMode.IMMEDIATE,
                });
            }
            console.log('Result of download', result);
        } else {
            console.log('The available update was attempted before and failed.');
        }
    }
    return
}

function onPackageDownloaded(localPackage: ILocalPackage) {
    console.log('Download succeeded.===========>', localPackage.description);
    localPackage
        .install({
            installMode: InstallMode.IMMEDIATE,
            minimumBackgroundDuration: 0,
            mandatoryInstallMode: InstallMode.IMMEDIATE,
        })
        .then(onInstallSuccess, error);
}

function onInstallSuccess() {
    console.log('Installation succeeded.');

    setTimeout(async () => {
        codePush.restartApplication(); // restarts the application to patch the update
    }, 200);
}

function error(error: any) {
    console.log('Error===>', error);
}

