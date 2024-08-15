import { config } from "@/config";

export function Logo() {
  return (
    <div className="flex flex-row mr-auto items-center gap-5">
      <img src={config.defaults.wolfLogo} className="w-8 h-auto" />
      <span className="text-neutral-400 text-lg font-semibold">Wolf Editor</span>
    </div>
  )
}