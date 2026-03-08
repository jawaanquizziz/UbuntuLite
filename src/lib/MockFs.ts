const defaultFs: Record<string, string[]> = {
    "/": ["root", "home", "etc", "var", "bin", "usr"],
    "/root": ["Documents", "Downloads", "Desktop", "readme.txt"],
    "/root/Documents": ["commands.txt"],
    "/root/Downloads": [],
    "/root/Desktop": [],
    "/home": ["user"],
    "/home/user": [],
    "/etc": ["passwd", "hosts", "os-release"],
    "/var": ["log"],
    "/var/log": ["syslog"],
};

const defaultFileContents: Record<string, string> = {
    "/root/readme.txt": "Welcome to the Ubuntu Web Terminal Simulator!\nType 'help' to see a list of available commands.",
    "/root/Documents/commands.txt": "Linux commands to practice:\n- ls\n- cd\n- mkdir\n- touch\n- cat\n- ifconfig\n- ping",
    "/etc/passwd": "root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:User,,,:/home/user:/bin/bash",
    "/etc/hosts": "127.0.0.1 localhost\n127.0.1.1 ubuntu\n::1 ip6-localhost ip6-loopback",
    "/etc/os-release": "PRETTY_NAME=\"Ubuntu 22.04.3 LTS\"\nNAME=\"Ubuntu\"\nVERSION_ID=\"22.04\"",
    "/var/log/syslog": "Mar 3 10:00:01 ubuntu systemd[1]: Started System Logging Service.\nMar 3 10:05:22 ubuntu kernel: [ 0.000000] Linux version 5.15.0-generic"
};

export let fs: Record<string, string[]> = { ...defaultFs };
export let fileContents: Record<string, string> = { ...defaultFileContents };

export function loadFs() {
    if (typeof window !== "undefined") {
        const savedFs = localStorage.getItem("ubuntu_fs");
        const savedContents = localStorage.getItem("ubuntu_fileContents");
        if (savedFs) fs = JSON.parse(savedFs);
        if (savedContents) fileContents = JSON.parse(savedContents);
    }
}

export function saveFs() {
    if (typeof window !== "undefined") {
        localStorage.setItem("ubuntu_fs", JSON.stringify(fs));
        localStorage.setItem("ubuntu_fileContents", JSON.stringify(fileContents));
    }
}

export function resetFs() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("ubuntu_fs");
        localStorage.removeItem("ubuntu_fileContents");
    }
    fs = { ...defaultFs };
    fileContents = { ...defaultFileContents };
}

export function resolvePath(currentDir: string, target?: string): string {
    if (!target) return currentDir;
    if (target === "~") return "/root";
    if (target === "/") return "/";
    if (target === ".") return currentDir;

    if (target === "..") {
        if (currentDir === "/") return "/";
        const parts = currentDir.split("/");
        parts.pop();
        return parts.join("/") || "/";
    }

    let absPath = target.startsWith("/") ? target : (currentDir === "/" ? `/${target}` : `${currentDir}/${target}`);
    if (absPath.length > 1 && absPath.endsWith("/")) {
        absPath = absPath.slice(0, -1);
    }
    return absPath;
}
