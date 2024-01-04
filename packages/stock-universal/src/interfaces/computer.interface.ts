import {
  TcpuCoreThread,
  TgraphicsName,
  TkeyboradStandard,
  TprocessorName,
  TramSize, TramType,
  TscreenSize,
  TstorageDriveType,
  TstorageSizeHdd,
  TstorageSizeSsd
} from '../types/union.types';
import { Iitem } from './item.interface';

// This file imports the `TcpuCoreThread`, `TgraphicsName`, `TkeyboradStandard`, `TprocessorName`, `TramSize`, `TramType`, `TscreenSize`, `TstorageDriveType`, `TstorageSizeHdd`, and `TstorageSizeSsd` types from the `union.types` file.
// This file imports the `Iitem` interface from the `item.interface` file.


export interface IcpuModel {
  // The `name` property is the name of the CPU model.
  name: TprocessorName;
  // The `cpuSpeed` property is the speed of the CPU in GHz.
  cpuSpeed: number;
  // The `cpuCores` property is the number of cores in the CPU.
  cpuCores: TcpuCoreThread;
  // The `cpuThreads` property is the number of threads in the CPU.
  cpuThreads: TcpuCoreThread;
}

// This interface defines the properties of a CPU model.


export interface IramModel {
  // The `ramSize` property is the size of the RAM in GB.
  ramSize: TramSize;
  // The `type` property is the type of RAM.
  type: TramType;
}

// This interface defines the properties of a RAM model.


export interface IgraphicsSpec {
  // The `name` property is the name of the graphics card.
  name: TgraphicsName;
  // The `ramSize` property is the size of the graphics card's RAM in GB.
  ramSize?: TramSize;
}

// This interface defines the properties of a graphics card specification.


export interface IscreenSpec {
  // The `size` property is the size of the screen in inches.
  size: TscreenSize;
}

// This interface defines the properties of a screen specification.


export interface IkeyboardSpec {
  // The `light` property indicates whether the keyboard has a backlight.
  light: boolean;
  // The `standard` property is the keyboard layout.
  standard: TkeyboradStandard;
}

// This interface defines the properties of a keyboard specification.


export interface IpheripheralSpec {
  // The `usbNo` property is the number of USB ports.
  usbNo: number;
  // The `usbC` property indicates whether the computer has a USB-C port.
  usbC: boolean;
  // The `usbCNo` property is the number of USB-C ports.
  usbCNo: number;
  // The `hdmiNo` property indicates whether the computer has an HDMI port.
  hdmiNo: boolean;
}

// This interface defines the properties of a peripheral specification.


export interface Icomputer
extends Iitem {
  // The `brand` property is the brand of the computer.
  brand: string;
  // The `cpuModel` property is the CPU model of the computer.
  cpuModel: IcpuModel;
  // The `ramModel` property is the RAM model of the computer.
  ramModel: IramModel;
  // The `graphics` property is an array of graphics card specifications.
  graphics: IgraphicsSpec[];
  // The `pheripheral` property is the peripheral specification of the computer.
  pheripheral: IpheripheralSpec;
  // The `screen` property is the screen specification of the computer.
  screen: IscreenSpec;
  // The `storageDrive` property is the storage drive specification of the computer.
  storageDrive: IStorageDrive;
  // The `os` property is the operating system of the computer.
  os: string;
}


export interface IStorageDrive {
  // The `type` property is the type of storage drive.
  type: TstorageDriveType;
  // The `size` property is the size of the storage drive.
  size: TstorageSizeSsd | TstorageSizeHdd;
}

// This interface defines the properties of a storage drive.


export interface Ilaptop
extends Icomputer {
  // The `keyBoard` property is the keyboard specification of the laptop.
  keyBoard: IkeyboardSpec;
}

// This interface extends the `Icomputer` interface and defines the properties of a laptop.


export interface Idesktop
extends Icomputer {
  // The `withScreen` property indicates whether the desktop has a screen.
  withScreen: boolean;
}

// This interface extends the `Iitem` interface and defines the properties of a computer.
