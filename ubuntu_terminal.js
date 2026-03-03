// A simple virtual file system
let fs = {
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

let fileContents = {
    "/root/readme.txt": "Welcome to the Ubuntu Web Terminal Simulator!\nType 'help' to see a list of available commands.",
    "/root/Documents/commands.txt": "Linux commands to practice:\n- ls\n- cd\n- mkdir\n- touch\n- cat\n- ifconfig\n- ping",
    "/etc/passwd": "root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:User,,,:/home/user:/bin/bash",
    "/etc/hosts": "127.0.0.1 localhost\n127.0.1.1 ubuntu\n::1 ip6-localhost ip6-loopback",
    "/etc/os-release": "PRETTY_NAME=\"Ubuntu 22.04.3 LTS\"\nNAME=\"Ubuntu\"\nVERSION_ID=\"22.04\"",
    "/var/log/syslog": "Mar 3 10:00:01 ubuntu systemd[1]: Started System Logging Service.\nMar 3 10:05:22 ubuntu kernel: [ 0.000000] Linux version 5.15.0-generic"
};

let currentDir = "/root";
let commandHistory = [];
let historyIndex = -1;

const outputDiv = document.getElementById("output");
const inputField = document.getElementById("command-input");
const terminalBody = document.getElementById("terminal-body");
const pathSpan = document.querySelector(".prompt .path");
const titleBarInfo = document.querySelector(".terminal-title");

// Keeps input focused when clicking on the terminal box
terminalBody.addEventListener("click", () => {
    inputField.focus();
});

// Appends text to the terminal history display
function print(text, isHtml = false) {
    const div = document.createElement("div");
    div.className = "output-row";
    if (isHtml) {
        div.innerHTML = text;
    } else {
        div.textContent = text;
    }
    outputDiv.appendChild(div);
    // Auto scroll down to latest output
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

// Updates the command line prompt string
function updatePrompt() {
    let displayPath = currentDir.replace("/root", "~");
    pathSpan.textContent = displayPath;
    titleBarInfo.textContent = `root@ubuntu: ${displayPath}`;
}

// Map relative paths to absolute paths purely conceptually based on strings
function resolvePath(target) {
    if (!target) return currentDir;
    if (target === "~") return "/root";
    if (target === "/") return "/";
    if (target === ".") return currentDir;

    // Quick handle for going exactly one level up
    if (target === "..") {
        if (currentDir === "/") return "/";
        let parts = currentDir.split("/");
        parts.pop();
        return parts.join("/") || "/";
    }

    let absPath = target.startsWith("/") ? target : (currentDir === "/" ? `/${target}` : `${currentDir}/${target}`);
    // Clean trailing slashes
    if (absPath.length > 1 && absPath.endsWith("/")) {
        absPath = absPath.slice(0, -1);
    }
    return absPath;
}

// Command dictionary - functions returning either the output string, null, or HTML
const commands = {
    help: () => {
        return `Click the book icon in the top right to open the command reference sidebar!
Also supporting all simulated General Utility, File/Directory, System/User, Process, and Networking commands requested:
General: pwd, cd, mkdir, touch, cat, date, time, cal, tty, bc, echo, clear, exit, man, which, history, lp, lpr, lpstat, lpq, lprm, cancel, who, whoami, mv, cp, rm
File: ls, rmdir, chmod, wc, grep, tr, sort, head, tail, diff, comm, less, more, file, type, split, cmp, tar, find, vim, gzip, bzip2, unzip, locate
User: su, sudo, login, logout, passwd, useradd/adduser, usermod, userdel, groupadd, groupmod, groupdel, gpasswd, chown, chage, chgrp, chfn
Process: ps, pstree, nice, kill, pkill, killall, xkill, fg, bg, pgrep, renice, free, /proc/meminfo, top, htop, df, du, vmstat, demidecode, sar, pagesize
Networking: ifconfig, ping, traceroute, netstat, nslookup, whois, hostname, tcpdump, dig, route, host, arp, iwconfig, curl, wget, telnet, ifplugstatus, nload, w, mail, apt

Try any of them! Note: Interactive apps like vim, less, top are mocked.
`;
    },
    clear: () => {
        outputDiv.innerHTML = "";
        return null;
    },
    pwd: () => currentDir,
    whoami: () => "root",
    date: () => new Date().toString(),
    ls: (args) => {
        let target = resolvePath(args[0]);
        if (fs[target]) {
            return fs[target].join("  ");
        } else if (fileContents[target] !== undefined) {
            let parts = target.split("/");
            return parts[parts.length - 1];
        } else {
            return `ls: cannot access '${target}': No such file or directory`;
        }
    },
    cd: (args) => {
        let target = resolvePath(args[0] || "~");
        if (fs[target]) {
            currentDir = target;
            updatePrompt();
            return null;
        } else if (fileContents[target] !== undefined) {
            return `cd: ${target}: Not a directory`;
        } else {
            return `cd: ${target}: No such file or directory`;
        }
    },
    cat: (args) => {
        if (!args[0]) return "cat: missing operand";
        let target = resolvePath(args[0]);
        if (fileContents[target] !== undefined) {
            return fileContents[target];
        } else if (fs[target]) {
            return `cat: ${target}: Is a directory`;
        } else {
            return `cat: ${target}: No such file or directory`;
        }
    },
    mkdir: (args) => {
        if (!args[0]) return "mkdir: missing operand";
        let target = resolvePath(args[0]);
        if (fs[target] || fileContents[target] !== undefined) {
            return `mkdir: cannot create directory '${args[0]}': File exists`;
        }

        let targetParts = target.split("/");
        let newDir = targetParts.pop();
        let parentDir = targetParts.join("/") || "/";

        if (fs[parentDir]) {
            fs[parentDir].push(newDir);
            fs[target] = [];
            return null;
        } else {
            return `mkdir: cannot create directory '${args[0]}': No such file or directory`;
        }
    },
    touch: (args) => {
        if (!args[0]) return "touch: missing file operand";
        let target = resolvePath(args[0]);
        if (fs[target]) return null;
        if (fileContents[target] !== undefined) return null;

        let targetParts = target.split("/");
        let newFile = targetParts.pop();
        let parentDir = targetParts.join("/") || "/";

        if (fs[parentDir]) {
            fs[parentDir].push(newFile);
            fileContents[target] = "";
            return null;
        } else {
            return `touch: cannot touch '${args[0]}': No such file or directory`;
        }
    },
    echo: (args) => args.join(" "),
    sudo: () => "user is not in the sudoers file. This incident will be reported.",
    history: () => commandHistory.map((cmd, index) => `  ${index + 1}  ${cmd}`).join("\n"),
    neofetch: () => {
        let displayPath = currentDir.replace("/root", "~");
        return `<div style="display:flex; gap:20px; color:inherit;">
        <div style="color:#e95420; font-weight:bold;">
                 .-/+oossssoo+/-.               <br>
             \`:+ssssssssssssssssss+:\`          <br>
           -+ssssssssssssssssssyyssss+-        <br>
         .ossssssssssssssssssdMMMNysssso.      <br>
        /ssssssssssshdmmNNmmyNMMMMhssssss/     <br>
       +ssssssssshmydMMMMMMMNddddyssssssss+    <br>
      /sssssssshNMMMyhhyyyyhmNMMMNhssssssss/   <br>
     .ssssssssdMMMNhsssssssssshNMMMdssssssss.  <br>
     +sssshhhyNMMNyssssssssssssyNMMMysssssss+  <br>
     ossyNMMMNyMMhsssssssssssssshmmmhssssssso  <br>
     ossyNMMMNyMMhsssssssssssssshmmmhssssssso  <br>
     +sssshhhyNMMNyssssssssssssyNMMMysssssss+  <br>
     .ssssssssdMMMNhsssssssssshNMMMdssssssss.  <br>
      /sssssssshNMMMyhhyyyyhdNMMMNhssssssss/   <br>
       +sssssssssdmydMMMMMMMMddddyssssssss+    <br>
        /ssssssssssshdmNNNNmyNMMMMhssssss/     <br>
         .ossssssssssssssssssdMMMNysssso.      <br>
           -+sssssssssssssssssyyyssss+-        <br>
             \`:+ssssssssssssssssss+:\`          <br>
                 .-/+oossssoo+/-.              
        </div>
        <div>
           <span style="color:#e95420; font-weight:bold;">root@ubuntu</span><br>
           -----------------<br>
           <span style="color:#e95420; font-weight:bold;">OS</span>: Ubuntu 22.04.3 LTS (Web Sim)<br>
           <span style="color:#e95420; font-weight:bold;">Host</span>: Web Terminal Virtual Machine<br>
           <span style="color:#e95420; font-weight:bold;">Kernel</span>: 5.15.0-generic-js<br>
           <span style="color:#e95420; font-weight:bold;">Uptime</span>: 1 min<br>
           <span style="color:#e95420; font-weight:bold;">Packages</span>: 1842 (dpkg)<br>
           <span style="color:#e95420; font-weight:bold;">Shell</span>: bash (simulated)<br>
           <span style="color:#e95420; font-weight:bold;">Terminal</span>: HTML/JS Web Simulator<br>
           <span style="color:#e95420; font-weight:bold;">CPU</span>: Virtual Machine Core @ 2.50GHz<br>
           <span style="color:#e95420; font-weight:bold;">Memory</span>: 2048MiB / 8192MiB<br>
        </div></div>`;
    },
    top: () => `top - 10:15:30 up  1:01,  1 user,  load average: 0.00, 0.00, 0.00
Tasks: 181 total,   1 running, 180 sleeping,   0 stopped,   0 zombie
%Cpu(s):  0.3 us,  0.1 sy,  0.0 ni, 99.6 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   7950.4 total,   5314.1 free,   1186.7 used,   1449.6 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   6473.5 avail Mem 

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
      1 root      20   0  167180  11340   8340 S   0.0   0.1   0:01.24 systemd
    842 root      20   0   42952  18164  11520 S   0.0   0.2   0:00.67 networkd
  23145 user      20   0   14344   3244   2820 R   0.3   0.0   0:00.01 top
     10 root      20   0       0      0      0 S   0.0   0.0   0:00.00 rcu_tasks_k
     11 root      20   0       0      0      0 S   0.0   0.0   0:00.00 ksoftirqd/0`,
    ifconfig: () => `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.104  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::a00:27ff:fe85:3f2a  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:85:3f:2a  txqueuelen 1000  (Ethernet)
        RX packets 435  bytes 314480 (314.4 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 210  bytes 24204 (24.2 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 120  bytes 10200 (10.2 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 120  bytes 10200 (10.2 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0`,
    ping: (args) => {
        let host = args[0] || "google.com";
        return `PING ${host} (142.250.190.46) 56(84) bytes of data.\n64 bytes from ${host} (142.250.190.46): icmp_seq=1 ttl=115 time=14.2 ms\n64 bytes from ${host} (142.250.190.46): icmp_seq=2 ttl=115 time=12.1 ms\n64 bytes from ${host} (142.250.190.46): icmp_seq=3 ttl=115 time=13.0 ms\n64 bytes from ${host} (142.250.190.46): icmp_seq=4 ttl=115 time=14.5 ms\n\n--- ${host} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss, time 3004ms\nrtt min/avg/max/mdev = 12.110/13.450/14.500/0.957 ms`;
    },
    nmap: (args) => {
        let host = args[0] || "127.0.0.1";
        return `Starting Nmap 7.80 ( https://nmap.org ) at 2026-03-03 10:20 IST\nNmap scan report for ${host}\nHost is up (0.00012s latency).\nNot shown: 997 closed ports\nPORT    STATE SERVICE\n22/tcp  open  ssh\n80/tcp  open  http\n443/tcp open  https\n\nNmap done: 1 IP address (1 host up) scanned in 0.08 seconds`;
    }
};

// Advanced Mock Commands (Apt/Installing)
commands.apt = (args) => {
    if (args[0] === "update") {
        return `Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease\nGet:2 http://archive.ubuntu.com/ubuntu jammy-updates InRelease [119 kB]\nGet:3 http://archive.ubuntu.com/ubuntu jammy-security InRelease [110 kB]\nFetched 229 kB in 1s (234 kB/s)\nReading package lists... Done\nBuilding dependency tree... Done\nReading state information... Done\nAll packages are up to date.`;
    } else if (args[0] === "install" && args[1]) {
        return `Reading package lists... Done\nBuilding dependency tree... Done\nReading state information... Done\nThe following NEW packages will be installed:\n  ${args[1]}\n0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.\nNeed to get 15.2 MB of archives.\nAfter this operation, 45.1 MB of additional disk space will be used.\nGet:1 http://archive.ubuntu.com/ubuntu jammy/main amd64 ${args[1]} amd64 [15.2 MB]\nFetched 15.2 MB in 2s (7.6 MB/s)\nSelecting previously unselected package ${args[1]}.\nPreparing to unpack .../${args[1]}.deb ...\nUnpacking ${args[1]} ...\nSetting up ${args[1]} ...\nProcessing triggers for man-db ...`;
    } else {
        return "apt: This command is a mock. Try 'apt update' or 'apt install package-name'";
    }
}
commands["apt-get"] = commands.apt;

// ==========================================
// FILE & DIRECTORY MOCKS
// ==========================================
commands.rmdir = () => "rmdir: missing operand";
commands.rm = () => "rm: missing operand";
commands.cp = () => "cp: missing file operand";
commands.mv = () => "mv: missing file operand";
commands.chmod = () => "chmod: missing operand";
commands.wc = () => "0 0 0";
commands.grep = () => "Usage: grep [OPTION]... PATTERNS [FILE]...";
commands.tr = () => "tr: missing operand";
commands.sort = () => "sort: missing operand";
commands.head = () => "head: missing operand";
commands.tail = () => "tail: missing operand";
commands.diff = () => "diff: missing operand";
commands.comm = () => "comm: missing operand";
commands.less = () => "Opening mock pager... (Press 'q' to quit)";
commands.more = () => "Opening mock pager... (Press 'q' to quit)";
commands.file = () => "file: missing operand";
commands.type = (args) => args[0] ? `${args[0]} is a tracked mock command` : "type: missing operand";
commands.split = () => "split: missing operand";
commands.cmp = () => "cmp: missing operand";
commands.tar = () => "tar: option requires an argument -- 'f'";
commands.find = () => ".";
commands.vim = () => "Opening mock Vim editor... (Press :wq to exit)";
commands.gzip = () => "gzip: compressed data not written to a terminal.";
commands.bzip2 = () => "bzip2: I won't write compressed data to a terminal.";
commands.unzip = () => "UnZip 6.00 of 20 April 2009, by Debian. Original by Info-ZIP.";
commands.locate = () => "locate: no pattern to search for specified";
commands.cal = () => "      March 2026\nSu Mo Tu We Th Fr Sa\n 1  2  3  4  5  6  7\n 8  9 10 11 12 13 14\n15 16 17 18 19 20 21\n22 23 24 25 26 27 28\n29 30 31";
commands.tty = () => "/dev/pts/0";
commands.bc = () => "bc 1.07.1\nCopyright 1991-1994, 1997, 1998, 2000, 2004, 2006, 2008, 2012-2017 Free Software Foundation, Inc.";
commands.exit = () => "logout";
commands.man = (args) => args[0] ? `No manual entry for ${args[0]}` : "What manual page do you want?";
commands.which = (args) => args[0] ? `/usr/bin/${args[0]}` : "";
commands.lp = () => "lp: Error - no default destination available.";
commands.lpr = () => "lpr: Error - no default destination available.";
commands.lpstat = () => "no system default destination";
commands.lpq = () => "lpq: Error - no default destination available.";
commands.lprm = () => "lprm: Error - no default destination available.";
commands.cancel = () => "cancel: missing operand";
commands.who = () => "root     pts/0        2026-03-03 10:00";

// ==========================================
// USER & SYSTEM MANAGEMENT MOCKS
// ==========================================
commands.su = () => "su: Authentication failure";
commands.login = () => "login: cannot run from a terminal";
commands.logout = () => "Not login shell: use `exit'";
commands.passwd = () => "Changing password for root.\nNew password:";
commands.useradd = () => "useradd: Permission denied. (Mock)";
commands.adduser = () => "adduser: Only root may add a user or group to the system.";
commands.usermod = () => "usermod: no flags given";
commands.userdel = () => "userdel: no flags given";
commands.groupadd = () => "groupadd: no flags given";
commands.groupmod = () => "groupmod: no flags given";
commands.groupdel = () => "groupdel: no flags given";
commands.gpasswd = () => "gpasswd: no flags given";
commands.chown = () => "chown: missing operand";
commands.chage = () => "Usage: chage [options] LOGIN";
commands.chgrp = () => "chgrp: missing operand";
commands.chfn = () => "chfn: Permission denied.";

// ==========================================
// PROCESS & PERFORMANCE MANAGEMENT MOCKS
// ==========================================
commands.ps = () => "  PID TTY          TIME CMD\n    1 pts/0    00:00:00 bash\n   10 pts/0    00:00:00 ps";
commands.pstree = () => "systemd─┬─NetworkManager─┬─2*[dhclient]\n        │                └─2*[resolvconf]\n        ├─bash───pstree";
commands.nice = () => "0";
commands.kill = () => "kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]";
commands.pkill = () => "pkill: missing operand";
commands.killall = () => "killall: missing operand";
commands.xkill = () => "Select the window whose client you wish to kill with button 1....";
commands.fg = () => "bash: fg: current: no such job";
commands.bg = () => "bash: bg: current: no such job";
commands.pgrep = () => "pgrep: missing operand";
commands.renice = () => "renice: missing operand";
commands.free = () => "               total        used        free      shared  buff/cache   available\nMem:         8141208     1215284     5441632       12344     1484292     6628676\nSwap:        2097148           0     2097148";
commands["/proc/meminfo"] = () => "bash: /proc/meminfo: Permission denied (Try 'cat /proc/meminfo')";
commands.htop = () => "Opening mock htop view...";
commands.df = () => "Filesystem     1K-blocks    Used Available Use% Mounted on\n/dev/sda1       50000000 15000000  35000000  30% /\ntmpfs            4070604       0   4070604   0% /dev/shm";
commands.du = () => "4       ./Documents\n4       ./Downloads\n8       .";
commands.vmstat = () => "procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----\n r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st\n 1  0      0 5441632  48240 1436052    0    0    12     5   45   60  1  0 99  0  0";
commands.demidecode = () => "dmidecode: command not found (Try 'sudo dmidecode')";
commands.sar = () => "Linux 5.15.0-generic (ubuntu)   03/03/2026      _x86_64_        (4 CPU)\n\n10:00:01 AM       LINUX RESTART";
commands.pagesize = () => "4096";

// ==========================================
// NETWORKING MOCKS
// ==========================================
commands.traceroute = (args) => args[0] ? `traceroute to ${args[0]} (93.184.216.34), 30 hops max, 60 byte packets\n 1  router.local (192.168.1.1)  1.234 ms\n 2  isp.gateway (10.0.0.1)  10.456 ms\n 3  * * *` : "Usage: traceroute host";
commands.netstat = () => "Active Internet connections (w/o servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State\ntcp        0      0 ubuntu:53422            ec2-54-204-12-3:https ESTABLISHED";
commands.nslookup = (args) => args[0] ? `Server:         127.0.0.53\nAddress:        127.0.0.53#53\n\nNon-authoritative answer:\nName:   ${args[0]}\nAddress: 93.184.216.34` : "Usage: nslookup host";
commands.whois = () => "whois: missing operand";
commands.hostname = () => "ubuntu";
commands.tcpdump = () => "tcpdump: verbose output suppressed, use -v or -vv for full protocol decode\nlistening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes";
commands.dig = (args) => args[0] ? `; <<>> DiG 9.18.1-1ubuntu1.2-Ubuntu <<>> ${args[0]}\n;; global options: +cmd\n;; Got answer:\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 4567\n;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1\n\n;; ANSWER SECTION:\n${args[0]}.           300     IN      A       93.184.216.34` : "Usage: dig host";
commands.route = () => "Kernel IP routing table\nDestination     Gateway         Genmask         Flags Metric Ref    Use Iface\ndefault         router.local    0.0.0.0         UG    100    0        0 eth0\n192.168.1.0     0.0.0.0         255.255.255.0   U     100    0        0 eth0";
commands.host = (args) => args[0] ? `${args[0]} has address 93.184.216.34` : "Usage: host [name]";
commands.arp = () => "Address                  HWtype  HWaddress           Flags Mask            Iface\nrouter.local             ether   00:11:22:33:44:55   C                     eth0";
commands.iwconfig = () => "lo        no wireless extensions.\n\neth0      no wireless extensions.";
commands.curl = (args) => args[0] ? `<html>\n<head><title>Mock Response for ${args[0]}</title></head>\n<body><h1>Success!</h1></body>\n</html>` : "curl: try 'curl --help' or 'curl --manual' for more information";
commands.wget = (args) => args[0] ? `--2026-03-03 10:00:00--  ${args[0]}\nResolving ${args[0]} (${args[0]})... 93.184.216.34\nConnecting to ${args[0]}... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 1256 (1.2K) [text/html]\nSaving to: 'index.html'\n\n     0K .                                                     100% 12.3M=0s` : "wget: missing URL";
commands.telnet = () => "telnet: missing host";
commands.ifplugstatus = () => "eth0: link beat detected";
commands.nload = () => "nload: mock visualizer (press ctrl+c to exit)";
commands.w = () => " 10:00:01 up 1 min,  1 user,  load average: 0.00, 0.00, 0.00\nUSER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\nroot     pts/0    192.168.1.100    09:59    1.00s  0.02s  0.00s bash";
commands.mail = () => "No mail for root";


// Enter key to process commands
inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        let inputStr = inputField.value.trim();
        inputField.value = "";

        let displayPath = currentDir.replace("/root", "~");
        // Update prompt string to map to root instead of user
        let promptHtml = `<span class="prompt"><span class="user">root@ubuntu</span>:<span class="path">${displayPath}</span>#</span> ${inputStr}`;
        print(promptHtml, true);

        if (inputStr) {
            commandHistory.push(inputStr);
            historyIndex = commandHistory.length;

            // Basic rudimentary string parsing 
            let parts = inputStr.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
            let cmd = parts[0];
            let args = parts.slice(1).map(arg => arg.replace(/^"|"$/g, "").replace(/^'|'$/g, ""));

            if (commands[cmd]) {
                let out = commands[cmd](args);
                if (out !== null) {
                    if (cmd === "neofetch") print(out, true); // Keep HTML spacing for stats logo
                    else print(out);
                }
            } else {
                print(`${cmd}: command not found`);
            }
        }
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            inputField.value = commandHistory[historyIndex];
        }
    } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            inputField.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            inputField.value = "";
        }
    }
});


// ----------------------------------------------------
// UI Interactions (Theme and Sidebar)
// ----------------------------------------------------

const themeBtn = document.getElementById("theme-toggle");
const terminalWindow = document.getElementById("terminal-window");

const sunIconSVG = `<svg class="icon theme-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
</svg>`;

const moonIconSVG = `<svg class="icon theme-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
</svg>`;

themeBtn.addEventListener("click", () => {
    if (terminalWindow.classList.contains("dark-mode")) {
        terminalWindow.classList.remove("dark-mode");
        terminalWindow.classList.add("light-mode");
        themeBtn.innerHTML = moonIconSVG;
        themeBtn.title = "Switch to Dark Mode";
    } else {
        terminalWindow.classList.remove("light-mode");
        terminalWindow.classList.add("dark-mode");
        themeBtn.innerHTML = sunIconSVG;
        themeBtn.title = "Switch to Light Mode";
    }
});

// Help Sidebar Toggle
const helpBtn = document.getElementById("help-toggle");
const sidebar = document.getElementById("terminal-sidebar");

helpBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

// Sidebar Command Search and Population
const commandDocs = [
    { name: "help", desc: "Show help message" },
    { name: "clear", desc: "Clear the terminal screen" },
    { name: "ls", desc: "List directory contents" },
    { name: "cd [dir]", desc: "Change directory" },
    { name: "pwd", desc: "Print working directory" },
    { name: "cat [file]", desc: "Print files content" },
    { name: "mkdir [dir]", desc: "Make directories" },
    { name: "touch [file]", desc: "Create empty file" },
    { name: "echo [text]", desc: "Print text to terminal" },
    { name: "whoami", desc: "Print effective userid" },
    { name: "date", desc: "Print the system date" },
    { name: "history", desc: "Print Command History" },
    { name: "neofetch", desc: "Show system info with ASCII art" },
    { name: "sudo", desc: "Execute command as superuser" },
    { name: "apt update", desc: "Update package list" },
    { name: "apt install [pkg]", desc: "Install a package" },
    { name: "top", desc: "Monitor system processes" },
    { name: "ifconfig", desc: "Show network interfaces" },
    { name: "ping [host]", desc: "Send ICMP ECHO_REQUEST" },
    { name: "nmap [host]", desc: "Network exploration tool" }
];

const commandListEl = document.getElementById("command-list");
const commandSearchEl = document.getElementById("command-search");

function renderCommands(filterText = "") {
    commandListEl.innerHTML = "";
    const lowerFilter = filterText.toLowerCase();

    commandDocs
        .filter(c => c.name.toLowerCase().includes(lowerFilter) || c.desc.toLowerCase().includes(lowerFilter))
        .forEach(c => {
            const li = document.createElement("li");
            li.innerHTML = `<span class="cmd-name">${c.name}</span><span class="cmd-desc">${c.desc}</span>`;
            li.addEventListener("click", () => {
                const baseCmd = c.name.split(" ")[0];
                if (c.name.includes("[")) {
                    inputField.value = baseCmd + " ";
                } else {
                    inputField.value = baseCmd;
                }
                inputField.focus();

                // Close sidebar automatically on mobile
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove("open");
                }
            });
            commandListEl.appendChild(li);
        });
}

commandSearchEl.addEventListener("input", (e) => {
    renderCommands(e.target.value);
});

// Initialize sidebar
renderCommands();

// Boot screen (only runs after login now, so we decouple this slightly)
function initTerminal() {
    print("Welcome to the Ubuntu Web Terminal!", false);
    print("Click the book icon in the top right, or type 'help' to see available commands.", false);

    // Update the static prompt element in HTML to reflect root
    document.querySelector(".prompt .user").textContent = "root@ubuntu";
    document.querySelector(".prompt").innerHTML = document.querySelector(".prompt").innerHTML.replace('$', '#');

    updatePrompt();
    inputField.focus();
}

// ----------------------------------------------------
// Login Flow Logic
// ----------------------------------------------------

/*
 * © 2026 UbuntuLite. All rights reserved.
 * UbuntuLite JavaScript Logic & Virtual File System
 */

const loginScreen = document.getElementById("login-screen");
const desktopView = document.getElementById("desktop-view");
const loginPassInput = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const togglePassBtn = document.getElementById("toggle-password");
const togglePassSvg = togglePassBtn.querySelector("svg");

// Password Visibility Toggle Logic
togglePassBtn.addEventListener("click", () => {
    if (loginPassInput.type === "password") {
        loginPassInput.type = "text";
        togglePassSvg.classList.add("crossed");
    } else {
        loginPassInput.type = "password";
        togglePassSvg.classList.remove("crossed");
    }
});

function processLogin() {
    const password = loginPassInput.value;
    if (password === "root123") {
        // Success
        loginScreen.style.opacity = "0";
        setTimeout(() => {
            loginScreen.style.display = "none";
            desktopView.style.display = "flex";
            // Do not show terminal immediately, wait for user to click dock icon
        }, 500); // Wait for fade out
    } else {
        // Failure
        loginError.classList.add("show");
        loginPassInput.value = "";
        loginPassInput.focus();

        // Shake effect on the password box
        const passBox = document.querySelector(".password-box");
        passBox.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ], { duration: 400, iterations: 1 });
    }
}

loginBtn.addEventListener("click", processLogin);
loginPassInput.addEventListener("keydown", (e) => {
    // Hide error when user starts typing again
    loginError.classList.remove("show");
    if (e.key === "Enter") {
        processLogin();
    }
});

// ----------------------------------------------------
// Desktop Window Management Logic
// ----------------------------------------------------

// Window element references
const dockTerminal = document.getElementById("dock-terminal");
const dockHome = document.getElementById("dock-home");
const folderWindow = document.getElementById("folder-window");
const termClose = document.getElementById("term-close");
const folderClose = document.getElementById("folder-close");

// Folder navigation references
const folderTitle = document.getElementById("folder-title");
const folderPathDisplay = document.getElementById("folder-path-display");
const folderBackBtn = document.getElementById("folder-back-btn");

// Text editor Window elements
const editorWindow = document.getElementById("text-editor-window");
const editorClose = document.getElementById("editor-close");
const editorMinimize = document.getElementById("editor-min");
const editorMaximize = document.getElementById("editor-max");
const editorTitle = document.getElementById("editor-title");
const editorTextarea = document.getElementById("editor-textarea");
const editorSaveBtn = document.getElementById("editor-save-btn");

// Settings Window elements
const settingsWindow = document.getElementById("settings-window");
const settingsClose = document.getElementById("settings-close");
const settingsMinimize = document.getElementById("settings-min");
const settingsMaximize = document.getElementById("settings-max");
const themeCards = document.querySelectorAll(".theme-card");

// Terminal window buttons
const termMinimize = terminalWindow.querySelector(".minimize");
const termMaximize = terminalWindow.querySelector(".maximize");

// Folder window buttons
const folderMinimize = folderWindow.querySelector(".minimize");
const folderMaximize = folderWindow.querySelector(".maximize");
const folderContent = folderWindow.querySelector(".folder-content");

let terminalInitialized = false;
let currentFolderViewPath = "/root";

// Function to render folder window contents based on our JS virtual file system
function renderFolderContents(path) {
    currentFolderViewPath = path;
    folderContent.innerHTML = "";
    folderPathDisplay.textContent = path;

    // Update title based on folder
    const pathParts = path.split("/").filter(p => p !== "");
    folderTitle.textContent = pathParts.length > 0 ? pathParts[pathParts.length - 1] : "Root";

    // Disable back button if at root
    folderBackBtn.disabled = path === "/root";

    const items = fs[path] || [];

    if (items.length === 0) {
        folderContent.innerHTML = `<div style="width: 100%; text-align: center; color: rgba(255,255,255,0.5); padding-top: 20px;">Folder is empty</div>`;
        return;
    }

    items.forEach(item => {
        const itemFullPath = path === "/" ? `/${item}` : `${path}/${item}`;
        const isDir = fs[itemFullPath] !== undefined;
        let iconSvg;

        if (isDir) {
            iconSvg = `<svg class="file-icon folder-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
        } else {
            iconSvg = `<svg class="file-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;
        }

        const div = document.createElement("div");
        div.className = "folder-item";
        div.innerHTML = `
            ${iconSvg}
            <span>${item}</span>
        `;

        // INTERACTIVITY LOGIC
        div.addEventListener("click", () => {
            if (isDir) {
                renderFolderContents(itemFullPath);
            } else {
                openTextEditor(itemFullPath, item);
            }
        });

        folderContent.appendChild(div);
    });
}

let currentOpenFileFullPath = "";

function openTextEditor(fullPath, fileName) {
    currentOpenFileFullPath = fullPath;
    editorTitle.textContent = fileName;
    editorTextarea.value = fileContents[fullPath] || "";
    editorWindow.style.display = "flex";
    editorWindow.style.opacity = "1";
    bringToFront(editorWindow);
}

if (editorSaveBtn) {
    editorSaveBtn.addEventListener("click", () => {
        if (currentOpenFileFullPath !== "") {
            fileContents[currentOpenFileFullPath] = editorTextarea.value;
            editorSaveBtn.textContent = "Saved!";
            setTimeout(() => {
                editorSaveBtn.textContent = "Save";
            }, 1500);
        }
    });
}

folderBackBtn.addEventListener("click", () => {
    if (currentFolderViewPath === "/root") return;

    const parts = currentFolderViewPath.split("/");
    parts.pop();
    const parentPath = parts.length > 1 ? parts.join("/") : "/";
    if (parentPath.startsWith("/root") || parentPath === "/root") {
        renderFolderContents(parentPath);
    } else {
        renderFolderContents("/root");
    }
});

function bringToFront(winElement) {
    terminalWindow.style.zIndex = "10";
    folderWindow.style.zIndex = "10";
    editorWindow.style.zIndex = "10";
    settingsWindow.style.zIndex = "10";
    winElement.style.zIndex = "20";
}

// ----------------------------------------------------
// Dock App Launching & Minimizing
// ----------------------------------------------------
dockTerminal.addEventListener("click", () => {
    if (terminalWindow.style.display === "none") {
        // First boot or restoring from close
        if (!terminalInitialized) {
            initTerminal();
            terminalInitialized = true;
        }
        terminalWindow.style.display = "flex";
        terminalWindow.style.opacity = "1";
    } else if (terminalWindow.style.opacity === "0") {
        // Restoring from minimize
        terminalWindow.style.opacity = "1";
        terminalWindow.style.pointerEvents = "auto";
    } else if (Number(terminalWindow.style.zIndex) === 20) {
        // Currently focused -> Minimize
        terminalWindow.style.opacity = "0";
        terminalWindow.style.pointerEvents = "none";
    }

    // Bring to front
    if (terminalWindow.style.opacity !== "0") {
        bringToFront(terminalWindow);
        inputField.focus();
    }
});

dockHome.addEventListener("click", () => {
    if (folderWindow.style.display === "none") {
        // Restoring from close
        renderFolderContents("/root");
        folderWindow.style.display = "flex";
        folderWindow.style.opacity = "1";
    } else if (folderWindow.style.opacity === "0") {
        // Restoring from minimize
        folderWindow.style.opacity = "1";
        folderWindow.style.pointerEvents = "auto";
    } else if (Number(folderWindow.style.zIndex) === 20) {
        // Currently focused -> Minimize
        folderWindow.style.opacity = "0";
        folderWindow.style.pointerEvents = "none";
    }

    if (folderWindow.style.opacity !== "0") {
        bringToFront(folderWindow);
    }
});

const desktopHomeIcon = document.getElementById("desktop-home-icon");
if (desktopHomeIcon) {
    desktopHomeIcon.addEventListener("click", () => {
        dockHome.click();
    });
}

const dockSettings = document.getElementById("dock-settings");
if (dockSettings) {
    dockSettings.addEventListener("click", () => {
        if (settingsWindow.style.display === "none") {
            settingsWindow.style.display = "flex";
            settingsWindow.style.opacity = "1";
        } else if (settingsWindow.style.opacity === "0") {
            settingsWindow.style.opacity = "1";
            settingsWindow.style.pointerEvents = "auto";
        } else if (Number(settingsWindow.style.zIndex) === 20) {
            settingsWindow.style.opacity = "0";
            settingsWindow.style.pointerEvents = "none";
        }

        if (settingsWindow.style.opacity !== "0") {
            bringToFront(settingsWindow);
        }
    });
}

// ----------------------------------------------------
// Theme Changing Logic
// ----------------------------------------------------
themeCards.forEach(card => {
    card.addEventListener("click", () => {
        const bgVal = card.getAttribute("data-bg");
        document.body.style.background = bgVal;

        // Disable gradient animation for static themes
        if (bgVal.includes("gradient")) {
            document.body.style.backgroundSize = "400% 400%";
            document.body.style.animation = "gradientBG 15s ease infinite";
        } else {
            document.body.style.backgroundSize = "cover";
            document.body.style.animation = "none";
        }
    });
});

// ----------------------------------------------------
// Window Titlebar Buttons
// ----------------------------------------------------

// Close
termClose.addEventListener("click", () => { terminalWindow.style.display = "none"; });
folderClose.addEventListener("click", () => { folderWindow.style.display = "none"; });
editorClose.addEventListener("click", () => { editorWindow.style.display = "none"; });
settingsClose.addEventListener("click", () => { settingsWindow.style.display = "none"; });

// Minimize
termMinimize.addEventListener("click", () => {
    terminalWindow.style.opacity = "0";
    terminalWindow.style.pointerEvents = "none";
});
folderMinimize.addEventListener("click", () => {
    folderWindow.style.opacity = "0";
    folderWindow.style.pointerEvents = "none";
});
editorMinimize.addEventListener("click", () => {
    editorWindow.style.opacity = "0";
    editorWindow.style.pointerEvents = "none";
});
settingsMinimize.addEventListener("click", () => {
    settingsWindow.style.opacity = "0";
    settingsWindow.style.pointerEvents = "none";
});

// Maximize Toggle
function toggleMaximize(winElement) {
    if (winElement.classList.contains("maximized")) {
        winElement.classList.remove("maximized");
    } else {
        winElement.classList.add("maximized");
    }
}
termMaximize.addEventListener("click", () => toggleMaximize(terminalWindow));
folderMaximize.addEventListener("click", () => toggleMaximize(folderWindow));
editorMaximize.addEventListener("click", () => toggleMaximize(editorWindow));
settingsMaximize.addEventListener("click", () => toggleMaximize(settingsWindow));

// ----------------------------------------------------
// Window Focus Layering
// ----------------------------------------------------
terminalWindow.addEventListener("mousedown", () => bringToFront(terminalWindow));
folderWindow.addEventListener("mousedown", () => bringToFront(folderWindow));
editorWindow.addEventListener("mousedown", () => bringToFront(editorWindow));
settingsWindow.addEventListener("mousedown", () => bringToFront(settingsWindow));
