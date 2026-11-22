import { $, escText } from "../lib/dom";

export function toast(title: string, msg: string): void {
  const d = document.createElement("div");
  d.className = "toast";
  d.innerHTML = `<b>${escText(title)}</b>${escText(msg)}`;
  $("#toasts").appendChild(d);
  setTimeout(() => d.remove(), 5200);
}
