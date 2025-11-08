import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import type { DeviceInfo } from '../constants';

export function getDeviceInfo(): DeviceInfo {
  if (Platform.OS === 'web') {
    console.log(getWebDeviceInfo());
    return getWebDeviceInfo();
  } else {
    console.log(getMobileDeviceInfo());
    return getMobileDeviceInfo();
  }
}

function getMobileDeviceInfo(): DeviceInfo {
  const platform = Platform.OS === 'ios' ? 'iOS' : 'Android';
  console.log('platform is:', platform)
  return {
    deviceId: generateMobileDeviceId(),
    deviceModel: Device.modelName || Device.deviceName || 'Unknown Device',
    osVersion: Device.osVersion || 'Unknown',
    platform: platform,
  };
}

function getWebDeviceInfo(): DeviceInfo {
  return {
    deviceId: generateBrowserFingerprint(),
    deviceModel: getBrowserInfo(),
    osVersion: getOsInfo(),
    platform: 'web',
  };
}

function getBrowserInfo(): string {
  if (typeof navigator === 'undefined') return 'Web Browser';

  const platformInfo = navigator.userAgent.split('(')[1]?.split(')')[0];
  if (platformInfo) return platformInfo;

  return 'Web Browser';
}

function getOsInfo(): string {
  if (typeof navigator === 'undefined') return 'Unknown';

  if ('userAgentData' in navigator) {
    const uaData = (navigator as any).userAgentData;
    if (uaData?.platform) return uaData.platform;
  }

  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes('win')) return 'Windows';
  if (ua.includes('mac')) return 'MacOS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';

  return 'Unknown';
}

function generateMobileDeviceId(): string {
  const components = [
    Device.modelName || 'unknown',
    Device.osName || 'unknown',
    Device.osVersion || 'unknown',
    Constants.sessionId || 'unknown',
    Device.deviceYearClass?.toString() || 'unknown',
  ].join('|');

  return hashString(components);
}

function generateBrowserFingerprint(): string {
  if (typeof navigator === 'undefined' || typeof screen === 'undefined') {
    return 'web-unknown';
  }

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency || 'unknown',
  ].join('|');

  return hashString(components);
}

function hashString(input: string): string {
  let hash = 5381; // TODO: djb2 algorithm initial value, make a constant or config value

  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i); 
  }

  return Math.abs(hash).toString();
}
