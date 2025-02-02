import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";

interface Device {
  serial: string;
  name: string;
  description: string;
  icon: string;
  http_port: number;
  https_port?: number;
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
      type="button"
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center gap-2 rounded border border-neutral-600 px-2 py-1 ${className}`}
    >
      {icon && <Icon icon={icon} className="h-auto w-4" />}
      {text}
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

  return <Icon icon={icon} className="h-auto w-full" />;
}

function Interfaces({
  list,
  http_port,
  https_port,
}: {
  list: Interface[];
  http_port: number;
  https_port?: number;
}) {
  const onClick = useCallback(
    (ipv4?: string, ipv6?: string) => {
      window.location.href = `http://${ipv4 || ipv6}:${https_port || http_port}`;
    },
    [http_port, https_port],
  );

  return (
    <ul className="bg-white dark:bg-neutral-950">
      {list.map((item) => (
        <li
          key={item.mac}
          onClick={() => onClick(item.ipv4, item.ipv6)}
          className="flex cursor-pointer items-center gap-2 border-t border-l-4 border-transparent border-t-neutral-200 py-1 pr-2 pl-6 hover:border-l-orange-400 hover:bg-neutral-200 hover:text-orange-400 dark:border-t-neutral-700 dark:hover:bg-neutral-900"
        >
          <div className="aspect-square w-10 p-2 text-black dark:text-white">
            <InterfaceIcon type={item.type} />
          </div>
          <div className="min-w-0 flex-1 text-black dark:text-white">
            <h5 className="truncate text-base">{item.name}</h5>
            <h6 className="truncate text-xs italic">
              {item.ipv4} - {item.ipv6}
            </h6>
          </div>
          <Icon
            icon="mdi:arrow-right-circle-outline"
            className="h-auto w-5 hover:text-orange-400"
          />
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

  return <Icon icon={mdi_icon} className="h-auto w-full" />;
}

function ConnectionIcon({ online, ts }: { online: boolean; ts: number }) {
  const color = useMemo(() => {
    const diff = Date.now() / 1000 - ts;
    if (online) {
      if (diff < 45) return "text-green-500";
      else if (diff < 120) return "text-yellow-500";
    }
    return "text-red-500";
  }, [online, ts]);
  return <Icon icon="mdi:connection" className={`h-auto w-4 ${color}`} />;
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
    <ul className="flex flex-1 flex-col overflow-y-auto">
      {list.map((item) => (
        <li
          key={item.serial}
          className="border-neutral-300 bg-neutral-100 not-last:border-b dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="aspect-square w-10 p-1">
              <DeviceIcon icon={item.icon} />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="flex items-center gap-2 truncate text-lg">
                <ConnectionIcon online={item.online} ts={item.last_update} />
                {item.name}
              </h5>
              <h6 className="truncate pl-6 text-sm italic">
                {item.description}
              </h6>
            </div>
            <Button
              icon="mdi:delete"
              className="bg-red-500 text-white hover:bg-red-600 focus:bg-red-600"
              onClick={() => deleteDevice(item.serial)}
            />
          </div>
          <Interfaces
            list={item.ifaces}
            http_port={item.http_port}
            https_port={item.https_port}
          />
        </li>
      ))}
    </ul>
  );
}

function Header({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex items-center border-b border-neutral-200 px-4 py-2 dark:border-neutral-700 dark:bg-neutral-800">
      <span className="flex-1">Detected devices: </span>
      <Button
        icon="mdi:refresh"
        text="Refresh"
        className="hover:bg-neutral-200 focus:bg-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
        onClick={onClick}
      />
    </div>
  );
}

function Loading() {
  return (
    <div className="inline-flex min-h-20 items-center justify-center gap-4 p-4">
      <div
        className="inline-block size-6 animate-spin rounded-full border-[3px] border-current border-t-transparent text-orange-500"
        role="status"
        aria-label="loading"
      ></div>
      Loading...
    </div>
  );
}

function Empty() {
  return (
    <div className="inline-flex min-h-20 items-center justify-center gap-2 p-4">
      <Icon icon="mdi:close-circle" className="h-auto w-8" />
      No devices!
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
    <div className="flex flex-col overflow-auto">
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
