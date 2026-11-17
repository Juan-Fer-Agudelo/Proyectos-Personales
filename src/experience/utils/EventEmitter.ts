type Handler = (...args: unknown[]) => void;

export class EventEmitter {
  private handlers = new Map<string, Set<Handler>>();

  on(name: string, handler: Handler): this {
    if (!this.handlers.has(name)) this.handlers.set(name, new Set());
    this.handlers.get(name)!.add(handler);
    return this;
  }

  off(name: string, handler?: Handler): this {
    if (!handler) this.handlers.delete(name);
    else this.handlers.get(name)?.delete(handler);
    return this;
  }

  trigger(name: string, ...args: unknown[]): void {
    this.handlers.get(name)?.forEach((h) => h(...args));
  }
}
