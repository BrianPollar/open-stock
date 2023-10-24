import { TcpuCoreThread, TgraphicsName, TkeyboradStandard, TprocessorName, TramSize, TramType, TscreenSize, TstorageDriveType, TstorageSizeHdd, TstorageSizeSsd } from '../types/union.types';
import { Iitem } from './item.interface';
/** */
export interface IcpuModel {
    name: TprocessorName;
    cpuSpeed: number;
    cpuCores: TcpuCoreThread;
    cpuThreads: TcpuCoreThread;
}
/** */
export interface IramModel {
    ramSize: TramSize;
    type: TramType;
}
/** */
export interface IgraphicsSpec {
    name: TgraphicsName;
    ramSize?: TramSize;
}
/** */
export interface IscreenSpec {
    size: TscreenSize;
}
/** */
export interface IkeyboardSpec {
    light: boolean;
    standard: TkeyboradStandard;
}
/** */
export interface IpheripheralSpec {
    usbNo: number;
    usbC: boolean;
    usbCNo: number;
    hdmiNo: boolean;
}
/** */
export interface Icomputer extends Iitem {
    brand: string;
    cpuModel: IcpuModel;
    ramModel: IramModel;
    graphics: IgraphicsSpec[];
    pheripheral: IpheripheralSpec;
    screen: IscreenSpec;
    storageDrive: IStorageDrive;
    os: string;
}
/** */
export interface IStorageDrive {
    type: TstorageDriveType;
    size: TstorageSizeSsd | TstorageSizeHdd;
}
/** */
export interface Ilaptop extends Icomputer {
    keyBoard: IkeyboardSpec;
}
/** */
export interface Idesktop extends Icomputer {
    withScreen: boolean;
}
