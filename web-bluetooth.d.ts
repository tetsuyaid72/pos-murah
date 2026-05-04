/**
 * Web Bluetooth API Type Declarations
 *
 * These types are not included in the standard lib.dom.d.ts.
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API
 */

interface BluetoothRequestDeviceFilter {
  services?: BluetoothServiceUUID[]
  name?: string
  namePrefix?: string
  manufacturerData?: BluetoothManufacturerDataFilter[]
  serviceData?: BluetoothServiceDataFilter[]
}

interface BluetoothManufacturerDataFilter {
  companyIdentifier: number
  dataPrefix?: BufferSource
  mask?: BufferSource
}

interface BluetoothServiceDataFilter {
  service: BluetoothServiceUUID
  dataPrefix?: BufferSource
  mask?: BufferSource
}

type BluetoothServiceUUID = number | string

interface RequestDeviceOptions {
  filters?: BluetoothRequestDeviceFilter[]
  optionalServices?: BluetoothServiceUUID[]
  optionalManufacturerData?: number[]
  acceptAllDevices?: boolean
}

interface BluetoothRemoteGATTDescriptor {
  readonly characteristic: BluetoothRemoteGATTCharacteristic
  readonly uuid: string
  readonly value?: DataView
  readValue(): Promise<DataView>
  writeValue(value: BufferSource): Promise<void>
}

interface BluetoothCharacteristicProperties {
  readonly authenticatedSignedWrites: boolean
  readonly broadcast: boolean
  readonly indicate: boolean
  readonly notify: boolean
  readonly read: boolean
  readonly reliableWrite: boolean
  readonly writableAuxiliaries: boolean
  readonly write: boolean
  readonly writeWithoutResponse: boolean
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  readonly service: BluetoothRemoteGATTService
  readonly uuid: string
  readonly properties: BluetoothCharacteristicProperties
  readonly value?: DataView
  getDescriptor(descriptor: string): Promise<BluetoothRemoteGATTDescriptor>
  getDescriptors(descriptor?: string): Promise<BluetoothRemoteGATTDescriptor[]>
  readValue(): Promise<DataView>
  writeValue(value: ArrayBuffer | DataView): Promise<void>
  writeValueWithResponse(value: ArrayBuffer | DataView): Promise<void>
  writeValueWithoutResponse(value: ArrayBuffer | DataView): Promise<void>
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
  addEventListener(
    type: 'characteristicvaluechanged',
    listener: (event: Event) => void,
    options?: boolean | AddEventListenerOptions
  ): void
  removeEventListener(
    type: 'characteristicvaluechanged',
    listener: (event: Event) => void,
    options?: boolean | EventListenerOptions
  ): void
}

interface BluetoothRemoteGATTService extends EventTarget {
  readonly device: BluetoothDevice
  readonly uuid: string
  readonly isPrimary: boolean
  getCharacteristic(
    characteristic: string
  ): Promise<BluetoothRemoteGATTCharacteristic>
  getCharacteristics(
    characteristic?: string
  ): Promise<BluetoothRemoteGATTCharacteristic[]>
  getIncludedService(service: string): Promise<BluetoothRemoteGATTService>
  getIncludedServices(
    service?: string
  ): Promise<BluetoothRemoteGATTService[]>
}

interface BluetoothRemoteGATTServer {
  readonly device: BluetoothDevice
  readonly connected: boolean
  connect(): Promise<BluetoothRemoteGATTServer>
  disconnect(): void
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>
  getPrimaryServices(
    service?: string
  ): Promise<BluetoothRemoteGATTService[]>
}

interface BluetoothDevice extends EventTarget {
  readonly id: string
  readonly name?: string
  readonly gatt?: BluetoothRemoteGATTServer
  addEventListener(
    type: 'gattserverdisconnected',
    listener: (event: Event) => void,
    options?: boolean | AddEventListenerOptions
  ): void
  removeEventListener(
    type: 'gattserverdisconnected',
    listener: (event: Event) => void,
    options?: boolean | EventListenerOptions
  ): void
}

interface Bluetooth extends EventTarget {
  getAvailability(): Promise<boolean>
  requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>
  getDevices(): Promise<BluetoothDevice[]>
  addEventListener(
    type: 'availabilitychanged',
    listener: (event: Event) => void,
    options?: boolean | AddEventListenerOptions
  ): void
  removeEventListener(
    type: 'availabilitychanged',
    listener: (event: Event) => void,
    options?: boolean | EventListenerOptions
  ): void
}

interface Navigator {
  bluetooth: Bluetooth
}
