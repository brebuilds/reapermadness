declare module 'osc' {
  export interface UDPPortOptions {
    localAddress?: string;
    localPort?: number;
    remoteAddress?: string;
    remotePort?: number;
    metadata?: boolean;
  }

  export interface OSCMessage {
    address: string;
    args: Array<{
      type: string;
      value: number | string | boolean;
    }>;
  }

  export class UDPPort {
    constructor(options: UDPPortOptions);
    open(): void;
    close(): void;
    send(message: OSCMessage): void;
    on(event: 'ready', callback: () => void): void;
    on(event: 'message', callback: (message: OSCMessage) => void): void;
    on(event: 'error', callback: (error: Error) => void): void;
  }
}
