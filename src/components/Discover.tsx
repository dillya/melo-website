import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";

interface Device {
  serial: string;
  name: string;
  description: string;
  icon: string;
  online: boolean;
  last_update: number;
  ifaces: Interface[];
}

interface Interface {
  mac: string;
  name: string;
  type: string;
  ipv4?: string;
  ipv6?: string;
}

function Button({
  icon,
  text,
  className = "",
  onClick,
}: {
  icon?: string;
  text?: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-1 border border-neutral-600 rounded flex items-center px-2 cursor-pointer ${className}`}
    >
      {icon && <Icon icon={icon} className="w-4 h-auto" />}
      {text && <span className="px-2">{text}</span>}
    </button>
  );
}

function InterfaceIcon({ type }: { type: string }) {
  const icon = useMemo(() => {
    switch (type) {
      case "ethernet":
        return "mdi:ethernet";
      case "wifi":
        return "mdi:wifi";
      default:
        return "mdi:question-mark-circle-outline";
    }
  }, [type]);

  return <Icon icon={icon} className="w-full h-auto" />;
}

function Interfaces({ list }: { list: Interface[] }) {
  const onClick = useCallback((ipv4?: string, ipv6?: string) => {
    window.location.href = "http://" + (ipv4 || ipv6);
  }, []);

  return (
    <ul className="bg-neutral-200">
      {list.map((item) => (
        <li
          key={item.mac}
          onClick={() => onClick(item.ipv4, item.ipv6)}
          className="pl-6 py-1 flex items-center border-l-4 border-transparent hover:border-orange-500 hover:bg-neutral-300 cursor-pointer"
        >
          <div className="w-10 aspect-square p-2">
            <InterfaceIcon type={item.type} />
          </div>
          <div className="px-2 flex-1 min-w-0">
            <h5 className="truncate text-base">{item.name}</h5>
            <h6 className="truncate text-xs italic">
              {item.ipv4} - {item.ipv6}
            </h6>
          </div>
        </li>
      ))}
    </ul>
  );
}

function DeviceIcon({ icon }: { icon: string }) {
  const mdi_icon = useMemo(() => {
    switch (icon) {
      case "living":
        return "mdi:sofa";
      case "kitchen":
        return "mdi:kitchen";
      case "bed":
        return "mdi:bed";
      default:
        return "mdi:question-mark-circle-outline";
    }
  }, [icon]);

  return <Icon icon={mdi_icon} className="w-full h-auto" />;
}

function ConnectionIcon({ online, ts }: { online: boolean; ts: number }) {
  const color = useMemo(() => {
    const diff = Date.now() / 1000 - ts;
    if (online) {
      if (diff < 45) return "text-green-500";
      else if (diff < 120) return "text-orange-500";
    }
    return "text-red-500";
  }, [online, ts]);
  return <Icon icon="mdi:connection" className={`w-4 h-auto ${color}`} />;
}

function Devices({
  list,
  setList,
}: {
  list: Device[];
  setList: (fn: (list: Device[]) => Device[]) => void;
}) {
  const deleteDevice = useCallback((serial: string) => {
    (async () => {
      const resp = await fetch(`https://api.melo.re/device/${serial}`, {
        method: "DELETE",
      });
      if (resp.status === 200) {
        setList((prev) => prev.filter((item) => item.serial != serial));
      } else {
        console.error("Failed to delete device " + serial);
      }
    })();
  }, []);

  return (
    <ul className="flex flex-col overflow-y-auto flex-1">
      {list.map((item) => (
        <li key={item.serial} className="even:bg-neutral-100">
          <div className="flex items-center px-2 py-1">
            <div className="w-10 aspect-square p-1">
              <DeviceIcon icon={item.icon} />
            </div>
            <div className="px-2 flex-1 min-w-0">
              <h5 className="truncate text-lg flex items-center">
                <div className="pr-2">
                  <ConnectionIcon online={item.online} ts={item.last_update} />
                </div>
                {item.name}
              </h5>
              <h6 className="truncate text-sm pl-6 italic">
                {item.description}
              </h6>
            </div>
            <Button
              icon="mdi:delete"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => deleteDevice(item.serial)}
            />
          </div>
          <Interfaces list={item.ifaces} />
        </li>
      ))}
    </ul>
  );
}

function Header({ onClick }: { onClick: () => void }) {
  return (
    <div className="border-b border-neutral-200 px-4 py-2 flex items-center">
      <span className="flex-1">Detected devices: </span>
      <Button
        icon="mdi:refresh"
        text="Refresh"
        className="hover:bg-neutral-200"
        onClick={onClick}
      />
    </div>
  );
}

function Loading() {
  return (
    <div className="min-h-20 flex items-center justify-center p-4">
      <div
        className="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-orange-500 rounded-full"
        role="status"
        aria-label="loading"
      ></div>
      <span className="px-4">Loading...</span>
    </div>
  );
}

function Empty() {
  return (
    <div className="min-h-20 flex items-center justify-center p-4">
      <Icon icon="mdi:close-circle" className="w-8 h-auto" />
      <span className="px-2">No devices!</span>
    </div>
  );
}

export function Discover() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch device list
  useEffect(() => {
    // Nothing to do
    if (!loading) {
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      const resp = await fetch("https://api.melo.re/device/list", { signal });
      const list = await resp.json();
      list.sort((a: Device, b: Device) => a.last_update < b.last_update);
      setDevices(list);
      setLoading(false);
    })();

    return () => {
      controller.abort();
    };
  }, [loading]);

  // Refresh action
  const onRefresh = useCallback(() => {
    // Trigger reload
    setLoading(true);
  }, []);

  return (
    <div className="overflow-auto flex flex-col">
      <Header onClick={onRefresh} />
      {loading ? (
        <Loading />
      ) : devices.length ? (
        <Devices list={devices} setList={setDevices} />
      ) : (
        <Empty />
      )}
    </div>
  );
}

export default Discover;
