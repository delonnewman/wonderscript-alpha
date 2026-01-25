export * from "./kernel/Statement";
export * from "./kernel/Message";
export * from "./kernel/Ref";
export * from "./kernel/Script";
export * from "./kernel/Symbol";

import { Script } from "./kernel/Script";
import { Alien } from "./kernel/Alien";
import { Message } from "./kernel/Message";
import { Symbol } from "./kernel/Symbol";

const $global = new Alien(globalThis, "globalThis", "js");
const s = new Script();
const processRef = s.createReference(Symbol.intern("process"));
s.send($global, Message.intern("process", { ref: processRef }));
s.dereference(Symbol.intern("process"));
